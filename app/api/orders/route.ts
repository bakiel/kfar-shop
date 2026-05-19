import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { resolveOrderQuote, totalsMatch } from '@/lib/services/order-cart-resolver.server';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// GET - Retrieve orders for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    let sql = 'SELECT * FROM orders';
    const params: any[] = [];

    if (orderId) {
      // Any authenticated user can look up a specific order, but we scope
      // it to their own customer/vendor ID to prevent cross-user access
      if (user.role === 'vendor' && user.vendorId) {
        sql += ' WHERE id = $1 AND vendor_id = $2';
        params.push(orderId, user.vendorId);
      } else if (user.customerId) {
        sql += ' WHERE id = $1 AND customer_id = $2';
        params.push(orderId, user.customerId);
      } else if (user.role === 'admin') {
        sql += ' WHERE id = $1';
        params.push(orderId);
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'vendor' && user.vendorId) {
      // Vendors see only their own orders
      sql += ' WHERE vendor_id = $1';
      params.push(user.vendorId);
    } else if (user.customerId) {
      // Customers see only their own orders
      sql += ' WHERE customer_id = $1';
      params.push(user.customerId);
    } else if (user.role === 'admin') {
      // Admins can see all orders (no filter)
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await query(sql, params);
    return NextResponse.json({ orders: rows });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new order (authenticated customers only)
export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const paymentMethod = data.payment_method || data.paymentMethod || 'cash';
    if (paymentMethod !== 'cash') {
      return NextResponse.json(
        { success: false, error: 'Only Cash on Delivery is enabled' },
        { status: 400 }
      );
    }

    let quote;
    try {
      quote = await resolveOrderQuote(data.items);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'Invalid order items' },
        { status: 400 }
      );
    }

    if (!totalsMatch(data.total, quote.total)) {
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

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(Math.random() * 9000) + 1000;
    const orderNumber = data.order_number || `KFAR-${dateStr}-${seq}`;

    // Use the authenticated user's customerId from the JWT - never trust the request body for identity
    const customerId = user.customerId || null;

    const { rows } = await query(
      `INSERT INTO orders (
        order_number, customer_id, vendor_id, items, subtotal, total,
        delivery_fee, delivery_address,
        payment_method, status, delivery_notes,
        customer_name, customer_email, customer_phone,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        orderNumber,
        customerId,
        quote.items[0]?.vendorId || null,
        JSON.stringify(quote.items),
        quote.subtotal,
        quote.total,
        quote.deliveryFee,
        data.delivery_address ? JSON.stringify(data.delivery_address) : null,
        paymentMethod,
        'pending',
        data.notes || data.delivery_notes || null,
        data.customer_name || null,
        data.customer_email || null,
        data.customer_phone || null,
      ]
    );

    return NextResponse.json({
      success: true,
      order: rows[0],
      orderId: rows[0].id
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PATCH - Update an order status (vendor or admin only)
export async function PATCH(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    if (user.role !== 'admin' && user.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.role === 'vendor' && !user.vendorId) {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.status) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      values.push(updates.notes);
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(orderId);
    if (user.role === 'vendor') {
      values.push(user.vendorId);
    }

    const { rows } = await query(
      `UPDATE orders SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}${user.role === 'vendor' ? ` AND vendor_id = $${paramCount + 1}` : ''}
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: rows[0]
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
