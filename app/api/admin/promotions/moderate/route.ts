import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promotionId, action } = await request.json();

    // Validate input
    if (!promotionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const { rows: columnRows } = await query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'promotions'`,
      []
    );
    const columns = new Set(columnRows.map(row => row.column_name));
    if (!columns.has('status')) {
      return NextResponse.json({ error: 'Promotions status column unavailable' }, { status: 503 });
    }

    const nextStatus = action === 'approve' ? 'approved' : 'rejected';
    const updates = ['status = $2'];
    const values: any[] = [promotionId, nextStatus];

    if (columns.has('is_active')) {
      values.push(action === 'approve');
      updates.push(`is_active = $${values.length}`);
    }
    if (columns.has('updated_at')) {
      updates.push('updated_at = NOW()');
    }

    const { rows } = await query(
      `UPDATE promotions
       SET ${updates.join(', ')}
       WHERE id::text = $1::text
       RETURNING *`,
      values
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      promotion: rows[0],
      message: `Promotion ${action}d successfully`
    });
  } catch (error) {
    console.error('Error moderating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to moderate promotion' },
      { status: 500 }
    );
  }
}
