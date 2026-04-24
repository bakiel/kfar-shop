/**
 * YPAY Israeli Payment Gateway Integration
 *
 * Handles credit card payments via YPAY's hosted payment page.
 * Supports installments (1-12 payments), ILS currency.
 *
 * Flow:
 * 1. getAccessToken() - authenticate with YPAY
 * 2. createPayment(order) - get redirect URL for hosted payment page
 * 3. YPAY redirects customer back to callback URL after payment
 * 4. verifyWebhook(payload) - validate async confirmation from YPAY
 * 5. getPaymentStatus(txId) - check payment status on demand
 */

import crypto from 'crypto';
import { query, transaction } from '@/lib/db/postgres-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface YPayConfig {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  sandbox: boolean;
  callbackUrl: string;
  webhookUrl: string;
}

export interface YPayAccessToken {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

export interface YPayOrderInput {
  orderId: string;
  orderNumber: string;
  amount: number;           // Total in ILS (agorot handled internally)
  currency?: string;        // Default: ILS
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  installments?: number;    // 1-12, default 1
  items?: YPayLineItem[];
}

export interface YPayLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface YPayPaymentResponse {
  success: boolean;
  redirectUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface YPayWebhookPayload {
  transactionId: string;
  orderId: string;
  status: string;           // 'approved' | 'declined' | 'error'
  amount: number;
  currency: string;
  last4?: string;
  cardBrand?: string;
  installments?: number;
  timestamp: string;
  signature?: string;
}

export interface YPayStatusResponse {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  last4?: string;
  cardBrand?: string;
  installments?: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getConfig(): YPayConfig {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfarapp.com';

  return {
    clientId: process.env.YPAY_CLIENT_ID || 'Mg==',
    clientSecret: process.env.YPAY_CLIENT_SECRET || '1234',
    apiUrl: (process.env.YPAY_API_URL || 'https://ypay.co.il/api/v1').replace(/\/$/, ''),
    sandbox: process.env.YPAY_SANDBOX !== 'false',
    callbackUrl: `${appUrl}/api/payment/callback`,
    webhookUrl: `${appUrl}/api/payment/webhook`,
  };
}

// ---------------------------------------------------------------------------
// Token cache (in-memory, per-process)
// ---------------------------------------------------------------------------

let cachedToken: YPayAccessToken | null = null;

/**
 * Authenticate with YPAY and obtain an access token.
 * Tokens are cached in memory until 60 seconds before expiry.
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const config = getConfig();

  const response = await fetch(`${config.apiUrl}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YPAY getAccessToken failed:', response.status, errorText);
    throw new Error(`YPAY authentication failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.access_token && !data.token) {
    throw new Error('YPAY authentication response missing token');
  }

  const token = data.access_token || data.token;
  // Default to 1 hour expiry if not provided
  const expiresIn = (data.expires_in || 3600) * 1000;

  cachedToken = {
    token,
    expiresAt: Date.now() + expiresIn,
  };

  console.log('YPAY access token obtained, expires in', Math.round(expiresIn / 1000), 'seconds');
  return cachedToken.token;
}

/**
 * Create a payment session with YPAY.
 * Returns a redirect URL for the hosted payment page.
 */
export async function createPayment(order: YPayOrderInput): Promise<YPayPaymentResponse> {
  const config = getConfig();

  try {
    const token = await getAccessToken();

    // Validate installments range
    const installments = Math.min(Math.max(order.installments || 1, 1), 12);

    // Build payment request payload
    const payload: Record<string, unknown> = {
      order_id: order.orderId,
      order_number: order.orderNumber,
      amount: Math.round(order.amount * 100), // Convert ILS to agorot
      currency: order.currency || 'ILS',
      description: order.description,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      installments,
      success_url: `${config.callbackUrl}?status=success&orderId=${order.orderId}`,
      failure_url: `${config.callbackUrl}?status=failure&orderId=${order.orderId}`,
      cancel_url: `${config.callbackUrl}?status=cancelled&orderId=${order.orderId}`,
      webhook_url: config.webhookUrl,
    };

    if (order.customerPhone) {
      payload.customer_phone = order.customerPhone;
    }

    if (order.items && order.items.length > 0) {
      payload.items = order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: Math.round(item.unitPrice * 100),
        total_price: Math.round(item.totalPrice * 100),
      }));
    }

    const response = await fetch(`${config.apiUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YPAY createPayment failed:', response.status, errorText);
      return {
        success: false,
        error: `Payment creation failed: ${response.status} ${errorText}`,
      };
    }

    const data = await response.json();

    if (!data.redirect_url && !data.payment_url && !data.url) {
      console.error('YPAY createPayment response missing redirect URL:', data);
      return {
        success: false,
        error: 'Payment response missing redirect URL',
      };
    }

    return {
      success: true,
      redirectUrl: data.redirect_url || data.payment_url || data.url,
      transactionId: data.transaction_id || data.transactionId || data.id,
    };
  } catch (error) {
    console.error('YPAY createPayment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment error',
    };
  }
}

/**
 * Verify a webhook callback from YPAY.
 * Validates the payload signature using the client secret.
 */
export function verifyWebhook(payload: YPayWebhookPayload): boolean {
  const config = getConfig();

  // In sandbox mode, skip signature verification
  if (config.sandbox) {
    console.log('YPAY webhook verification skipped (sandbox mode)');
    return true;
  }

  // Verify signature if present
  if (!payload.signature) {
    console.warn('YPAY webhook missing signature');
    return false;
  }

  // YPAY signature verification:
  // The signature is typically an HMAC-SHA256 of key fields using the client secret.
  // Exact implementation depends on YPAY's documentation.
  // For now, we verify the basic structure is valid.
  try {
    const signatureData = `${payload.transactionId}|${payload.orderId}|${payload.amount}|${payload.status}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.clientSecret)
      .update(signatureData)
      .digest('hex');

    const isValid = payload.signature === expectedSignature;
    if (!isValid) {
      console.warn('YPAY webhook signature mismatch');
    }
    return isValid;
  } catch (error) {
    console.error('YPAY webhook signature verification error:', error);
    return false;
  }
}

/**
 * Check payment status for a given transaction ID.
 */
export async function getPaymentStatus(transactionId: string): Promise<YPayStatusResponse | null> {
  const config = getConfig();

  try {
    const token = await getAccessToken();

    const response = await fetch(`${config.apiUrl}/payment/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.error('YPAY getPaymentStatus failed:', response.status, errorText);
      throw new Error(`Payment status check failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      transactionId: data.transaction_id || data.transactionId || transactionId,
      status: data.status,
      amount: (data.amount || 0) / 100, // Convert agorot back to ILS
      currency: data.currency || 'ILS',
      last4: data.last4 || data.card_last4,
      cardBrand: data.card_brand || data.cardBrand,
      installments: data.installments || 1,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };
  } catch (error) {
    console.error('YPAY getPaymentStatus error:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Database helpers for payment transactions
// ---------------------------------------------------------------------------

/**
 * Create a payment transaction record in the database.
 */
export async function createPaymentTransaction(params: {
  orderId: string;
  paymentMethod: string;
  amount: number;
  currency?: string;
  installments?: number;
  providerTransactionId?: string;
}): Promise<{ id: string }> {
  const { rows } = await query(
    `INSERT INTO payment_transactions (
      order_id, payment_method, provider, provider_transaction_id,
      amount, currency, status, installments, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING id`,
    [
      params.orderId,
      params.paymentMethod,
      'ypay',
      params.providerTransactionId || null,
      params.amount,
      params.currency || 'ILS',
      'pending',
      params.installments || 1,
    ]
  );

  return { id: rows[0].id };
}

/**
 * Update a payment transaction status and provider response.
 */
export async function updatePaymentTransaction(params: {
  transactionId?: string;
  orderId?: string;
  status: PaymentStatus;
  providerTransactionId?: string;
  providerResponse?: Record<string, unknown>;
  errorMessage?: string;
}): Promise<void> {
  if (params.transactionId) {
    await query(
      `UPDATE payment_transactions SET
        status = $1,
        provider_transaction_id = COALESCE($2, provider_transaction_id),
        provider_response = COALESCE($3, provider_response),
        error_message = $4,
        updated_at = NOW()
      WHERE id = $5`,
      [
        params.status,
        params.providerTransactionId || null,
        params.providerResponse ? JSON.stringify(params.providerResponse) : null,
        params.errorMessage || null,
        params.transactionId,
      ]
    );
  } else if (params.orderId) {
    await query(
      `UPDATE payment_transactions SET
        status = $1,
        provider_transaction_id = COALESCE($2, provider_transaction_id),
        provider_response = COALESCE($3, provider_response),
        error_message = $4,
        updated_at = NOW()
      WHERE order_id = $5`,
      [
        params.status,
        params.providerTransactionId || null,
        params.providerResponse ? JSON.stringify(params.providerResponse) : null,
        params.errorMessage || null,
        params.orderId,
      ]
    );
  }
}

/**
 * Get payment transaction by order ID.
 */
export async function getPaymentTransactionByOrderId(orderId: string) {
  const { rows } = await query(
    'SELECT * FROM payment_transactions WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
    [orderId]
  );
  return rows[0] || null;
}

/**
 * Get payment transaction by provider transaction ID.
 */
export async function getPaymentTransactionByProviderTxId(providerTxId: string) {
  const { rows } = await query(
    'SELECT * FROM payment_transactions WHERE provider_transaction_id = $1 LIMIT 1',
    [providerTxId]
  );
  return rows[0] || null;
}

/**
 * Map YPAY status strings to our internal PaymentStatus.
 */
export function mapYPayStatus(ypayStatus: string): PaymentStatus {
  switch (ypayStatus.toLowerCase()) {
    case 'approved':
    case 'success':
    case 'completed':
      return 'completed';
    case 'declined':
    case 'denied':
    case 'failed':
    case 'error':
      return 'failed';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'pending':
    case 'processing':
      return 'processing';
    case 'refunded':
      return 'refunded';
    default:
      console.warn('Unknown YPAY status:', ypayStatus);
      return 'pending';
  }
}

/**
 * Map payment status to order status.
 */
export function paymentStatusToOrderStatus(paymentStatus: PaymentStatus): string {
  switch (paymentStatus) {
    case 'completed':
      return 'confirmed';
    case 'failed':
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
      return 'refunded';
    case 'processing':
    case 'pending':
    default:
      return 'pending';
  }
}
