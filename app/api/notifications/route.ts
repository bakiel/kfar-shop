import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
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
 * Get notifications for the authenticated user OR by customerId query param
 * (backward compatible with existing client components).
 *
 * Query params:
 *  - customerId (legacy - used by existing components)
 *  - page (default 1)
 *  - limit (default 20, max 100)
 *  - offset (legacy - used by existing components)
 *  - unreadOnly (boolean)
 *  - type (filter by notification type)
 */
export async function GET(request: NextRequest) {
  try {
    // Try auth header first, fall back to customerId param (legacy)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    // Resolve the user/customer ID to query against
    const queryId = user?.id || customerId;
    if (!queryId) {
      return NextResponse.json(
        { error: 'Authentication required or customerId param needed' },
        { status: 401 }
      );
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
    const body = await request.json();

    // --- Legacy action mode (backward compatibility) ---
    if (body.action) {
      const { notificationId, action, customerId } = body;

      let success = false;

      switch (action) {
        case 'markAsRead':
          if (!notificationId) {
            return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
          }
          success = await markAsRead(notificationId);
          break;
        case 'delete':
          if (!notificationId) {
            return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
          }
          success = await deleteNotification(notificationId);
          break;
        case 'markAllAsRead':
          if (!customerId) {
            return NextResponse.json({ error: 'customerId required' }, { status: 400 });
          }
          success = await markAllRead(customerId);
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({ success });
    }

    // --- Create notification mode (requires admin auth) ---
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
