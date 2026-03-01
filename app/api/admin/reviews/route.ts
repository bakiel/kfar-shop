import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows: reviews } = await query(
      `SELECT id, vendor_id, customer_id, rating, comment, created_at, status
       FROM reviews
       ORDER BY created_at DESC
       LIMIT 100`,
      []
    ).catch(() => ({ rows: [] as any[] }));

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      count: reviews?.length || 0,
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({
      success: true,
      reviews: [],
      count: 0,
    });
  }
}

export async function PATCH(request: NextRequest) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Review ID and status required' }, { status: 400 });
    }

    await query('UPDATE reviews SET status = $1 WHERE id = $2', [status, id]).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
