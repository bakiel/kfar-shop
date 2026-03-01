import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { sendTransactional } from '@/lib/services/email/email-service';
import { verifyAccessToken } from '@/lib/services/auth-service';

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

    // Add order ID as final parameter
    values.push(id);

    const { rows } = await query(
      `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      // Try by order_number
      values[values.length - 1] = id;
      const { rows: byNumber } = await query(
        `UPDATE orders SET ${setClauses.join(', ')} WHERE order_number = $${paramIndex} RETURNING *`,
        values
      );

      if (byNumber.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      rows.push(byNumber[0]);
    }

    const updatedOrder = rows[0];

    console.log(
      'Order status updated:',
      updatedOrder.order_number,
      'status:', updatedOrder.status,
      'payment:', updatedOrder.payment_status
    );

    // Send order status update email to customer (fire-and-forget)
    if (status && updatedOrder.customer_email) {
      const statusLabels: Record<string, string> = {
        confirmed: 'Order Confirmed',
        processing: 'Being Prepared',
        ready: 'Ready for Pickup',
        shipped: 'Shipped',
        delivered: 'Delivered',
        completed: 'Completed',
        cancelled: 'Cancelled',
      };
      sendTransactional(updatedOrder.customer_email, 'order_status_update', {
        customer_name: updatedOrder.customer_name || 'Customer',
        order_number: updatedOrder.order_number,
        status: statusLabels[status] || status,
      }).catch(err => console.error('Failed to send status update email:', err));
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
