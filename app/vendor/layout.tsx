'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Tag,
  QrCode, Megaphone, Settings
} from 'lucide-react';
import { PortalLayout, ConfirmDialog } from '@/components/portal';
import type { MenuItem } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

// Routes that should NOT use the portal layout
const PUBLIC_ROUTES = ['/vendor/login', '/vendor/onboarding'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return true;
  // Public vendor pages like /vendor/teva-deli
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 2 && segments[0] === 'vendor' && !['dashboard', 'orders', 'promotions', 'qr-codes', 'marketing', 'settings', 'products', 'admin'].includes(segments[1])) {
    return true;
  }
  return false;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', path: '/vendor/dashboard', label: 'Dashboard', labelHe: 'לוח בקרה', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'products', path: '/vendor/admin/products', label: 'Products', labelHe: 'מוצרים', icon: <Package className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'orders', path: '/vendor/orders', label: 'Orders', labelHe: 'הזמנות', icon: <ShoppingCart className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'promotions', path: '/vendor/promotions', label: 'Promotions', labelHe: 'מבצעים', icon: <Tag className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'qr-codes', path: '/vendor/qr-codes', label: 'QR Codes', labelHe: 'קודי QR', icon: <QrCode className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'marketing', path: '/vendor/marketing', label: 'Marketing', labelHe: 'שיווק', icon: <Megaphone className="w-5 h-5 stroke-[1.5]" /> },
  { id: 'settings', path: '/vendor/settings', label: 'Settings', labelHe: 'הגדרות', icon: <Settings className="w-5 h-5 stroke-[1.5]" /> },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [vendorName, setVendorName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute(pathname)) {
      setIsChecking(false);
      return;
    }

    try {
      const authStr = localStorage.getItem('vendorAuth');
      if (!authStr) {
        router.push('/vendor/login');
        return;
      }

      const auth = JSON.parse(authStr);
      if (!auth.vendorId) {
        router.push('/vendor/login');
        return;
      }

      setVendorName(auth.vendorName || auth.name || 'Vendor');
      setIsAuthenticated(true);
    } catch {
      router.push('/vendor/login');
    } finally {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Public routes: render children directly
  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // Checking auth: show nothing to avoid flash
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#478c0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated and not redirecting (shouldn't reach here, but safety)
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('vendorAuth');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('storage'));
    router.push('/vendor/login');
  };

  return (
    <>
      <PortalLayout
        role="vendor"
        menuItems={MENU_ITEMS}
        user={{ name: vendorName, subtitle: isRTL ? 'ניהול חנות' : 'Store Management' }}
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
        confirmLabel={isRTL ? 'התנתק' : 'Log Out'}
        cancelLabel={isRTL ? 'ביטול' : 'Cancel'}
        destructive
        isRTL={isRTL}
      />
    </>
  );
}
