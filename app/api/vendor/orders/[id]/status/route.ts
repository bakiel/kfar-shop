import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import { sendTransactional } from '@/lib/services/email/email-service';
import { notifyCustomerAccount } from '@/lib/services/account-notification-events.server';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

const VALID_STATUSES = ['pending', 'accepted', 'preparing', 'processing', 'ready', 'completed', 'cancelled'] as const;
type OrderStatus = typeof VALID_STATUSES[number];

function hasDeliverableCustomerEmail(email: string | null | undefined): email is string {
  return Boolean(email && !email.toLowerCase().startsWith('cod+'));
}

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
      'SELECT id, status, vendor_id, customer_id, order_number, customer_name FROM orders WHERE id = $1',
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

    const statusLabels: Record<string, string> = {
      accepted: 'Accepted',
      preparing: 'Being Prepared',
      processing: 'Being Prepared',
      ready: 'Ready for Pickup',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    // Send order status update email to customer (fire-and-forget)
    if (hasDeliverableCustomerEmail(order.customer_email)) {
      sendTransactional(order.customer_email, 'order_status_update', {
        customer_name: order.customer_name || 'Customer',
        order_number: order.order_number,
        status: statusLabels[status] || status,
      }).catch(err => console.error('Failed to send vendor status email:', err));
    }

    if (existingOrders[0].status !== status && order.customer_id) {
      notifyCustomerAccount(order.customer_id, {
        type: 'order_update',
        channel: 'in_app',
        title: `Order ${order.order_number} updated`,
        titleHe: `הזמנה ${order.order_number} עודכנה`,
        message: `Your order is now ${statusLabels[status] || status}.`,
        messageHe: `ההזמנה שלך כעת בסטטוס ${statusLabels[status] || status}.`,
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          previousStatus: existingOrders[0].status,
          status,
          actionUrl: `/customer/orders/${order.id}`,
          actionLabel: 'View order',
        },
      }).catch(err => console.error('Failed to create customer order notification:', err));
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
