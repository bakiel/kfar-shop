import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable, query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';
import {
  notifyCustomerAccount,
  notifyVendorOwners,
} from '@/lib/services/account-notification-events.server';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { error: 'Database unavailable', orders: [] },
        { status: 503 }
      );
    }

    let orders: any[];
    try {
      const filters: any = {};
      if (status && status !== 'all') filters.status = status;
      if (vendorId) filters.vendorId = vendorId;
      orders = await db.orders.findAll(filters);
    } catch (err) {
      console.error('Orders DB query failed:', err);
      return NextResponse.json(
        { error: 'Database unavailable', orders: [] },
        { status: 503 }
      );
    }

    // Paginate
    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);

    // Summary counts (over entire dataset, not just page)
    const summary = {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    try {
      const { rows: existingRows } = await query(
        'SELECT id, order_number, status, vendor_id, customer_id FROM orders WHERE id::text = $1 OR order_number = $1',
        [orderId]
      );

      if (existingRows.length === 0) {
        return NextResponse.json(
          { error: `Order ${orderId} not found` },
          { status: 404 }
        );
      }

      const existingOrder = existingRows[0];
      const updated = await db.orders.updateStatus(existingOrder.id, status);
      if (!updated) {
        return NextResponse.json(
          { error: `Order ${orderId} not found` },
          { status: 404 }
        );
      }

      if (existingOrder.status !== status) {
        const statusLabels: Record<string, string> = {
          pending: 'Pending',
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled',
        };

        if (updated.customer_id) {
          notifyCustomerAccount(updated.customer_id, {
            type: 'order_update',
            channel: 'in_app',
            title: `Order ${updated.order_number} updated`,
            titleHe: `הזמנה ${updated.order_number} עודכנה`,
            message: `Your order is now ${statusLabels[status] || status}.`,
            messageHe: `ההזמנה שלך כעת בסטטוס ${statusLabels[status] || status}.`,
            data: {
              orderId: updated.id,
              orderNumber: updated.order_number,
              previousStatus: existingOrder.status,
              status,
              actionUrl: `/customer/orders/${updated.id}`,
              actionLabel: 'View order',
            },
          }).catch(err => console.error('Failed to create admin order customer notification:', err));
        }

        if (updated.vendor_id) {
          notifyVendorOwners(updated.vendor_id, {
            type: 'order_update',
            channel: 'in_app',
            title: `Order ${updated.order_number} updated`,
            titleHe: `הזמנה ${updated.order_number} עודכנה`,
            message: `Admin updated the order to ${statusLabels[status] || status}.`,
            messageHe: `מנהל עדכן את ההזמנה לסטטוס ${statusLabels[status] || status}.`,
            data: {
              orderId: updated.id,
              orderNumber: updated.order_number,
              previousStatus: existingOrder.status,
              status,
              actionUrl: '/vendor/orders',
              actionLabel: 'View orders',
            },
          }).catch(err => console.error('Failed to create admin order vendor notification:', err));
        }
      }

      return NextResponse.json({
        success: true,
        order: updated,
        message: `Order ${orderId} updated to ${status}`,
      });
    } catch (err) {
      console.error('Order update DB error:', err);
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
