'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Gift, User, Heart
} from 'lucide-react';
import { PortalLayout, ConfirmDialog } from '@/components/portal';
import type { MenuItem } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

const customerMenuItems: MenuItem[] = [
  { id: 'dashboard', path: '/customer/dashboard', label: 'Dashboard', labelHe: 'לוח בקרה', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'orders', path: '/customer/orders', label: 'My Orders', labelHe: 'ההזמנות שלי', icon: <ShoppingCart className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'rewards', path: '/customer/rewards', label: 'Rewards', labelHe: 'פרסים', icon: <Gift className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'profile', path: '/customer/profile', label: 'Profile', labelHe: 'פרופיל', icon: <User className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'favorites', path: '/customer/favorites', label: 'Favorites', labelHe: 'מועדפים', icon: <Heart className="w-5 h-5 stroke-[1.5]" /> },
];

const BYPASS_PATHS = ['/customer/login', '/customer/register', '/customer/onboarding', '/customer/join', '/customer/welcome'];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, isRTL } = useLanguage();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    // Bypass auth for public pages
    if (BYPASS_PATHS.some(p => pathname.startsWith(p))) return;

    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        router.push('/customer/login');
        return;
      }
      const name = localStorage.getItem('customerName') || '';
      setCustomerName(name);
    } catch {
      router.push('/customer/login');
    }
  }, [pathname, router]);

  // Bypass pages render children only (no portal layout)
  if (BYPASS_PATHS.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('userRole');
    router.push('/customer/login');
  };

  return (
    <>
      <PortalLayout
        role="customer"
        menuItems={customerMenuItems}
        user={{ name: customerName || 'Customer' }}
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
