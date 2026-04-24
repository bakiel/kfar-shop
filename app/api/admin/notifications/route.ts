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
    const { rows: notifications } = await query(
      `SELECT id, title, message, type, status, created_at
       FROM notifications
       ORDER BY created_at DESC
       LIMIT 100`,
      []
    ).catch(() => ({ rows: [] as any[] }));

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      count: notifications?.length || 0,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ success: true, notifications: [], count: 0 });
  }
}
