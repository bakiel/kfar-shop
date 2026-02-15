// Server-only notification operations (uses PostgreSQL directly)
// This file MUST NOT be imported from client components.
// API routes should import from here for direct DB access.
//
// Client components should import from notification-service.ts which
// provides a fetch-based wrapper.

import { query, isDbAvailable } from '@/lib/db/postgres-client';

import type {
  Notification,
  CreateNotificationData,
  GetNotificationsOptions,
  PaginatedNotifications,
} from './notification-service';

// -------------------------------------------------------------------
// Row mapper
// -------------------------------------------------------------------

function mapRow(row: any): Notification {
  const data = row.data || {};
  return {
    id: row.id,
    userId: row.user_id || null,
    customerId: row.customer_id || null,
    type: row.type,
    channel: row.channel || 'in_app',
    title: row.title,
    titleHe: row.title_he || null,
    message: row.message,
    messageHe: row.message_he || null,
    data,
    isRead: row.is_read,
    readAt: row.read_at ? new Date(row.read_at) : null,
    sentAt: row.sent_at ? new Date(row.sent_at) : null,
    createdAt: new Date(row.created_at),
    // Legacy compatibility
    read: row.is_read,
    priority: data.priority || 'medium',
    actionUrl: data.actionUrl || data.action_url,
    actionLabel: data.actionLabel || data.action_label,
    metadata: data,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
  };
}

// -------------------------------------------------------------------
// CRUD operations
// -------------------------------------------------------------------

export async function createNotification(
  data: CreateNotificationData
): Promise<Notification | null> {
  const channel = data.channel || 'in_app';

  try {
    const dbOk = await isDbAvailable();
    if (!dbOk) {
      console.warn('[notification-service] DB unavailable, skipping notification');
      return null;
    }

    const { rows } = await query(
      `INSERT INTO notifications
        (user_id, customer_id, type, channel, title, title_he, message, message_he, data, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.userId || null,
        data.customerId || null,
        data.type,
        channel,
        data.title,
        data.titleHe || null,
        data.message,
        data.messageHe || null,
        JSON.stringify(data.data || {}),
        channel === 'in_app' ? new Date() : null,
      ]
    );

    const notification = mapRow(rows[0]);

    // WhatsApp dispatch (simple URL logging, no heavy deps)
    if (channel === 'whatsapp' && data.recipientPhone) {
      const cleanPhone = data.recipientPhone.replace(/\D/g, '');
      const message = `${notification.title}\n\n${notification.message}`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      console.log('[notification-service] WhatsApp URL:', whatsappUrl);
      await query('UPDATE notifications SET sent_at = NOW() WHERE id = $1', [notification.id]);
    }

    return notification;
  } catch (err) {
    console.error('[notification-service] createNotification error:', err);
    return null;
  }
}

export async function getNotifications(
  userId: string,
  opts: GetNotificationsOptions = {}
): Promise<PaginatedNotifications> {
  const page = opts.page || 1;
  const limit = Math.min(opts.limit || 20, 100);
  const offset = opts.offset !== undefined ? opts.offset : (page - 1) * limit;

  try {
    const dbOk = await isDbAvailable();
    if (!dbOk) {
      return { notifications: [], total: 0, page, limit, unreadCount: 0 };
    }

    const conditions: string[] = ['(user_id = $1 OR customer_id::text = $1)'];
    const params: any[] = [userId];

    if (opts.unreadOnly) {
      conditions.push('is_read = false');
    }
    if (opts.type) {
      params.push(opts.type);
      conditions.push(`type = $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE ${where}`,
      params
    );
    const total = parseInt(countRows[0].count, 10);

    const { rows: unreadRows } = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE (user_id = $1 OR customer_id::text = $1) AND is_read = false',
      [userId]
    );
    const unreadCount = parseInt(unreadRows[0].count, 10);

    const fetchParams = [...params, limit, offset];
    const { rows } = await query(
      `SELECT * FROM notifications WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${fetchParams.length - 1} OFFSET $${fetchParams.length}`,
      fetchParams
    );

    return {
      notifications: rows.map(mapRow),
      total,
      page,
      limit,
      unreadCount,
    };
  } catch (err) {
    console.error('[notification-service] getNotifications error:', err);
    return { notifications: [], total: 0, page, limit, unreadCount: 0 };
  }
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const { rowCount } = await query(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1',
      [notificationId]
    );
    return rowCount > 0;
  } catch (err) {
    console.error('[notification-service] markAsRead error:', err);
    return false;
  }
}

export async function markAllRead(userId: string): Promise<boolean> {
  try {
    await query(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE (user_id = $1 OR customer_id::text = $1) AND is_read = false',
      [userId]
    );
    return true;
  } catch (err) {
    console.error('[notification-service] markAllRead error:', err);
    return false;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const dbOk = await isDbAvailable();
    if (!dbOk) return 0;

    const { rows } = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE (user_id = $1 OR customer_id::text = $1) AND is_read = false',
      [userId]
    );
    return parseInt(rows[0].count, 10);
  } catch (err) {
    console.error('[notification-service] getUnreadCount error:', err);
    return 0;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { rowCount } = await query(
      'DELETE FROM notifications WHERE id = $1',
      [notificationId]
    );
    return rowCount > 0;
  } catch (err) {
    console.error('[notification-service] deleteNotification error:', err);
    return false;
  }
}

export async function markAsSent(notificationId: string): Promise<boolean> {
  try {
    const { rowCount } = await query(
      'UPDATE notifications SET sent_at = NOW() WHERE id = $1',
      [notificationId]
    );
    return rowCount > 0;
  } catch (err) {
    console.error('[notification-service] markAsSent error:', err);
    return false;
  }
}
