import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// GET - Retrieve a single order detail for authenticated customer
export async function GET(
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
    if (user.role !== 'customer' || !user.customerId) {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    const { rows } = await query(
      `SELECT o.*, v.name as vendor_name, v.logo_url as vendor_logo
       FROM orders o
       LEFT JOIN vendors v ON o.vendor_id = v.id
       WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, user.customerId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = rows[0];
    if (typeof order.items === 'string') {
      order.items = JSON.parse(order.items);
    }
    if (typeof order.delivery_address === 'string') {
      order.delivery_address = JSON.parse(order.delivery_address);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
