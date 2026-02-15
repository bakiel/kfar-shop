import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';

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

    // Create order
    const { rows: orderRows } = await query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        total_amount, subtotal, delivery_fee, payment_method,
        status, payment_status, delivery_method,
        shipping_address, delivery_address, items, notes,
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
        body.deliveryMethod || 'pickup',
        addressJson,
        addressJson,
        JSON.stringify(body.items),
        body.notes || null,
      ]
    );

    const order = orderRows[0];

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Failed to create order record' },
        { status: 500 }
      );
    }

    // Create order items
    for (const item of body.items) {
      try {
        await query(
          `INSERT INTO order_items (
            order_id, product_name, quantity, unit_price, total_price, vendor_name
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            item.name,
            item.quantity,
            item.price,
            item.quantity * item.price,
            item.vendorName || 'Unknown',
          ]
        );
      } catch (itemError) {
        console.error('Warning: Failed to save order item:', itemError);
        // Non-critical - order is still valid
      }
    }

    console.log('Order created:', orderNumber, 'ID:', order.id);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount,
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
