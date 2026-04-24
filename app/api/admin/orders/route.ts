import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

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
      const updated = await db.orders.updateStatus(orderId, status);
      if (!updated) {
        return NextResponse.json(
          { error: `Order ${orderId} not found` },
          { status: 404 }
        );
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
