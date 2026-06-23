import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function normalizeCustomer(row: any) {
  return {
    type: 'customer',
    id: String(row.id),
    name: row.name || 'Customer',
    tier: row.loyalty_tier || row.tier || 'bronze',
    points: Number(row.points ?? row.balance ?? 0),
    email: row.email || '',
    phone: row.phone || '',
    preferences: {
      dietary: Array.isArray(row.dietary_restrictions) ? row.dietary_restrictions : [],
      allergies: Array.isArray(row.preferences?.allergies) ? row.preferences.allergies : [],
      favoriteCategories: Array.isArray(row.preferences?.favoriteCategories) ? row.preferences.favoriteCategories : [],
    },
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'vendor' && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const lookup = decodeURIComponent(id).trim();
    if (!lookup) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    const { rows } = await query(
      `SELECT c.*, rp.balance, rp.tier
       FROM customers c
       LEFT JOIN rewards_points rp ON rp.customer_id = c.id
       WHERE c.id::text = $1 OR LOWER(c.email) = LOWER($1) OR c.phone = $1
       LIMIT 1`,
      [lookup]
    );

    if (!rows[0]) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(normalizeCustomer(rows[0]));
  } catch (error) {
    console.error('Customer lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}
