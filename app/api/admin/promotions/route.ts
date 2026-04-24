import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { error: 'Database unavailable', promotions: [], total: 0 },
        { status: 503 }
      );
    }

    try {
      let sql = 'SELECT * FROM promotions';
      const params: any[] = [];

      if (status !== 'all') {
        sql += ' WHERE status = $1';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';

      const { rows } = await query(sql, params);

      return NextResponse.json({
        promotions: rows,
        total: rows.length,
      });
    } catch (err: any) {
      // Handle case where promotions table does not exist yet
      if (err?.message?.includes('does not exist') || err?.code === '42P01') {
        return NextResponse.json({
          promotions: [],
          total: 0,
        });
      }
      console.error('Promotions DB query failed:', err);
      return NextResponse.json(
        { error: 'Database unavailable', promotions: [], total: 0 },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}
