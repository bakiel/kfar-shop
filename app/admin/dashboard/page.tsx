'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Store, Package,
  ArrowRight, Tag, Clock, AlertTriangle
} from 'lucide-react';
import { PageHeader, StatCard, DataTable, StatusBadge, LoadingState } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

interface DashboardOrder {
  id: string;
  customer: string;
  vendor: string;
  items: number;
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  [key: string]: unknown;
}

interface DashboardData {
  totalRevenue: number;
  activeOrders: number;
  activeVendors: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: DashboardOrder[];
  vendorStats: { id: string; name: string; products: number; revenue: number; rating: string }[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function AdminDashboard() {
  const { language, t, isRTL } = useLanguage();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    const headers: Record<string, string> = {};
    headers['Authorization'] = `Bearer ${accessToken}`;

    fetch('/api/admin/dashboard', { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [accessToken]);

  if (loading) {
    return <LoadingState type="page" />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 stroke-[1.5] mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {isRTL ? 'שגיאה בטעינת הנתונים' : 'Failed to load dashboard'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); location.reload(); }}
          className="px-4 py-2 text-sm font-medium text-white bg-[#2D5A27] rounded-lg hover:bg-[#234A1F] transition-colors cursor-pointer"
        >
          {isRTL ? 'נסה שוב' : 'Retry'}
        </button>
      </div>
    );
  }

  const stats = {
    revenue: data.totalRevenue,
    orders: data.activeOrders,
    vendors: data.activeVendors,
    products: data.totalProducts,
  };

  const recentOrders: DashboardOrder[] = data.recentOrders;

  const today = new Date();
  const dateString = isRTL
    ? today.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const orderColumns: Column<DashboardOrder>[] = [
    { key: 'id', header: isRTL ? 'מזהה הזמנה' : 'Order ID', sortable: true },
    {
      key: 'customer',
      header: t('Customer'),
      render: (row) => <span className="font-medium text-gray-900">{row.customer}</span>,
    },
    {
      key: 'vendor',
      header: t('Vendor'),
      render: (row) => <span>{row.vendor}</span>,
    },
    { key: 'items', header: t('Items'), sortable: true },
    {
      key: 'total',
      header: t('Total'),
      sortable: true,
      render: (row) => <span className="font-semibold text-gray-900">{'\u20AA'}{row.total}</span>,
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  const quickActions = [
    {
      href: '/admin/bundles',
      icon: <Package className="w-6 h-6 stroke-[1.5]" />,
      title: t('Manage Bundles'),
      titleHe: 'נהל חבילות',
      desc: isRTL ? 'צור ונהל חבילות מוצרים' : 'Create and manage product bundles',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      href: '/admin/vendors',
      icon: <Store className="w-6 h-6 stroke-[1.5]" />,
      title: t('View Vendors'),
      titleHe: 'צפה בספקים',
      desc: isRTL ? 'נהל ספקים ומוצרים' : 'Manage vendors and their products',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      href: '/admin/orders',
      icon: <ShoppingCart className="w-6 h-6 stroke-[1.5]" />,
      title: t('View Orders'),
      titleHe: 'צפה בהזמנות',
      desc: isRTL ? 'עקוב ועדכן סטטוס הזמנות' : 'Track and update order statuses',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      href: '/admin/promotions',
      icon: <Tag className="w-6 h-6 stroke-[1.5]" />,
      title: t('Promotions'),
      titleHe: 'מבצעים',
      desc: isRTL ? 'צור קמפיינים ומבצעים' : 'Create campaigns and promotions',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'לוח ניהול מנהל' : 'Admin Dashboard'}
          subtitle={dateString}
          isRTL={isRTL}
          actions={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A27] text-white text-xs font-semibold uppercase tracking-wide">
              Admin Panel
            </span>
          }
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title={t('Total Revenue')}
          value={stats.revenue}
          prefix={'\u20AA'}
          trend={{ value: 12.5, label: t('vs last month') }}
          icon={<DollarSign className="w-5 h-5 stroke-[1.5]" />}
          color="green"
        />
        <StatCard
          title={t('Active Orders')}
          value={stats.orders}
          trend={{ value: 8, label: t('vs last week') }}
          icon={<ShoppingCart className="w-5 h-5 stroke-[1.5]" />}
          color="blue"
        />
        <StatCard
          title={t('Active Vendors')}
          value={stats.vendors}
          trend={{ value: 0, label: t('This Month') }}
          icon={<Store className="w-5 h-5 stroke-[1.5]" />}
          color="amber"
        />
        <StatCard
          title={t('Total Products')}
          value={stats.products}
          trend={{ value: 5, label: t('vs last month') }}
          icon={<Package className="w-5 h-5 stroke-[1.5]" />}
          color="purple"
        />
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('Recent Orders')}
          </h2>
          <Link href="/admin/orders" className="text-sm text-[#2D5A27] hover:underline flex items-center gap-1 cursor-pointer">
            {t('View All')}
            <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
        <DataTable<DashboardOrder>
          columns={orderColumns}
          data={recentOrders}
          searchable={false}
          pageSize={5}
          emptyTitle={isRTL ? 'אין הזמנות עדיין' : 'No orders yet'}
          emptyIcon="cart"
          isRTL={isRTL}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('Quick Actions')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${action.color} transition-transform group-hover:scale-110`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isRTL ? action.titleHe : action.title}
                </h3>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
