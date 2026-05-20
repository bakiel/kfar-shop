import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function requireCustomer(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;
  if (!user) return { error: 'Authentication required', status: 401 as const };
  if (user.role !== 'customer' || !user.customerId) {
    return { error: 'Customer access required', status: 403 as const };
  }
  return { user };
}

// GET — load saved shopping list for authenticated customer
export async function GET(request: NextRequest) {
  try {
    const auth = requireCustomer(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { rows } = await query(
      'SELECT items, updated_at FROM customer_carts WHERE customer_id = $1',
      [auth.user.customerId]
    );

    const items = rows.length > 0
      ? (typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items)
      : [];

    return NextResponse.json({
      success: true,
      items: Array.isArray(items) ? items : [],
      updatedAt: rows[0]?.updated_at ?? null,
    });
  } catch (err) {
    console.error('customer/cart GET error', err);
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

// PUT — replace saved shopping list with the client-supplied items
export async function PUT(request: NextRequest) {
  try {
    const auth = requireCustomer(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    // Upsert
    await query(
      `INSERT INTO customer_carts (customer_id, items, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (customer_id)
       DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()`,
      [auth.user.customerId, JSON.stringify(items)]
    );

    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    console.error('customer/cart PUT error', err);
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 });
  }
}

// DELETE — clear the saved shopping list for authenticated customer
export async function DELETE(request: NextRequest) {
  try {
    const auth = requireCustomer(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await query(
      `INSERT INTO customer_carts (customer_id, items, updated_at)
       VALUES ($1, '[]'::jsonb, NOW())
       ON CONFLICT (customer_id)
       DO UPDATE SET items = '[]'::jsonb, updated_at = NOW()`,
      [auth.user.customerId]
    );

    return NextResponse.json({ success: true, count: 0 });
  } catch (err) {
    console.error('customer/cart DELETE error', err);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
