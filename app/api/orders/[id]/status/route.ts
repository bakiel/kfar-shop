import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { sendTransactional } from '@/lib/services/email/email-service';
import { verifyAccessToken } from '@/lib/services/auth-service';
import {
  notifyCustomerAccount,
  notifyVendorOwners,
} from '@/lib/services/account-notification-events.server';

// ---------------------------------------------------------------------------
// PATCH /api/orders/[id]/status
//
// Updates the status of an order. Supports both order status and payment status.
//
// Body:
//   { status?: string, paymentStatus?: string, notes?: string, cancellationReason?: string }
// ---------------------------------------------------------------------------

const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
];

const VALID_PAYMENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require vendor or admin authentication
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  const user = token ? verifyAccessToken(token) : null;
  if (!user || (user.role !== 'admin' && user.role !== 'vendor')) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus, notes, cancellationReason } = body;

    // Validate at least one field is being updated
    if (!status && !paymentStatus && notes === undefined && !cancellationReason) {
      return NextResponse.json(
        { success: false, error: 'No update fields provided' },
        { status: 400 }
      );
    }

    // Validate status values
    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid order status: ${status}. Valid values: ${VALID_ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid payment status: ${paymentStatus}. Valid values: ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { rows: existingRows } = await query(
      'SELECT id, order_number, status, payment_status, vendor_id, customer_id, customer_name FROM orders WHERE id::text = $1 OR order_number = $1',
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const existingOrder = existingRows[0];
    if (user.role === 'vendor' && existingOrder.vendor_id !== user.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Order does not belong to this vendor' },
        { status: 403 }
      );
    }

    // Build dynamic update query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(status);

      // Auto-set timestamps based on status
      if (status === 'confirmed' || status === 'completed' || status === 'delivered') {
        setClauses.push(`completed_at = COALESCE(completed_at, NOW())`);
      }
      if (status === 'cancelled') {
        setClauses.push(`cancelled_at = NOW()`);
      }
    }

    if (paymentStatus) {
      setClauses.push(`payment_status = $${paramIndex++}`);
      values.push(paymentStatus);
    }

    if (notes !== undefined) {
      setClauses.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    if (cancellationReason) {
      setClauses.push(`cancellation_reason = $${paramIndex++}`);
      values.push(cancellationReason);
    }

    setClauses.push('updated_at = NOW()');

    // Add canonical order ID as final parameter
    values.push(existingOrder.id);

    const { rows } = await query(
      `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    const updatedOrder = rows[0];

    console.log(
      'Order status updated:',
      updatedOrder.order_number,
      'status:', updatedOrder.status,
      'payment:', updatedOrder.payment_status
    );

    const statusLabels: Record<string, string> = {
      confirmed: 'Order Confirmed',
      processing: 'Being Prepared',
      ready: 'Ready for Pickup',
      shipped: 'Shipped',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    // Send order status update email to customer (fire-and-forget)
    if (status && updatedOrder.customer_email && !String(updatedOrder.customer_email).startsWith('cod+')) {
      sendTransactional(updatedOrder.customer_email, 'order_status_update', {
        customer_name: updatedOrder.customer_name || 'Customer',
        order_number: updatedOrder.order_number,
        status: statusLabels[status] || status,
        status_he: statusLabels[status] || status,
        status_message: '',
        status_message_he: '',
        tracking_url: `${(process.env.NEXT_PUBLIC_APP_URL || "https://kfarapp.com").replace(/\/$/, '')}/customer/orders/${updatedOrder.id}`,
      }).catch(err => console.error('Failed to send status update email:', err));
    }

    const statusChanged = status && existingOrder.status !== updatedOrder.status;
    const paymentChanged = paymentStatus && existingOrder.payment_status !== updatedOrder.payment_status;

    if ((statusChanged || paymentChanged) && updatedOrder.customer_id) {
      const message = statusChanged
        ? `Your order is now ${statusLabels[updatedOrder.status] || updatedOrder.status}.`
        : `Your payment status is now ${updatedOrder.payment_status}.`;
      notifyCustomerAccount(updatedOrder.customer_id, {
        type: 'order_update',
        channel: 'in_app',
        title: `Order ${updatedOrder.order_number} updated`,
        titleHe: `הזמנה ${updatedOrder.order_number} עודכנה`,
        message,
        messageHe: message,
        data: {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.order_number,
          previousStatus: existingOrder.status,
          status: updatedOrder.status,
          previousPaymentStatus: existingOrder.payment_status,
          paymentStatus: updatedOrder.payment_status,
          actionUrl: `/customer/orders/${updatedOrder.id}`,
          actionLabel: 'View order',
        },
      }).catch(err => console.error('Failed to create order customer notification:', err));
    }

    if (user.role === 'admin' && statusChanged && updatedOrder.vendor_id) {
      notifyVendorOwners(updatedOrder.vendor_id, {
        type: 'order_update',
        channel: 'in_app',
        title: `Order ${updatedOrder.order_number} updated`,
        titleHe: `הזמנה ${updatedOrder.order_number} עודכנה`,
        message: `Admin updated the order to ${statusLabels[updatedOrder.status] || updatedOrder.status}.`,
        messageHe: `מנהל עדכן את ההזמנה לסטטוס ${statusLabels[updatedOrder.status] || updatedOrder.status}.`,
        data: {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.order_number,
          previousStatus: existingOrder.status,
          status: updatedOrder.status,
          actionUrl: '/vendor/orders',
          actionLabel: 'View orders',
        },
      }).catch(err => console.error('Failed to create order vendor notification:', err));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
        updatedAt: updatedOrder.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
