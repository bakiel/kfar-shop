// Notification Service - Client & Server compatible
//
// This module provides:
// 1. Type exports used by both client and server code
// 2. `notificationService` singleton used by client components (fetch-based)
//
// Server-side code (API routes) should import from
// `@/lib/services/notification-service.server` for direct DB access.
// This file intentionally has NO imports of pg, nodemailer, or other
// Node.js-only modules so it can be safely bundled for the browser.

// -------------------------------------------------------------------
// Types (exported for both server & client)
// -------------------------------------------------------------------

export type NotificationType =
  | 'order_update'
  | 'promotion'
  | 'points'
  | 'system'
  | 'reward'
  | 'vendor'
  | 'product'
  // Legacy types used by existing components
  | 'order';

export type NotificationChannel = 'in_app' | 'email' | 'whatsapp';

export interface CreateNotificationData {
  userId?: string;
  customerId?: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  titleHe?: string;
  message: string;
  messageHe?: string;
  data?: Record<string, any>;
  // For email dispatch (handled by API route)
  recipientEmail?: string;
  emailTemplate?: string;
  emailVariables?: Record<string, string>;
  emailLanguage?: 'en' | 'he';
  // For WhatsApp dispatch
  recipientPhone?: string;
}

export interface Notification {
  id: string;
  userId: string | null;
  customerId: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  titleHe: string | null;
  message: string;
  messageHe: string | null;
  data: Record<string, any>;
  isRead: boolean;
  readAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  // Legacy fields for backward compatibility with existing components
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    orders: boolean;
    rewards: boolean;
    products: boolean;
    vendors: boolean;
    promotions: boolean;
  };
}

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

// -------------------------------------------------------------------
// Default preferences
// -------------------------------------------------------------------

function getDefaultPreferences(): NotificationPreferences {
  return {
    email: true,
    sms: false,
    push: false,
    inApp: true,
    categories: {
      orders: true,
      rewards: true,
      products: true,
      vendors: true,
      promotions: true,
    },
  };
}

// -------------------------------------------------------------------
// notificationService singleton
// Client components import this and call methods that hit the API
// routes. No Node.js-only dependencies are used here.
// -------------------------------------------------------------------

export const notificationService = {
  async getNotifications(
    userOrCustomerId: string,
    opts: GetNotificationsOptions = {}
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    try {
      const params = new URLSearchParams();
      params.set('customerId', userOrCustomerId);
      if (opts.unreadOnly) params.set('unreadOnly', 'true');
      if (opts.limit !== undefined) params.set('limit', String(opts.limit));
      if (opts.offset !== undefined) params.set('offset', String(opts.offset));

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Normalize dates and legacy fields
      const notifications = (data.notifications || []).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt || n.created_at),
        read: n.read ?? n.isRead ?? false,
        isRead: n.isRead ?? n.read ?? false,
      }));
      return { notifications, unreadCount: data.unreadCount ?? 0 };
    } catch (err) {
      console.error('[notification-service] getNotifications error:', err);
      return { notifications: [], unreadCount: 0 };
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action: 'markAsRead' }),
      });
      const data = await res.json();
      return data.success ?? false;
    } catch {
      return false;
    }
  },

  async markAllAsRead(customerOrUserId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customerOrUserId, action: 'markAllAsRead' }),
      });
      const data = await res.json();
      return data.success ?? false;
    } catch {
      return false;
    }
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action: 'delete' }),
      });
      const data = await res.json();
      return data.success ?? false;
    } catch {
      return false;
    }
  },

  async getUnreadCount(userOrCustomerId: string): Promise<number> {
    try {
      const res = await fetch(`/api/notifications?customerId=${userOrCustomerId}&unreadOnly=true&limit=0`);
      const data = await res.json();
      return data.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  async getPreferences(customerId: string): Promise<NotificationPreferences> {
    try {
      const res = await fetch(`/api/notifications/preferences?customerId=${customerId}`);
      if (!res.ok) return getDefaultPreferences();
      return await res.json();
    } catch {
      return getDefaultPreferences();
    }
  },

  async updatePreferences(
    customerId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, preferences }),
      });
      const data = await res.json();
      return data.success ?? false;
    } catch {
      return false;
    }
  },
};
