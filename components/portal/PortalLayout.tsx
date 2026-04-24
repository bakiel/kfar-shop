'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, ChevronLeft, ChevronRight, Home, LogOut, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/context/LanguageContext';

export interface MenuItem {
  id: string;
  path: string;
  label: string;
  labelHe: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  role: 'admin' | 'vendor' | 'customer';
  menuItems: MenuItem[];
  user?: { name: string; subtitle?: string };
  onLogout?: () => void;
  children: React.ReactNode;
}

export default function PortalLayout({ role, menuItems, user, onLogout, children }: PortalLayoutProps) {
  const pathname = usePathname();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const getActiveId = () => {
    const item = menuItems.find(item => pathname.startsWith(item.path));
    return item?.id || menuItems[0]?.id;
  };

  const activeId = getActiveId();

  const roleConfig = {
    admin: { title: 'KFAR Admin', titleHe: 'מנהל כפר', subtitle: 'Marketplace Control', subtitleHe: 'ניהול שוק', gradient: 'from-[#1a3517] to-[#0d1f0a]' },
    vendor: { title: user?.name || 'Vendor Portal', titleHe: user?.name || 'פורטל ספקים', subtitle: 'Store Management', subtitleHe: 'ניהול חנות', gradient: 'from-[#7c3d12] to-[#431f06]' },
    customer: { title: 'My Account', titleHe: 'החשבון שלי', subtitle: user?.name || '', subtitleHe: user?.name || '', gradient: 'from-[#0369a1] to-[#075985]' },
  };

  const config = roleConfig[role];

  const SidebarContent = () => (
    <div className={cn('h-full flex flex-col', collapsed ? 'px-3 py-6' : 'p-5')} dir="ltr">
      {/* Brand */}
      <div className={cn('mb-6', collapsed ? 'text-center' : '')}>
        <div className={cn(
          'rounded-xl bg-white/10 flex items-center',
          collapsed ? 'w-11 h-11 justify-center mx-auto' : 'gap-3 px-3 py-2.5'
        )}>
          <span className="text-white font-bold text-lg">K</span>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate">
                {isRTL ? config.titleHe : config.title}
              </h1>
              <p className="text-[11px] text-white/60 truncate">
                {isRTL ? config.subtitleHe : config.subtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link key={item.id} href={item.path}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group cursor-pointer',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#C4A265] rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="text-sm font-medium truncate">
                    {isRTL ? item.labelHe : item.label}
                  </span>
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {isRTL ? item.labelHe : item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-1 pt-4 border-t border-white/10">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/8 hover:text-white transition-all cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <Globe className="w-5 h-5 stroke-[1.5] flex-shrink-0" />
          {!collapsed && <span className="text-sm">{language === 'en' ? 'עברית' : 'English'}</span>}
        </button>

        {/* Back to Marketplace */}
        <Link href="/">
          <div className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/8 hover:text-white transition-all cursor-pointer',
            collapsed && 'justify-center'
          )}>
            <Home className="w-5 h-5 stroke-[1.5] flex-shrink-0" />
            {!collapsed && <span className="text-sm">{t('Back to Marketplace')}</span>}
          </div>
        </Link>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-all cursor-pointer',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 stroke-[1.5] flex-shrink-0" />
            {!collapsed && <span className="text-sm">{t('Logout')}</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('min-h-screen flex', isRTL && 'flex-row-reverse')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:block flex-shrink-0 transition-all duration-300 bg-gradient-to-b sticky top-0 h-screen',
        config.gradient,
        collapsed ? 'w-[72px]' : 'w-64'
      )}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute top-8 z-50 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer text-[#2D5A27]',
            isRTL
              ? (collapsed ? 'left-[-12px]' : 'left-[-12px]')
              : (collapsed ? 'right-[-12px]' : 'right-[-12px]')
          )}
        >
          {collapsed ? (
            isRTL ? <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" /> : <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
          ) : (
            isRTL ? <ChevronRight className="w-3.5 h-3.5 stroke-[2]" /> : <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
          )}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile Header + Drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <Menu className="w-5 h-5 text-gray-700 stroke-[1.5]" />
        </button>
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', config.gradient)}>
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            {isRTL ? config.titleHe : config.title}
          </span>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: isRTL ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 280 : -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'fixed top-0 bottom-0 w-[280px] z-50 bg-gradient-to-b lg:hidden',
                config.gradient,
                isRTL ? 'right-0' : 'left-0'
              )}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'absolute top-4 p-2 text-white/70 hover:text-white cursor-pointer',
                  isRTL ? 'left-4' : 'right-4'
                )}
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-gray-50/50">
        {/* Spacer for mobile header */}
        <div className="h-14 lg:hidden" />
        {/* Role accent bar */}
        <div className={cn(
          'h-1 w-full',
          role === 'admin' ? 'bg-gradient-to-r from-[#2D5A27] to-[#478c0b]' :
          role === 'vendor' ? 'bg-gradient-to-r from-[#92400e] to-[#C4A265]' :
          'bg-gradient-to-r from-[#0369a1] to-[#38bdf8]'
        )} />
        {/* Page Content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
