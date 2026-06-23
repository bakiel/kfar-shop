import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getUnreadCount } from '@/lib/services/notification-service.server';

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await getUnreadCount(user.customerId || user.id);

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
