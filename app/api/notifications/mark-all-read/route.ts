import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { markAllRead } from '@/lib/services/notification-service.server';

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user.
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actorId = user.customerId || user.id;
    const success = await markAllRead(actorId);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('PATCH /api/notifications/mark-all-read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}
