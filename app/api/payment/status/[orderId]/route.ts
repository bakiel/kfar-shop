import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import {
  getPaymentStatus as getYPayStatus,
  getPaymentTransactionByOrderId,
} from '@/lib/services/payment/ypay-service';

// ---------------------------------------------------------------------------
// GET /api/payment/status/[orderId]
//
// Returns the current payment and order status for a given order ID.
// Optionally refreshes from YPAY if ?refresh=true is passed.
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order from database
    const { rows: orderRows } = await query(
      `SELECT id, order_number, status, payment_status, payment_reference,
              total_amount, subtotal, delivery_fee, customer_name, customer_email,
              payment_method, delivery_method, created_at, updated_at,
              completed_at, cancelled_at
       FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderRows.length === 0) {
      // Try by order_number as fallback
      const { rows: orderByNumber } = await query(
        `SELECT id, order_number, status, payment_status, payment_reference,
                total_amount, subtotal, delivery_fee, customer_name, customer_email,
                payment_method, delivery_method, created_at, updated_at,
                completed_at, cancelled_at
         FROM orders WHERE order_number = $1`,
        [orderId]
      );

      if (orderByNumber.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      orderRows.push(orderByNumber[0]);
    }

    const order = orderRows[0];

    // Get payment transaction from database
    const paymentTx = await getPaymentTransactionByOrderId(order.id);

    // Optionally refresh from YPAY
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    let ypayStatus = null;

    if (refresh && paymentTx?.provider_transaction_id) {
      try {
        ypayStatus = await getYPayStatus(paymentTx.provider_transaction_id);
      } catch (refreshError) {
        console.error('Failed to refresh from YPAY:', refreshError);
        // Non-critical, continue with DB data
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentReference: order.payment_reference,
        totalAmount: order.total_amount,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        paymentMethod: order.payment_method,
        deliveryMethod: order.delivery_method,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        completedAt: order.completed_at,
        cancelledAt: order.cancelled_at,
      },
      payment: paymentTx
        ? {
            id: paymentTx.id,
            status: paymentTx.status,
            provider: paymentTx.provider,
            providerTransactionId: paymentTx.provider_transaction_id,
            amount: paymentTx.amount,
            currency: paymentTx.currency,
            installments: paymentTx.installments,
            createdAt: paymentTx.created_at,
            updatedAt: paymentTx.updated_at,
          }
        : null,
      ypayStatus,
    });
  } catch (error: any) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
