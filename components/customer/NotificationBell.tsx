'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '@/lib/services/notification-service';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  customerId?: string;
  userId?: string;
  notificationsHref?: string;
}

export default function NotificationBell({ customerId, userId, notificationsHref = '/customer/notifications' }: NotificationBellProps) {
  const recipientId = userId || customerId;
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recipientId) return;
    
    // Load initial unread count
    loadUnreadCount();
    
    // Set up polling for new notifications
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [recipientId]);

  const loadUnreadCount = async () => {
    if (!recipientId) return;
    
    try {
      const { unreadCount: count } = await notificationService.getNotifications(
        recipientId,
        { unreadOnly: true, limit: 0 }
      );
      
      // Animate if count increased
      if (count > unreadCount) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
      
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (!recipientId) {
    return null; // Don't show notification bell for non-logged-in users
  }

  return (
    <div className="relative">
      <motion.button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnimating ? {
          rotate: [0, -15, 15, -15, 15, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        <Bell className="w-5 h-5 stroke-[1.5] text-gray-700" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <NotificationCenter
        recipientId={recipientId}
        notificationsHref={notificationsHref}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          loadUnreadCount(); // Refresh count when closing
        }}
        anchorRef={bellRef}
      />
    </div>
  );
}
