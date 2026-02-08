'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Store, Package,
  ArrowRight, Tag, Clock
} from 'lucide-react';
import { PageHeader, StatCard, DataTable, StatusBadge, LoadingState } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { vendorStores, getAllProducts } from '@/lib/data/wordpress-style-data-layer';

interface MockOrder {
  id: string;
  customer: string;
  customerHe: string;
  vendor: string;
  vendorHe: string;
  items: number;
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  [key: string]: unknown;
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

const mockOrders: MockOrder[] = [
  { id: 'KF-1001', customer: 'Sarah Cohen', customerHe: 'שרה כהן', vendor: 'Teva Deli', vendorHe: 'טבע דלי', items: 3, total: 145, date: '2025-02-07', status: 'pending' },
  { id: 'KF-1002', customer: 'David Levi', customerHe: 'דוד לוי', vendor: 'Garden of Light', vendorHe: 'גן האור', items: 5, total: 230, date: '2025-02-07', status: 'processing' },
  { id: 'KF-1003', customer: 'Miriam Yosef', customerHe: 'מרים יוסף', vendor: "Queen's Cuisine", vendorHe: 'המטבח של המלכה', items: 2, total: 89, date: '2025-02-06', status: 'shipped' },
  { id: 'KF-1004', customer: 'Avi Ben-Israel', customerHe: 'אבי בן-ישראל', vendor: 'Gahn Delight', vendorHe: 'גן תענוג', items: 4, total: 178, date: '2025-02-06', status: 'delivered' },
  { id: 'KF-1005', customer: 'Rivka Amar', customerHe: 'רבקה עמר', vendor: 'People Store', vendorHe: 'חנות העם', items: 1, total: 52, date: '2025-02-05', status: 'pending' },
];

export default function AdminDashboard() {
  const { language, t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, vendors: 0, products: 0 });

  useEffect(() => {
    const vendors = Object.values(vendorStores);
    const products = getAllProducts();
    setStats({
      revenue: 87450,
      orders: 24,
      vendors: vendors.length,
      products: products.length,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingState type="page" />;
  }

  const today = new Date();
  const dateString = isRTL
    ? today.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const orderColumns: Column<MockOrder>[] = [
    { key: 'id', header: isRTL ? 'מזהה הזמנה' : 'Order ID', sortable: true },
    {
      key: 'customer',
      header: t('Customer'),
      render: (row) => <span className="font-medium text-gray-900">{isRTL ? row.customerHe : row.customer}</span>,
    },
    {
      key: 'vendor',
      header: t('Vendor'),
      render: (row) => <span>{isRTL ? row.vendorHe : row.vendor}</span>,
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
          title={t('Dashboard')}
          subtitle={dateString}
          isRTL={isRTL}
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
        <DataTable<MockOrder>
          columns={orderColumns}
          data={mockOrders}
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
