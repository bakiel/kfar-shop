import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import { sendTransactional } from '@/lib/services/email/email-service';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

const VALID_STATUSES = ['pending', 'accepted', 'preparing', 'processing', 'ready', 'completed', 'cancelled'] as const;
type OrderStatus = typeof VALID_STATUSES[number];

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify order belongs to this vendor
    const { rows: existingOrders } = await query(
      'SELECT id, status, vendor_id FROM orders WHERE id = $1',
      [orderId]
    );

    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (existingOrders[0].vendor_id !== user.vendorId) {
      return NextResponse.json(
        { error: 'Order does not belong to this vendor' },
        { status: 403 }
      );
    }

    // Update order status
    const { rows } = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    const order = rows[0];
    if (typeof order.items === 'string') {
      order.items = JSON.parse(order.items);
    }

    // Send order status update email to customer (fire-and-forget)
    if (order.customer_email) {
      const statusLabels: Record<string, string> = {
        accepted: 'Accepted',
        preparing: 'Being Prepared',
        processing: 'Being Prepared',
        ready: 'Ready for Pickup',
        completed: 'Completed',
        cancelled: 'Cancelled',
      };
      sendTransactional(order.customer_email, 'order_status_update', {
        customer_name: order.customer_name || 'Customer',
        order_number: order.order_number,
        status: statusLabels[status] || status,
      }).catch(err => console.error('Failed to send vendor status email:', err));
    }

    return NextResponse.json({
      success: true,
      order,
      previousStatus: existingOrders[0].status,
      newStatus: status,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
