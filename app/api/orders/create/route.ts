import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { sendTransactional } from '@/lib/services/email/email-service';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limiter';
import { createNotification } from '@/lib/services/notification-service.server';
import { sendOrderConfirmationSMS } from '@/lib/services/sms-service';
import {
  notifyCustomerAccount,
  notifyVendorOwners,
} from '@/lib/services/account-notification-events.server';
import { resolveOrderQuote, totalsMatch } from '@/lib/services/order-cart-resolver.server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderCreateBody {
  items: Array<{
    id?: string;
    productId?: string;
    product_id?: string;
    itemType?: 'product' | 'bundle';
    bundleId?: string;
    bundleName?: string;
    bundleProductIds?: string[];
    name: string;
    quantity: number;
    price: number;
    vendorId?: string;
    vendor_id?: string;
    vendorName?: string;
    vendor_name?: string;
    image?: string;
  }>;
  subtotal: number;
  deliveryFee?: number;
  total: number;
  customer: {
    // Simple checkout (Task #4): fullName is the canonical field.
    // firstName/lastName retained for backwards compatibility with existing
    // enhanced-checkout payloads.
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;        // optional for COD flow
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  deliveryMethod?: string;
  paymentMethod?: string;
  notes?: string;
  currency?: string;
}

// ---------------------------------------------------------------------------
// POST /api/orders/create
//
// Creates a new order record with generated order number.
// This is a standalone order creation endpoint (without payment integration).
// For orders with YPAY payment, use /api/payment/create instead.
// ---------------------------------------------------------------------------

function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `KFAR-${dateStr}-${seq}`;
}

function isOrderNumberCollision(error: unknown) {
  const err = error as { code?: string; constraint?: string; message?: string };
  return err?.code === '23505'
    && String(err.constraint || err.message || '').toLowerCase().includes('order');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit order creation
    const ip = getClientIp(request.headers);
    const limit = checkRateLimit(`order:${ip}`, RATE_LIMITS.order);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many orders. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const body: OrderCreateBody = await request.json();
    const paymentMethod = body.paymentMethod || 'cash';

    if (paymentMethod !== 'cash') {
      return NextResponse.json(
        { success: false, error: 'Only Cash on Delivery is enabled' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in order' },
        { status: 400 }
      );
    }

    let quote;
    try {
      quote = await resolveOrderQuote(body.items);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'Invalid order items' },
        { status: 400 }
      );
    }
    if (!totalsMatch(body.total, quote.total)) {
      return NextResponse.json(
        {
          success: false,
          code: 'ORDER_TOTAL_CHANGED',
          error: 'Order total changed. Please review your cart and try again.',
          quote,
        },
        { status: 409 }
      );
    }

    const normalizedItems = quote.items;
    const vendorIds = [...new Set(normalizedItems.map((item) => item.vendorId).filter(Boolean))];

    if (vendorIds.length > 1) {
      return NextResponse.json(
        {
          success: false,
          code: 'SINGLE_VENDOR_CHECKOUT_REQUIRED',
          error: 'Cash on Delivery checkout supports one store per order. Please check out each store separately.',
        },
        { status: 400 }
      );
    }

    // Derive canonical name (fullName wins; falls back to first+last)
    const fullName = (body.customer?.fullName
      || `${body.customer?.firstName || ''} ${body.customer?.lastName || ''}`
    ).trim();

    const isCOD = paymentMethod === 'cash';

    if (!fullName) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Email is required for non-COD flows; COD allows phone-only.
    if (!isCOD && !body.customer?.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required for this payment method' },
        { status: 400 }
      );
    }

    // For COD, require at least a phone.
    if (isCOD && !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'Phone is required for cash on delivery' },
        { status: 400 }
      );
    }

    const customerName = fullName;
    // Synthesize a placeholder email when the customer didn't provide one.
    // Keeps downstream (vendor_emails, audit, etc) consistent with a non-null
    // customer_email column and never attempts to send mail to it.
    const customerEmail = body.customer?.email
      || `cod+${(body.customer?.phone || 'unknown').replace(/[^\d+]/g, '')}@kfarapp.com`;

    const addressJson = JSON.stringify({
      address: body.customer.address || '',
      city: body.customer.city || 'Dimona',
      country: body.customer.country || 'Israel',
    });

    // Optionally link to authenticated customer account
    let customerId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const tokenUser = verifyAccessToken(authHeader.slice(7));
      if (tokenUser?.role === 'customer' && tokenUser.customerId) {
        customerId = tokenUser.customerId;
      }
    }

    // Derive primary vendor_id from items (first vendor found)
    const primaryVendorId = normalizedItems.find((item) => item.vendorId)?.vendorId || null;

    let orderNumber = '';
    let order: any = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      orderNumber = generateOrderNumber();
      try {
        const { rows: orderRows } = await query(
          `INSERT INTO orders (
            order_number, customer_name, customer_email, customer_phone,
            total, subtotal, delivery_fee, payment_method,
            status, payment_status,
            delivery_address, items, delivery_notes,
            vendor_id, customer_id,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
          RETURNING *`,
          [
            orderNumber,
            customerName,
            customerEmail,
            body.customer.phone || null,
            quote.total,
            quote.subtotal,
            quote.deliveryFee,
            paymentMethod,
            'pending',
            'pending',
            addressJson,
            JSON.stringify(normalizedItems),
            body.notes || null,
            primaryVendorId,
            customerId,
          ]
        );
        order = orderRows[0];
        break;
      } catch (error) {
        if (isOrderNumberCollision(error) && attempt < 4) {
          continue;
        }
        throw error;
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Failed to create order record' },
        { status: 500 }
      );
    }

    // Items are stored as JSONB in orders.items column (no separate order_items table)
    console.log('Order created:', orderNumber, 'ID:', order.id, 'Items:', normalizedItems.length);

    // Update customer stats if linked to an account (fire-and-forget)
    if (customerId) {
      query(
        `UPDATE customers SET
           total_orders = total_orders + 1,
           total_spent  = total_spent + $2,
           last_order_at = NOW(),
           updated_at   = NOW()
         WHERE id = $1`,
        [customerId, quote.total]
      ).catch(err => console.error('Failed to update customer stats:', err));
    }

    // --- Send email notifications (fire-and-forget, don't block response) ---
    const emailPromises: Promise<any>[] = [];

    // 1) Order confirmation to customer
    const itemsHtml = normalizedItems.map(item =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${item.price.toFixed(2)} ILS</td>
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

    // Skip customer confirmation email for COD flows with synthesized placeholder
    if (body.customer?.email) {
      emailPromises.push(
        sendTransactional(body.customer.email, 'order_confirmation', {
          customer_name: customerName,
          order_number: orderNumber,
          items_html: itemsTable,
          total: quote.total.toFixed(2),
          currency: body.currency || 'ILS',
          payment_method: 'Cash on Delivery',
          delivery_method: body.deliveryMethod || 'Pickup',
        }).catch(err => console.error('Failed to send order confirmation email:', err))
      );
    }

    // 2) New order alert to each vendor
    const vendorEmails: Record<string, string> = {
      'teva-deli': 'teva@kfarapp.com',
      'queens-cuisine': 'queens@kfarapp.com',
      'people-store': 'people@kfarapp.com',
      'garden-of-light': 'garden@kfarapp.com',
      'gahn-delight': 'gahn@kfarapp.com',
      'vop-shop': 'vop@kfarapp.com',
    };

    for (const vendorId of vendorIds) {
      const vendorEmail = vendorEmails[vendorId as string];
      if (vendorEmail) {
        const vendorItems = normalizedItems.filter((item) => item.vendorId === vendorId);
        const vendorItemsHtml = vendorItems.map(item =>
          `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${item.price.toFixed(2)} ILS</td>
          </tr>`
        ).join('');

        const vendorTable = `<table style="width:100%;border-collapse:collapse;">
          <thead><tr>
            <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #2D5A27;color:#2D5A27;">Item</th>
            <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #2D5A27;color:#2D5A27;">Qty</th>
            <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #2D5A27;color:#2D5A27;">Price</th>
          </tr></thead>
          <tbody>${vendorItemsHtml}</tbody>
        </table>`;

        emailPromises.push(
          sendTransactional(vendorEmail, 'vendor_new_order', {
            vendor_name: vendorItems[0]?.vendorName || vendorId as string,
            order_number: orderNumber,
            customer_name: customerName,
            items_html: vendorTable,
            total: vendorItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2),
            currency: body.currency || 'ILS',
            dashboard_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com'}/vendor/orders`,
          }).catch(err => console.error('Failed to send vendor notification email:', err))
        );
      }
    }

    // Don't await emails - let them send in background
    Promise.allSettled(emailPromises).then(results => {
      const sent = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Order ${orderNumber}: ${sent}/${results.length} emails dispatched`);
    });

    // Task #6: admin in-app notification (broadcast, user_id=null)
    createNotification({
      type: 'order_update',
      channel: 'in_app',
      title: `New order ${orderNumber}`,
      titleHe: `הזמנה חדשה ${orderNumber}`,
      message: `${customerName} placed an order · ₪${quote.total.toFixed(2)} · ${paymentMethod}`,
      messageHe: `${customerName} ביצע/ה הזמנה · ₪${quote.total.toFixed(2)} · ${paymentMethod}`,
      data: {
        orderId: order.id,
        orderNumber,
        total: quote.total,
        paymentMethod,
        actionUrl: `/admin/orders`,
        actionLabel: 'View order',
      },
    }).catch(err => console.error('Failed to create admin notification:', err));

    const inAppNotificationPromises: Promise<unknown>[] = [];

    if (customerId) {
      inAppNotificationPromises.push(
        notifyCustomerAccount(customerId, {
          type: 'order_update',
          channel: 'in_app',
          title: `Order ${orderNumber} received`,
          titleHe: `הזמנה ${orderNumber} התקבלה`,
          message: `Your order was received and is pending vendor review.`,
          messageHe: `ההזמנה שלך התקבלה וממתינה לאישור הספק.`,
          data: {
            orderId: order.id,
            orderNumber,
            total: quote.total,
            actionUrl: `/customer/orders/${order.id}`,
            actionLabel: 'View order',
          },
        })
      );
    }

    for (const vendorId of vendorIds) {
      const vendorItems = normalizedItems.filter((item) => item.vendorId === vendorId);
      const vendorTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      inAppNotificationPromises.push(
        notifyVendorOwners(vendorId as string, {
          type: 'order_update',
          channel: 'in_app',
          title: `New order ${orderNumber}`,
          titleHe: `הזמנה חדשה ${orderNumber}`,
          message: `${customerName} ordered ${vendorItems.length} item${vendorItems.length === 1 ? '' : 's'} · ₪${vendorTotal.toFixed(2)}.`,
          messageHe: `${customerName} הזמין/ה ${vendorItems.length} פריטים · ₪${vendorTotal.toFixed(2)}.`,
          data: {
            orderId: order.id,
            orderNumber,
            vendorId,
            total: vendorTotal,
            actionUrl: '/vendor/orders',
            actionLabel: 'View orders',
          },
        })
      );
    }

    Promise.allSettled(inAppNotificationPromises).then(results => {
      const sent = results.filter(r => r.status === 'fulfilled').length;
      if (results.length > 0) {
        console.log(`Order ${orderNumber}: ${sent}/${results.length} in-app notification jobs completed`);
      }
    });

    // Task #6: SMS is off until client pays (SMS_ENABLED=false by default).
    // Code path is wired — flipping the env var enables live sends.
    if (body.customer?.phone) {
      sendOrderConfirmationSMS(body.customer.phone, orderNumber, quote.total)
        .then(r => console.log(`Order ${orderNumber} SMS:`, r))
        .catch(err => console.error('SMS dispatch error:', err));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        createdAt: order.created_at,
      },
    });
  } catch (error: any) {
    console.error('Order create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
