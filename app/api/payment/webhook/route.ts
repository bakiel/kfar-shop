import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import {
  verifyWebhook,
  mapYPayStatus,
  paymentStatusToOrderStatus,
  updatePaymentTransaction,
  getPaymentTransactionByProviderTxId,
  YPayWebhookPayload,
} from '@/lib/services/payment/ypay-service';
import { sendTransactional } from '@/lib/services/email/email-service';

// ---------------------------------------------------------------------------
// POST /api/payment/webhook
//
// YPAY sends asynchronous payment confirmations here.
// This is the authoritative source for payment status - the callback redirect
// is for UX only; this webhook is what actually confirms the payment.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const payload: YPayWebhookPayload = await request.json();

    console.log('YPAY webhook received:', {
      transactionId: payload.transactionId,
      orderId: payload.orderId,
      status: payload.status,
      amount: payload.amount,
    });

    // Validate required fields
    if (!payload.transactionId || !payload.status) {
      console.error('YPAY webhook missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify webhook authenticity
    const isValid = verifyWebhook(payload);
    if (!isValid) {
      console.error('YPAY webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Map YPAY status to internal status
    const paymentStatus = mapYPayStatus(payload.status);
    const orderStatus = paymentStatusToOrderStatus(paymentStatus);

    // Build provider response
    const providerResponse: Record<string, unknown> = {
      webhook_status: payload.status,
      webhook_received_at: new Date().toISOString(),
      webhook_timestamp: payload.timestamp,
    };
    if (payload.last4) providerResponse.last4 = payload.last4;
    if (payload.cardBrand) providerResponse.card_brand = payload.cardBrand;
    if (payload.installments) providerResponse.installments = payload.installments;

    // Find the payment transaction - try by provider TX ID first, then by order ID
    let paymentTx = await getPaymentTransactionByProviderTxId(payload.transactionId);

    if (!paymentTx && payload.orderId) {
      // Try to find by order ID and update the provider transaction ID
      const { rows } = await query(
        'SELECT * FROM payment_transactions WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
        [payload.orderId]
      );
      paymentTx = rows[0] || null;
    }

    if (!paymentTx) {
      console.error('YPAY webhook: no matching payment transaction found for', {
        transactionId: payload.transactionId,
        orderId: payload.orderId,
      });
      // Return 200 to prevent YPAY from retrying - we log the error
      return NextResponse.json({
        received: true,
        warning: 'No matching transaction found',
      });
    }

    // Check if this is a duplicate or already final
    if (paymentTx.status === 'completed' && paymentStatus === 'completed') {
      console.log('YPAY webhook: payment already completed, skipping update');
      return NextResponse.json({ received: true, status: 'already_completed' });
    }

    // Update payment transaction
    await updatePaymentTransaction({
      transactionId: paymentTx.id,
      status: paymentStatus,
      providerTransactionId: payload.transactionId,
      providerResponse,
    });

    // Update order status
    const orderId = paymentTx.order_id;
    if (orderId) {
      await query(
        `UPDATE orders SET
          status = $1,
          payment_status = $2,
          payment_reference = $3,
          completed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE completed_at END,
          cancelled_at = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END,
          updated_at = NOW()
        WHERE id = $4`,
        [orderStatus, paymentStatus, payload.transactionId, orderId]
      );

      console.log(
        'YPAY webhook processed: order', orderId,
        'payment:', paymentStatus,
        'order:', orderStatus
      );

      // If payment completed, update customer stats and send receipt
      if (paymentStatus === 'completed') {
        try {
          const { rows: orderRows } = await query(
            `SELECT order_number, customer_name, customer_email, total, subtotal,
                    delivery_fee, items, payment_method, delivery_method
             FROM orders WHERE id = $1`,
            [orderId]
          );
          const order = orderRows[0];
          if (order?.customer_email) {
            // Update customer stats
            await query(
              `UPDATE customers SET
                total_orders = total_orders + 1,
                total_spent = total_spent + $1,
                last_order_at = NOW(),
                updated_at = NOW()
              WHERE email = $2`,
              [order.total, order.customer_email]
            );

            // Send payment receipt email (fire-and-forget)
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            const itemsHtml = items.map((item: any) =>
              `<tr>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${Number(item.price).toFixed(2)} ILS</td>
              </tr>`
            ).join('');
            const itemsTable = `<table style="width:100%;border-collapse:collapse;">
              <thead><tr>
                <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #2D5A27;color:#2D5A27;">Item</th>
                <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #2D5A27;color:#2D5A27;">Qty</th>
                <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #2D5A27;color:#2D5A27;">Price</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>`;

            sendTransactional(order.customer_email, 'order_confirmation', {
              customer_name: order.customer_name || 'Customer',
              order_number: order.order_number,
              items_html: itemsTable,
              total: Number(order.total).toFixed(2),
              currency: 'ILS',
              payment_method: 'Credit Card (YPAY)',
              delivery_method: order.delivery_method || 'Pickup',
            }).catch(err => console.error('Failed to send payment receipt email:', err));
          }
        } catch (statsError) {
          // Non-critical: log but don't fail the webhook
          console.error('Failed to update customer stats/send receipt:', statsError);
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({
      received: true,
      status: paymentStatus,
    });
  } catch (error: any) {
    console.error('YPAY webhook error:', error);
    // Return 200 even on error to prevent webhook retries for bad data
    // Only return 5xx if we want YPAY to retry
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}
