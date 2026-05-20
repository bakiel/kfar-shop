import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllRead,
  deleteNotification,
  markAsSent,
} from '@/lib/services/notification-service.server';
import { sendTransactional, sendRaw } from '@/lib/services/email/email-service';

/**
 * GET /api/notifications
 * Get notifications for the authenticated user.
 *
 * Query params:
 *  - page (default 1)
 *  - limit (default 20, max 100)
 *  - offset (legacy - used by existing components)
 *  - unreadOnly (boolean)
 *  - type (filter by notification type)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    const queryId = user.customerId || user.id;
    if (customerId && customerId !== queryId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await getNotifications(queryId, {
      page,
      limit,
      offset,
      unreadOnly,
      type: type as any,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 *
 * Supports two modes:
 * 1. Legacy actions (from existing components):
 *    body: { action: 'markAsRead'|'delete'|'markAllAsRead', notificationId?, customerId? }
 * 2. Create notification (admin only):
 *    body: { title, message, type, ... } (no action field)
 *    When channel='email', also dispatches via email-service.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate first for ALL POST actions
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // --- Legacy action mode (backward compatibility) ---
    if (body.action) {
      const { notificationId, action } = body;

      // Resolve the user/customer ID to scope operations against
      const actorId = user.customerId || user.id;

      let success = false;

      switch (action) {
        case 'markAsRead': {
          if (!notificationId) {
            return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
          }
          // Verify the notification belongs to the authenticated user
          const { rows: readRows } = await query(
            'SELECT id FROM notifications WHERE id = $1 AND (user_id = $2 OR customer_id::text = $2)',
            [notificationId, actorId]
          );
          if (readRows.length === 0) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
          }
          success = await markAsRead(notificationId);
          break;
        }
        case 'delete': {
          if (!notificationId) {
            return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
          }
          // Verify the notification belongs to the authenticated user
          const { rows: deleteRows } = await query(
            'SELECT id FROM notifications WHERE id = $1 AND (user_id = $2 OR customer_id::text = $2)',
            [notificationId, actorId]
          );
          if (deleteRows.length === 0) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
          }
          success = await deleteNotification(notificationId);
          break;
        }
        case 'markAllAsRead':
          success = await markAllRead(actorId);
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({ success });
    }

    // --- Create notification mode (requires admin auth) ---
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!body.title || !body.message || !body.type) {
      return NextResponse.json(
        { error: 'title, message, and type are required' },
        { status: 400 }
      );
    }

    const notification = await createNotification(body);

    if (!notification) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // Dispatch email if channel is 'email'
    if (body.channel === 'email' && body.recipientEmail) {
      try {
        if (body.emailTemplate) {
          await sendTransactional(
            body.recipientEmail,
            body.emailTemplate,
            body.emailVariables || {},
            body.emailLanguage || 'en'
          );
        } else {
          await sendRaw(
            body.recipientEmail,
            notification.title,
            `<p>${notification.message}</p>`,
            body.emailLanguage || 'en'
          );
        }
        await markAsSent(notification.id);
      } catch (emailErr) {
        console.error('Email dispatch error:', emailErr);
        // Notification was still created, just email failed
      }
    }

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
