import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';

// GET - Retrieve orders (optionally filtered by vendor_id or customer_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const customerId = searchParams.get('customer_id');
    const orderId = searchParams.get('id');

    let sql = 'SELECT * FROM orders';
    const params: any[] = [];

    if (orderId) {
      sql += ' WHERE id = $1';
      params.push(orderId);
    } else if (vendorId) {
      sql += ' WHERE vendor_id = $1';
      params.push(vendorId);
    } else if (customerId) {
      sql += ' WHERE customer_id = $1';
      params.push(customerId);
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

// POST - Create a new order
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { rows } = await query(
      `INSERT INTO orders (
        id, customer_id, vendor_id, items, subtotal, total,
        delivery_fee, delivery_address, delivery_method,
        payment_method, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        orderId,
        data.customer_id || null,
        data.vendor_id || null,
        JSON.stringify(data.items),
        data.subtotal,
        data.total,
        data.delivery_fee || 0,
        data.delivery_address ? JSON.stringify(data.delivery_address) : null,
        data.delivery_method || 'pickup',
        data.payment_method || 'cash',
        'pending',
        data.notes || null
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

// PATCH - Update an order (typically for status updates)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();

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

    const { rows } = await query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
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
