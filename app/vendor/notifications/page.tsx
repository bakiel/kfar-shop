'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BellOff, Check, Package, ShoppingCart, Store, Tag, Trash2 } from 'lucide-react';
import { notificationService, type Notification } from '@/lib/services/notification-service';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/context/LanguageContext';

const iconMap: Record<string, React.ElementType> = {
  order: ShoppingCart,
  order_update: ShoppingCart,
  product: Package,
  vendor: Store,
  promotion: Tag,
  system: Store,
};

export default function VendorNotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language, isRTL } = useLanguage();
  const recipientId = user?.id || '';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!recipientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await notificationService.getNotifications(recipientId, { limit: 50 });
    setNotifications(result.notifications);
    setUnreadCount(result.unreadCount);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== 'vendor') {
      router.push('/vendor/login');
      return;
    }
    loadNotifications();
  }, [isAuthenticated, isLoading, recipientId, router, user?.role]);

  const markAsRead = async (id: string) => {
    if (await notificationService.markAsRead(id)) {
      setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, read: true, isRead: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  };

  const markAllAsRead = async () => {
    if (await notificationService.markAllAsRead(recipientId)) {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (id: string) => {
    const existing = notifications.find((item) => item.id === id);
    if (await notificationService.deleteNotification(id)) {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (existing && !existing.read) setUnreadCount((count) => Math.max(0, count - 1));
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'he' ? 'התראות ספק' : 'Vendor Notifications'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {language === 'he'
              ? 'עדכוני הזמנות, מוצרים ומערכת עבור החנות שלך.'
              : 'Order, product, and system updates for your store.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#478c0b]/30 px-4 py-2.5 text-sm font-semibold text-[#478c0b] transition-colors hover:bg-[#478c0b]/5"
          >
            <Check className="h-4 w-4 stroke-[1.5]" />
            {language === 'he' ? 'סמן הכל כנקרא' : 'Mark all as read'}
          </button>
        )}
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {language === 'he' ? 'טוען התראות...' : 'Loading notifications...'}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <BellOff className="mx-auto h-10 w-10 text-gray-300 stroke-[1.5]" />
            <p className="mt-3 text-sm text-gray-500">
              {language === 'he' ? 'אין התראות עדיין' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const Icon = iconMap[notification.type] || Store;
              return (
                <article
                  key={notification.id}
                  className={`flex gap-4 p-5 transition-colors hover:bg-gray-50 ${notification.read ? '' : 'bg-[#f0f7eb]'}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#478c0b]/10 text-[#478c0b]">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">{notification.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{notification.message}</p>
                      </div>
                      {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#478c0b]" />}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          onClick={() => markAsRead(notification.id)}
                          className="font-semibold text-[#478c0b] hover:underline"
                        >
                          {notification.actionLabel || 'View'}
                        </Link>
                      )}
                      {!notification.read && (
                        <button onClick={() => markAsRead(notification.id)} className="text-gray-500 hover:text-gray-700">
                          {language === 'he' ? 'סמן כנקרא' : 'Mark as read'}
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notification.id)} className="inline-flex items-center gap-1 text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                        {language === 'he' ? 'מחק' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
