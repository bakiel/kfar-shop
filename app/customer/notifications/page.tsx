'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { toast } from '@/components/ui/use-toast';
import { notificationService, type Notification, type NotificationPreferences } from '@/lib/services/notification-service';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'preferences'>('all');
  const [filter, setFilter] = useState<Notification['type'] | 'all'>('all');

  useEffect(() => {
    // Check if customer is logged in
    const token = localStorage.getItem('customerToken');
    if (!token) {
      router.push('/customer/login');
      return;
    }
    
    // For demo, use a fixed customer ID
    setCustomerId('demo-customer-001');
    loadData('demo-customer-001');
  }, []);

  const loadData = async (customerId: string) => {
    try {
      setLoading(true);
      
      // Load notifications
      const { notifications } = await notificationService.getNotifications(customerId);
      setNotifications(notifications);
      
      // Load preferences
      const prefs = await notificationService.getPreferences(customerId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const handleDelete = async (notificationId: string) => {
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: "Notification deleted",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead(customerId);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "All notifications marked as read",
      });
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    if (!preferences) return;
    
    const newPreferences = { ...preferences };
    
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      (newPreferences as any)[parent][child] = value;
    } else {
      (newPreferences as any)[key] = value;
    }
    
    setPreferences(newPreferences);
    
    const success = await notificationService.updatePreferences(customerId, newPreferences);
    if (success) {
      toast({
        title: "Preferences updated",
      });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      order: 'fa-shopping-bag',
      reward: 'fa-star',
      product: 'fa-box',
      vendor: 'fa-store',
      system: 'fa-info-circle',
      promotion: 'fa-tag'
    };
    return icons[type] || 'fa-bell';
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      order: 'text-green-600 bg-green-50',
      reward: 'text-yellow-600 bg-yellow-50',
      product: 'text-blue-600 bg-blue-50',
      vendor: 'text-purple-600 bg-purple-50',
      system: 'text-gray-600 bg-gray-50',
      promotion: 'text-red-600 bg-red-50'
    };
    return colors[type];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/customer/dashboard/enhanced"
                className="text-white/80 hover:text-white"
              >
                <i className="fas fa-arrow-left" />
              </Link>
              <h1 className="text-2xl font-bold">Notification Center</h1>
            </div>
            <p className="opacity-90">
              Manage your notifications and preferences
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'preferences'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Preferences
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'all' ? (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filter Bar */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Filter:</span>
                      <div className="flex gap-2">
                        {(['all', 'order', 'reward', 'product', 'vendor', 'promotion'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              filter === type
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-lg">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">No notifications found</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-6 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              getNotificationColor(notification.type)
                            }`}>
                              <i className={`fas ${getNotificationIcon(notification.type)} text-lg`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                    {notification.title}
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </h3>
                                  <p className="text-gray-600">{notification.message}</p>
                                </div>
                                <span className="text-sm text-gray-400 whitespace-nowrap">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-4 mt-3">
                                {notification.actionUrl && (
                                  <Link
                                    href={notification.actionUrl}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-sm font-medium text-green-600 hover:text-green-700"
                                  >
                                    {notification.actionLabel || 'View'} →
                                  </Link>
                                )}
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-sm text-red-500 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                
                {preferences && (
                  <div className="space-y-6">
                    {/* Channels */}
                    <div>
                      <h3 className="font-medium mb-4">Notification Channels</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">Email Notifications</span>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.email}
                            onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">SMS Notifications</span>
                            <p className="text-sm text-gray-600">Get text messages for important updates</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.sms}
                            onChange={(e) => handlePreferenceChange('sms', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">Push Notifications</span>
                            <p className="text-sm text-gray-600">Browser push notifications</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.push}
                            onChange={(e) => handlePreferenceChange('push', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">In-App Notifications</span>
                            <p className="text-sm text-gray-600">Show notifications in the app</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.inApp}
                            onChange={(e) => handlePreferenceChange('inApp', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="font-medium mb-4">Notification Categories</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-shopping-bag text-green-600" />
                            <span>Order Updates</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.categories.orders}
                            onChange={(e) => handlePreferenceChange('categories.orders', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-star text-yellow-600" />
                            <span>Rewards & Points</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.categories.rewards}
                            onChange={(e) => handlePreferenceChange('categories.rewards', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-box text-blue-600" />
                            <span>Product Recommendations</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.categories.products}
                            onChange={(e) => handlePreferenceChange('categories.products', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-store text-purple-600" />
                            <span>Vendor Updates</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.categories.vendors}
                            onChange={(e) => handlePreferenceChange('categories.vendors', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-tag text-red-600" />
                            <span>Promotions & Deals</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.categories.promotions}
                            onChange={(e) => handlePreferenceChange('categories.promotions', e.target.checked)}
                            className="w-5 h-5 text-green-600"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Save Confirmation */}
                    <div className="pt-4">
                      <p className="text-sm text-gray-600 text-center">
                        <i className="fas fa-check-circle text-green-600 mr-2" />
                        Preferences are saved automatically
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}