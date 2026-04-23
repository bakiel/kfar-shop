'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Info,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { DataTable, LoadingState, PageHeader, StatCard } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

type NotificationType = 'order_update' | 'system' | 'promotion' | 'vendor' | 'product' | 'reward' | 'points' | 'order';

interface AdminNotification extends Record<string, unknown> {
  id: string;
  type: NotificationType;
  channel: string;
  title: string;
  titleHe?: string | null;
  message: string;
  messageHe?: string | null;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  orderId?: string;
  orderNumber?: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const iconMap: Record<NotificationType, React.ReactNode> = {
  order_update: <ShoppingCart className="w-4 h-4 stroke-[1.5]" />,
  order: <ShoppingCart className="w-4 h-4 stroke-[1.5]" />,
  promotion: <Tag className="w-4 h-4 stroke-[1.5]" />,
  system: <Info className="w-4 h-4 stroke-[1.5]" />,
  vendor: <Bell className="w-4 h-4 stroke-[1.5]" />,
  product: <Bell className="w-4 h-4 stroke-[1.5]" />,
  reward: <Bell className="w-4 h-4 stroke-[1.5]" />,
  points: <Bell className="w-4 h-4 stroke-[1.5]" />,
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { isRTL } = useLanguage();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async (background = false) => {
    if (!accessToken) return;
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/notifications?limit=100', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const normalized: AdminNotification[] = (data.notifications || []).map((notification: any) => ({
        id: notification.id,
        type: notification.type || 'system',
        channel: notification.channel || 'in_app',
        title: notification.title || '',
        titleHe: notification.title_he || null,
        message: notification.message || '',
        messageHe: notification.message_he || null,
        isRead: !!notification.is_read,
        createdAt: notification.created_at,
        actionUrl: notification.data?.actionUrl || notification.data?.action_url,
        orderId: notification.data?.orderId,
        orderNumber: notification.data?.orderNumber,
      }));
      setNotifications(normalized);
    } catch (err: any) {
      console.error('Admin notifications fetch error:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    fetchNotifications();
  }, [accessToken, fetchNotifications]);

  useEffect(() => {
    if (!accessToken) return;
    const timer = setInterval(() => {
      fetchNotifications(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [accessToken, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: 'markAsRead', notificationId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [accessToken]);

  const markAllAsRead = useCallback(async () => {
    if (!accessToken) return;
    setMarkingAll(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: 'markAllAsRead' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingAll(false);
    }
  }, [accessToken]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const summary = useMemo(() => {
    const unread = notifications.filter((notification) => !notification.isRead).length;
    const orderAlerts = notifications.filter((notification) => notification.type === 'order_update').length;
    const recent = notifications.filter((notification) => {
      const createdAt = new Date(notification.createdAt).getTime();
      return Date.now() - createdAt <= 24 * 60 * 60 * 1000;
    }).length;
    return {
      total: notifications.length,
      unread,
      orderAlerts,
      recent,
    };
  }, [notifications]);

  const columns: Column<AdminNotification>[] = [
    {
      key: 'title',
      header: isRTL ? 'התראה' : 'Notification',
      render: (notification) => {
        const displayTitle = isRTL ? notification.titleHe || notification.title : notification.title;
        return (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center ${
                notification.type === 'order_update' ? 'bg-[#2D5A27]/10 text-[#2D5A27]' : 'bg-gray-100 text-gray-500'
              }`}>
                {iconMap[notification.type]}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                    {displayTitle}
                  </span>
                  {!notification.isRead && (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#E8B84D]" />
                  )}
                </div>
                {notification.orderNumber && (
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {notification.orderNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'message',
      header: isRTL ? 'פרטים' : 'Details',
      render: (notification) => {
        const displayMessage = isRTL ? notification.messageHe || notification.message : notification.message;
        return (
          <p className="max-w-xl text-sm text-gray-600 line-clamp-2">
            {displayMessage}
          </p>
        );
      },
    },
    {
      key: 'channel',
      header: isRTL ? 'ערוץ' : 'Channel',
      render: (notification) => (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
          {notification.channel.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: isRTL ? 'התקבל' : 'Received',
      sortable: true,
      render: (notification) => (
        <span className="text-sm text-gray-500">
          {new Date(notification.createdAt).toLocaleString(isRTL ? 'he-IL' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: isRTL ? 'סטטוס' : 'Status',
      render: (notification) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            notification.isRead
              ? 'bg-gray-100 text-gray-600'
              : 'bg-[#2D5A27]/10 text-[#2D5A27]'
          }`}
        >
          {notification.isRead
            ? (isRTL ? 'נקראה' : 'Read')
            : (isRTL ? 'חדשה' : 'Unread')}
        </span>
      ),
    },
  ];

  if (loading) {
    return <LoadingState type="page" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bell className="w-10 h-10 text-amber-500 stroke-[1.5] mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {isRTL ? 'שגיאה בטעינת ההתראות' : 'Failed to load notifications'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => fetchNotifications()}
          className="px-4 py-2 text-sm font-medium text-white bg-[#2D5A27] rounded-lg hover:bg-[#234A1F] transition-colors cursor-pointer"
        >
          {isRTL ? 'נסה שוב' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'התראות מנהל' : 'Admin Notifications'}
          subtitle={isRTL ? 'התראות הזמנות ומערכת בזמן אמת' : 'Live order and system notifications'}
          isRTL={isRTL}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" /> : <RefreshCw className="w-4 h-4 stroke-[1.5]" />}
                {isRTL ? 'רענן' : 'Refresh'}
              </button>
              <button
                onClick={markAllAsRead}
                disabled={summary.unread === 0 || markingAll}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2D5A27] px-3 py-2 text-sm font-medium text-white hover:bg-[#234A1F] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingAll ? <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" /> : <CheckCheck className="w-4 h-4 stroke-[1.5]" />}
                {isRTL ? 'סמן הכל כנקרא' : 'Mark All Read'}
              </button>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title={isRTL ? 'סה״כ התראות' : 'Total Notifications'}
          value={summary.total}
          icon={<Bell className="w-5 h-5 stroke-[1.5]" />}
          color="blue"
        />
        <StatCard
          title={isRTL ? 'לא נקראו' : 'Unread'}
          value={summary.unread}
          icon={<CheckCheck className="w-5 h-5 stroke-[1.5]" />}
          color="amber"
        />
        <StatCard
          title={isRTL ? 'התראות הזמנה' : 'Order Alerts'}
          value={summary.orderAlerts}
          icon={<ShoppingCart className="w-5 h-5 stroke-[1.5]" />}
          color="green"
        />
        <StatCard
          title={isRTL ? '24 שעות אחרונות' : 'Last 24 Hours'}
          value={summary.recent}
          icon={<RefreshCw className="w-5 h-5 stroke-[1.5]" />}
          color="purple"
        />
      </motion.div>

      <motion.div variants={item} className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'all', label: isRTL ? 'הכל' : 'All', count: summary.total },
          { id: 'unread', label: isRTL ? 'לא נקראו' : 'Unread', count: summary.unread },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => setFilter(option.id as 'all' | 'unread')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              filter === option.id
                ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span>{option.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              filter === option.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <DataTable
          columns={columns}
          data={filteredNotifications}
          searchable={true}
          searchPlaceholder={isRTL ? 'חפש בהתראות...' : 'Search notifications...'}
          pageSize={10}
          emptyTitle={isRTL ? 'אין התראות' : 'No notifications'}
          emptyDescription={isRTL ? 'התראות הזמנות ומערכת יופיעו כאן' : 'Order and system notifications will appear here'}
          emptyIcon="file"
          isRTL={isRTL}
          onRowClick={(notification) => {
            if (notification.actionUrl) {
              if (!notification.isRead) markAsRead(notification.id);
              router.push(notification.actionUrl);
            }
          }}
          rowActions={(notification) => {
            const actions: { label: string; onClick: () => void; destructive?: boolean }[] = [];
            if (!notification.isRead) {
              actions.push({
                label: isRTL ? 'סמן כנקראה' : 'Mark as read',
                onClick: () => markAsRead(notification.id),
              });
            }
            if (notification.actionUrl) {
              actions.push({
                label: isRTL ? 'פתח הזמנה' : 'Open order',
                onClick: () => {
                  if (!notification.isRead) markAsRead(notification.id);
                  router.push(notification.actionUrl!);
                },
              });
            } else if (notification.orderId) {
              actions.push({
                label: isRTL ? 'צפה בהזמנות' : 'View orders',
                onClick: () => router.push('/admin/orders'),
              });
            } else {
              actions.push({
                label: isRTL ? 'צפה בפרטים' : 'View details',
                onClick: () => {},
              });
            }
            return actions;
          }}
        />
      </motion.div>
    </motion.div>
  );
}
