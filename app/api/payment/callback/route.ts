import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import {
  mapYPayStatus,
  paymentStatusToOrderStatus,
  updatePaymentTransaction,
  getPaymentTransactionByOrderId,
} from '@/lib/services/payment/ypay-service';

// ---------------------------------------------------------------------------
// GET /api/payment/callback
//
// YPAY redirects the customer here after payment completion.
// Query parameters from YPAY typically include:
//   - orderId: our internal order ID
//   - status: success | failure | cancelled
//   - transactionId: YPAY's transaction reference
//   - last4: last 4 digits of card
//   - cardBrand: visa, mastercard, etc.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status') || 'unknown';
  const transactionId = searchParams.get('transactionId');
  const last4 = searchParams.get('last4');
  const cardBrand = searchParams.get('cardBrand');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kfarapp.com';

  if (!orderId) {
    console.error('Payment callback missing orderId');
    return NextResponse.redirect(`${appUrl}/checkout?error=missing_order`);
  }

  try {
    // Map YPAY status to our internal status
    const paymentStatus = mapYPayStatus(status);
    const orderStatus = paymentStatusToOrderStatus(paymentStatus);

    // Build provider response object
    const providerResponse: Record<string, unknown> = {
      callback_status: status,
      callback_received_at: new Date().toISOString(),
    };
    if (transactionId) providerResponse.transaction_id = transactionId;
    if (last4) providerResponse.last4 = last4;
    if (cardBrand) providerResponse.card_brand = cardBrand;

    // Update payment transaction
    await updatePaymentTransaction({
      orderId,
      status: paymentStatus,
      providerTransactionId: transactionId || undefined,
      providerResponse,
    });

    // Update order status and payment status
    await query(
      `UPDATE orders SET
        status = $1,
        payment_status = $2,
        payment_reference = $3,
        completed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE completed_at END,
        cancelled_at = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END,
        updated_at = NOW()
      WHERE id = $4`,
      [orderStatus, paymentStatus, transactionId || null, orderId]
    );

    // Get order details for the redirect
    const { rows: orderRows } = await query(
      'SELECT order_number FROM orders WHERE id = $1',
      [orderId]
    );

    const orderNumber = orderRows[0]?.order_number || '';

    console.log(
      'Payment callback processed:',
      orderNumber,
      'status:', status,
      '-> payment:', paymentStatus,
      '-> order:', orderStatus
    );

    // Redirect to appropriate page
    if (paymentStatus === 'completed') {
      return NextResponse.redirect(
        `${appUrl}/order-confirmation?orderId=${orderId}&orderNumber=${orderNumber}&status=success`
      );
    } else if (paymentStatus === 'cancelled') {
      return NextResponse.redirect(
        `${appUrl}/checkout?orderId=${orderId}&status=cancelled`
      );
    } else {
      // Failed or unknown
      return NextResponse.redirect(
        `${appUrl}/checkout?orderId=${orderId}&status=failed&error=payment_declined`
      );
    }
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      `${appUrl}/checkout?error=callback_error&orderId=${orderId}`
    );
  }
}
