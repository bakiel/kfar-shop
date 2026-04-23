import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';

async function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const { verifyAccessToken } = await import('@/lib/services/auth-service');
  return verifyAccessToken(token);
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const parsedLimit = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(200, parsedLimit)) : 100;

    const whereClauses = ['customer_id IS NULL'];
    const params: Array<string | number> = [];

    if (unreadOnly) {
      whereClauses.push('is_read = false');
    }

    if (type) {
      params.push(type);
      whereClauses.push(`type = $${params.length}`);
    }

    const where = whereClauses.join(' AND ');

    const { rows: notifications } = await query(
      `SELECT
         id,
         title,
         title_he,
         message,
         message_he,
         type,
         channel,
         data,
         is_read,
         read_at,
         sent_at,
         created_at
       FROM notifications
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}`,
      [...params, limit]
    ).catch(() => ({ rows: [] as any[] }));

    const { rows: unreadRows } = await query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE customer_id IS NULL AND is_read = false`,
      []
    ).catch(() => ({ rows: [{ count: 0 }] as any[] }));

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      count: notifications?.length || 0,
      unreadCount: Number(unreadRows?.[0]?.count || 0),
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ success: true, notifications: [], count: 0, unreadCount: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'markAsRead') {
      if (!body?.notificationId) {
        return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
      }

      const { rowCount } = await query(
        `UPDATE notifications
         SET is_read = true, read_at = NOW()
         WHERE id = $1 AND customer_id IS NULL`,
        [body.notificationId]
      );

      return NextResponse.json({ success: rowCount > 0 });
    }

    if (action === 'markAllAsRead') {
      await query(
        `UPDATE notifications
         SET is_read = true, read_at = NOW()
         WHERE customer_id IS NULL AND is_read = false`,
        []
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Notifications update error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
