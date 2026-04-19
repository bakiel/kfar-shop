import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

// POST /api/customer/orders/[id]/reorder
// Returns normalized cart items drawn from a prior order belonging to the
// authenticated customer. The client is responsible for adding them into the
// in-memory cart via CartContext — keeping the DB contract read-only.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'customer' || !user.customerId) {
      return NextResponse.json({ error: 'Customer access required' }, { status: 403 });
    }

    const { id: orderId } = await params;

    const { rows } = await query(
      `SELECT o.items, o.vendor_id, v.name as vendor_name
       FROM orders o
       LEFT JOIN vendors v ON o.vendor_id = v.id
       WHERE o.id = $1 AND o.customer_id = $2`,
      [orderId, user.customerId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const raw = rows[0].items;
    const rawItems = Array.isArray(raw)
      ? raw
      : (typeof raw === 'string' ? JSON.parse(raw) : []);

    // Normalize to CartItem shape
    const items = (rawItems || []).map((it: any) => ({
      id: it.id || it.productId || it.product_id,
      name: it.name || '',
      vendorId: it.vendorId || it.vendor_id || rows[0].vendor_id || '',
      vendorName: it.vendorName || it.vendor_name || rows[0].vendor_name || '',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      image: it.image || '',
    })).filter((it: any) => it.id);

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('reorder error', err);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
