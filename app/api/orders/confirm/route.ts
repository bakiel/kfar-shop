import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db/postgres-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, customer, total, subtotal, deliveryFee, paymentMethod, deliveryMethod } = body;

    if (!orderId || !items || !customer || !total) {
      return NextResponse.json(
        { error: 'Missing required order data' },
        { status: 400 }
      );
    }

    // Create order record in PostgreSQL database
    const orderRecord = {
      order_number: orderId,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      total: total,
      subtotal: subtotal || total,
      delivery_fee: deliveryFee || 0,
      payment_method: paymentMethod || 'credit_card',
      status: 'confirmed',
      payment_status: 'pending',
      shipping_address: JSON.stringify({
        address: customer.address,
        city: customer.city || 'Dimona',
        country: customer.country || 'Israel'
      }),
      delivery_address: JSON.stringify({
        address: customer.address,
        city: customer.city || 'Dimona',
        country: customer.country || 'Israel'
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save order to PostgreSQL database
    const { rows: orderRows } = await query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        total, subtotal, delivery_fee, payment_method,
        status, payment_status, shipping_address, delivery_address,
        items,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        orderRecord.order_number,
        orderRecord.customer_name,
        orderRecord.customer_email,
        orderRecord.customer_phone,
        orderRecord.total,
        orderRecord.subtotal,
        orderRecord.delivery_fee,
        orderRecord.payment_method,
        orderRecord.status,
        orderRecord.payment_status,
        orderRecord.shipping_address,
        orderRecord.delivery_address,
        JSON.stringify(items || []),
      ]
    );

    const orderData = orderRows[0];

    if (!orderData) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    console.log('✅ Order created in database:', orderData.id);

    // Create order items
    if (items && items.length > 0) {
      for (const item of items) {
        try {
          await query(
            `INSERT INTO order_items (
              order_id, product_name, quantity, unit_price, total_price, vendor_name
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              orderData.id,
              item.name,
              item.quantity,
              item.price,
              item.quantity * item.price,
              item.vendor
            ]
          );
        } catch (itemError) {
          console.error('⚠️ Warning: Failed to save order item:', itemError);
          // Don't fail the order if items can't be saved
        }
      }
      console.log('✅ Order items saved');
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      orderNumber: orderId,
      message: 'Order confirmed and saved to database'
    });

  } catch (error: any) {
    console.error('❌ Order confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm order' },
      { status: 500 }
    );
  }
}
