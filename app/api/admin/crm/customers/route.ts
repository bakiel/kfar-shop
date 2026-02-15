import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getCustomers } from '@/lib/services/crm/crm-service';
import { query } from '@/lib/db/postgres-client';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const segment = searchParams.get('segment') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';

    const result = await getCustomers({
      page,
      limit,
      search,
      tier,
      segment,
      tag,
      sortBy,
      sortDir,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('CRM customers GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, loyalty_tier } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `INSERT INTO customers (name, email, phone, loyalty_tier, points, total_orders, total_spent, tags)
       VALUES ($1, $2, $3, $4, 0, 0, 0, ARRAY[]::text[])
       RETURNING *`,
      [name, email, phone || null, loyalty_tier || 'bronze']
    );

    return NextResponse.json({ customer: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('CRM customers POST error:', error);
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
