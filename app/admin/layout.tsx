'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import '@/app/globals.css';
import '@/styles/kfar-style-system.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check admin authentication
  useEffect(() => {
    try {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth && !pathname.includes('/admin/login')) {
        router.push('/admin/login');
      } else if (adminAuth) {
        // Validate JSON
        try {
          JSON.parse(adminAuth);
        } catch (e) {
          // Invalid JSON, clear and redirect
          localStorage.removeItem('adminAuth');
          if (!pathname.includes('/admin/login')) {
            router.push('/admin/login');
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (!pathname.includes('/admin/login')) {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  const menuItems = [
    { id: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'vendors', path: '/admin/vendors', label: 'Vendors', icon: 'fa-store' },
    { id: 'products', path: '/admin/products', label: 'Products', icon: 'fa-box' },
    { id: 'orders', path: '/admin/orders', label: 'Orders', icon: 'fa-shopping-cart' },
    { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: 'fa-chart-line' },
    { id: 'automation', path: '/admin/automation', label: 'Automation', icon: 'fa-robot' },
    { id: 'users', path: '/admin/users', label: 'Users', icon: 'fa-users' },
    { id: 'revenue', path: '/admin/revenue-feed', label: 'Revenue Feed', icon: 'fa-dollar-sign' },
    { id: 'settings', path: '/admin/settings', label: 'Settings', icon: 'fa-cog' },
  ];

  const getActiveTab = () => {
    const item = menuItems.find(item => pathname.startsWith(item.path));
    return item?.id || 'dashboard';
  };

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex kfar-bg-cream">
      {/* Enhanced Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 text-white relative kfar-gradient-primary flex-shrink-0`}>
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full kfar-shadow-md flex items-center justify-center z-50 kfar-text-leaf-green hover:kfar-shadow-lg transition-shadow"
        >
          <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'} text-xs`}></i>
        </button>

        <div className={`${sidebarCollapsed ? 'px-3 py-6' : 'p-6'} h-full flex flex-col`}>
          {/* KFAR Branding */}
          <div className={`${sidebarCollapsed ? 'mb-4' : 'mb-6'}`}>
            {!sidebarCollapsed && (
              <div className="text-center mb-4">
                <h1 className="text-h4 font-bold text-white">KFAR</h1>
                <p className="text-xs text-white/80">Kibbutz Food & Agriculture Revival</p>
              </div>
            )}
          </div>

          {/* Admin Info */}
          <div className={`flex items-center gap-4 mb-8 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="relative flex-shrink-0">
              <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-2 border-white shadow-lg kfar-bg-sun-gold flex items-center justify-center`}>
                <i className="fas fa-user-shield text-white text-xl"></i>
              </div>
              {!sidebarCollapsed && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white kfar-bg-mint"></div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h2 className="text-h5 font-bold truncate">Admin Panel</h2>
                <p className="text-body-sm opacity-80">Marketplace Control</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {menuItems.map(item => (
              <Link key={item.id} href={item.path}>
                <button
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden group ${
                    getActiveTab() === item.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <i className={`fas ${item.icon} ${sidebarCollapsed ? 'text-xl' : 'text-base w-5'} relative z-10`}></i>
                  {!sidebarCollapsed && <span className="relative z-10">{item.label}</span>}
                  {getActiveTab() === item.id && !sidebarCollapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"></div>
                  )}
                </button>
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className={`mt-auto space-y-2`}>
            {/* Back to Marketplace */}
            <Link href="/">
              <button 
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 transition-all group`}
                title={sidebarCollapsed ? 'Back to Marketplace' : ''}
              >
                <i className={`fas fa-home ${sidebarCollapsed ? 'text-xl' : 'text-base w-5'}`}></i>
                {!sidebarCollapsed && <span className="text-body">Back to Marketplace</span>}
              </button>
            </Link>

            {/* Vendor Portal Link */}
            <Link href="/vendor/login">
              <button 
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 transition-all group`}
                title={sidebarCollapsed ? 'Vendor Portal' : ''}
              >
                <i className={`fas fa-store ${sidebarCollapsed ? 'text-xl' : 'text-base w-5'}`}></i>
                {!sidebarCollapsed && <span className="text-body">Vendor Portal</span>}
              </button>
            </Link>
            
            {/* Logout */}
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  localStorage.removeItem('adminAuth');
                  router.push('/admin/login');
                }
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 transition-all group`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <i className={`fas fa-sign-out-alt ${sidebarCollapsed ? 'text-xl' : 'text-base w-5'}`}></i>
              {!sidebarCollapsed && <span className="text-body">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Global Admin Header */}
        <header className="bg-white kfar-shadow-sm px-8 py-4 sticky top-0 z-40 border-b kfar-border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg kfar-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div>
                  <h1 className="text-h5 font-bold kfar-text-soil">KFAR Admin</h1>
                  <p className="text-xs kfar-text-gray-600">Kibbutz Food & Agriculture Revival</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="btn btn-outline flex items-center gap-2">
                  <i className="fas fa-home"></i>
                  View Marketplace
                </button>
              </Link>
              <Link href="/vendor/login">
                <button className="btn btn-secondary flex items-center gap-2">
                  <i className="fas fa-store"></i>
                  Vendor Portal
                </button>
              </Link>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
