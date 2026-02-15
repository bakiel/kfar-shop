'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Store, Package, ShoppingCart, Users, Tag, Settings, Contact
} from 'lucide-react';
import { PortalLayout, ConfirmDialog } from '@/components/portal';
import type { MenuItem } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

const adminMenuItems: MenuItem[] = [
  { id: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', labelHe: 'לוח בקרה', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'vendors', path: '/admin/vendors', label: 'Vendors', labelHe: 'ספקים', icon: <Store className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'bundles', path: '/admin/bundles', label: 'Bundles', labelHe: 'חבילות', icon: <Package className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'orders', path: '/admin/orders', label: 'Orders', labelHe: 'הזמנות', icon: <ShoppingCart className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'crm', path: '/admin/crm', label: 'CRM', labelHe: 'CRM', icon: <Contact className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'accounts', path: '/admin/accounts', label: 'Accounts', labelHe: 'חשבונות', icon: <Users className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'promotions', path: '/admin/promotions', label: 'Promotions', labelHe: 'מבצעים', icon: <Tag className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'settings', path: '/admin/settings', label: 'Settings', labelHe: 'הגדרות', icon: <Settings className="w-5 h-5 stroke-[1.5]" /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, isRTL } = useLanguage();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Verify admin role
    if (user?.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [pathname, router, isLoading, isAuthenticated, user]);

  // Login page bypass - render children only
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <>
      <PortalLayout
        role="admin"
        menuItems={adminMenuItems}
        user={{ name: user?.displayName || 'Admin Panel', subtitle: 'Marketplace Control' }}
        onLogout={handleLogout}
      >
        {children}
      </PortalLayout>

      <ConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title={isRTL ? 'התנתקות' : 'Log Out'}
        description={isRTL ? 'האם אתה בטוח שברצונך להתנתק?' : 'Are you sure you want to log out?'}
        confirmLabel={t('Logout')}
        cancelLabel={t('Cancel')}
        destructive
        isRTL={isRTL}
      />
    </>
  );
}
