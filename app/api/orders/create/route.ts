import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { sendTransactional } from '@/lib/services/email/email-service';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limiter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderCreateBody {
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    vendorId?: string;
    vendorName?: string;
    image?: string;
  }>;
  subtotal: number;
  deliveryFee?: number;
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
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

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in order' },
        { status: 400 }
      );
    }

    if (!body.total || body.total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order total' },
        { status: 400 }
      );
    }

    if (!body.customer?.firstName || !body.customer?.email) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Generate order number: KFAR-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(Math.random() * 9000) + 1000;
    const orderNumber = `KFAR-${dateStr}-${seq}`;

    const customerName = `${body.customer.firstName} ${body.customer.lastName}`.trim();

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
    const primaryVendorId = body.items.find(i => i.vendorId)?.vendorId || null;

    // Create order (columns match actual DB schema)
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
        body.customer.email,
        body.customer.phone || null,
        body.total,
        body.subtotal || body.total,
        body.deliveryFee || 0,
        body.paymentMethod || 'cash',
        'pending',
        'pending',
        addressJson,
        JSON.stringify(body.items),
        body.notes || null,
        primaryVendorId,
        customerId,
      ]
    );

    const order = orderRows[0];

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Failed to create order record' },
        { status: 500 }
      );
    }

    // Items are stored as JSONB in orders.items column (no separate order_items table)
    console.log('Order created:', orderNumber, 'ID:', order.id, 'Items:', body.items.length);

    // Update customer stats if linked to an account (fire-and-forget)
    if (customerId) {
      query(
        `UPDATE customers SET
           total_orders = total_orders + 1,
           total_spent  = total_spent + $2,
           last_order_at = NOW(),
           updated_at   = NOW()
         WHERE id = $1`,
        [customerId, body.total]
      ).catch(err => console.error('Failed to update customer stats:', err));
    }

    // --- Send email notifications (fire-and-forget, don't block response) ---
    const emailPromises: Promise<any>[] = [];

    // 1) Order confirmation to customer
    const itemsHtml = body.items.map(item =>
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

    emailPromises.push(
      sendTransactional(body.customer.email, 'order_confirmation', {
        customer_name: customerName,
        order_number: orderNumber,
        items_html: itemsTable,
        total: body.total.toFixed(2),
        currency: body.currency || 'ILS',
        payment_method: body.paymentMethod || 'Cash on Delivery',
        delivery_method: body.deliveryMethod || 'Pickup',
      }).catch(err => console.error('Failed to send order confirmation email:', err))
    );

    // 2) New order alert to each vendor
    const vendorEmails: Record<string, string> = {
      'teva-deli': 'teva@kfarapp.com',
      'queens-cuisine': 'queens@kfarapp.com',
      'people-store': 'people@kfarapp.com',
      'garden-of-light': 'garden@kfarapp.com',
      'gahn-delight': 'gahn@kfarapp.com',
      'vop-shop': 'vop@kfarapp.com',
    };

    const vendorIds = [...new Set(body.items.map(i => i.vendorId).filter(Boolean))];
    for (const vendorId of vendorIds) {
      const vendorEmail = vendorEmails[vendorId as string];
      if (vendorEmail) {
        const vendorItems = body.items.filter(i => i.vendorId === vendorId);
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
          }).catch(err => console.error('Failed to send vendor notification email:', err))
        );
      }
    }

    // Don't await emails - let them send in background
    Promise.allSettled(emailPromises).then(results => {
      const sent = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Order ${orderNumber}: ${sent}/${results.length} emails dispatched`);
    });

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
