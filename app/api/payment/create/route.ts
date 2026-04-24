import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres-client';
import {
  createPayment,
  createPaymentTransaction,
  YPayOrderInput,
} from '@/lib/services/payment/ypay-service';

// ---------------------------------------------------------------------------
// Types for the request body
// ---------------------------------------------------------------------------

interface PaymentCreateBody {
  // Order details
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
  deliveryFee: number;
  total: number;

  // Customer info
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };

  // Delivery
  deliveryMethod: string;

  // Payment
  paymentMethod: string;
  installments?: number;
  currency?: string;
}

// ---------------------------------------------------------------------------
// POST /api/payment/create
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: PaymentCreateBody = await request.json();

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

    // Use a DB transaction to create order + payment record atomically
    const result = await transaction(async (client) => {
      // 1. Create order record (status: pending)
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          total, subtotal, delivery_fee, payment_method,
          status, payment_status, delivery_method,
          shipping_address, delivery_address, items,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *`,
        [
          orderNumber,
          `${body.customer.firstName} ${body.customer.lastName}`.trim(),
          body.customer.email,
          body.customer.phone || null,
          body.total,
          body.subtotal || body.total,
          body.deliveryFee || 0,
          body.paymentMethod || 'ypay_credit',
          'pending',
          'pending',
          body.deliveryMethod || 'pickup',
          JSON.stringify({
            address: body.customer.address || '',
            city: body.customer.city || 'Dimona',
            country: body.customer.country || 'Israel',
          }),
          JSON.stringify({
            address: body.customer.address || '',
            city: body.customer.city || 'Dimona',
            country: body.customer.country || 'Israel',
          }),
          JSON.stringify(body.items),
        ]
      );

      const order = orderRows[0];

      if (!order) {
        throw new Error('Failed to create order record');
      }

      // 2. Create order items
      for (const item of body.items) {
        await client.query(
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
      }

      // 3. Create payment transaction record (status: pending)
      const { rows: txRows } = await client.query(
        `INSERT INTO payment_transactions (
          order_id, payment_method, provider, amount, currency,
          status, installments, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id`,
        [
          order.id,
          body.paymentMethod || 'ypay_credit',
          'ypay',
          body.total,
          body.currency || 'ILS',
          'pending',
          body.installments || 1,
        ]
      );

      const paymentTx = txRows[0];

      // 4. Link payment transaction to order
      await client.query(
        'UPDATE orders SET payment_transaction_id = $1 WHERE id = $2',
        [paymentTx.id, order.id]
      );

      return { order, paymentTransactionId: paymentTx.id };
    });

    // 5. Create YPAY payment session
    const ypayOrder: YPayOrderInput = {
      orderId: result.order.id.toString(),
      orderNumber,
      amount: body.total,
      currency: body.currency || 'ILS',
      description: `KFAR Order ${orderNumber}`,
      customerName: `${body.customer.firstName} ${body.customer.lastName}`.trim(),
      customerEmail: body.customer.email,
      customerPhone: body.customer.phone,
      installments: body.installments || 1,
      items: body.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
      })),
    };

    const paymentResult = await createPayment(ypayOrder);

    if (!paymentResult.success) {
      // Update payment transaction to reflect the failure
      await query(
        `UPDATE payment_transactions SET status = 'failed', error_message = $1, updated_at = NOW()
         WHERE id = $2`,
        [paymentResult.error, result.paymentTransactionId]
      );

      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || 'Payment gateway error',
          orderId: result.order.id,
          orderNumber,
        },
        { status: 502 }
      );
    }

    // 6. Store the provider transaction ID
    if (paymentResult.transactionId) {
      await query(
        `UPDATE payment_transactions SET
          provider_transaction_id = $1, status = 'processing', updated_at = NOW()
         WHERE id = $2`,
        [paymentResult.transactionId, result.paymentTransactionId]
      );
    }

    console.log(
      'Payment session created:',
      orderNumber,
      '-> YPAY tx:', paymentResult.transactionId
    );

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      orderNumber,
      redirectUrl: paymentResult.redirectUrl,
      transactionId: paymentResult.transactionId,
    });
  } catch (error: any) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment',
      },
      { status: 500 }
    );
  }
}
