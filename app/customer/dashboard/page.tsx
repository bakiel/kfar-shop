'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Gift, DollarSign, Heart, Store, ArrowRight,
  ShoppingBag, Star, Package
} from 'lucide-react';
import { StatCard, DataTable, PageHeader, StatusBadge } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

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

interface RecentOrder {
  id: string;
  date: string;
  items: number;
  total: string;
  status: string;
  vendor: string;
  [key: string]: unknown;
}

const mockRecentOrders: RecentOrder[] = [
  { id: 'ORD-2025-042', date: '2025-02-06', items: 4, total: '189.50', status: 'delivered', vendor: 'Teva Deli' },
  { id: 'ORD-2025-039', date: '2025-02-03', items: 2, total: '67.00', status: 'shipped', vendor: 'Gahn Delight' },
  { id: 'ORD-2025-035', date: '2025-01-29', items: 6, total: '312.75', status: 'delivered', vendor: "Queen's Cuisine" },
  { id: 'ORD-2025-031', date: '2025-01-24', items: 1, total: '45.00', status: 'delivered', vendor: 'Garden of Light' },
  { id: 'ORD-2025-028', date: '2025-01-19', items: 3, total: '134.25', status: 'delivered', vendor: 'People Store' },
];

export default function CustomerDashboard() {
  const { language, t, isRTL } = useLanguage();
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('customerName') || 'Customer';
    setCustomerName(name);
  }, []);

  const columns: Column<RecentOrder>[] = [
    {
      key: 'id',
      header: isRTL ? 'מזהה הזמנה' : 'Order ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm font-medium text-gray-900">{row.id}</span>
      ),
    },
    {
      key: 'date',
      header: isRTL ? 'תאריך' : 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'vendor',
      header: isRTL ? 'ספק' : 'Vendor',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2D5A27]/10 flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-[#2D5A27] stroke-[1.5]" />
          </div>
          <span className="text-sm font-medium text-gray-700">{t(row.vendor)}</span>
        </div>
      ),
    },
    {
      key: 'total',
      header: isRTL ? 'סה"כ' : 'Total',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold text-gray-900">{isRTL ? `${row.total} ₪` : `₪${row.total}`}</span>
      ),
    },
    {
      key: 'status',
      header: isRTL ? 'סטטוס' : 'Status',
      render: (row) => (
        <StatusBadge status={row.status as 'delivered' | 'shipped' | 'processing' | 'pending'} language={language} />
      ),
    },
  ];

  const quickActions = [
    {
      label: isRTL ? 'חנות' : 'Browse Shop',
      labelHe: 'חנות',
      href: '/shop',
      icon: <ShoppingBag className="w-5 h-5 stroke-[1.5]" />,
      color: '#2D5A27',
      bgColor: '#2D5A27',
    },
    {
      label: isRTL ? 'עקוב אחרי הזמנה' : 'Track Order',
      labelHe: 'עקוב אחרי הזמנה',
      href: '/customer/orders',
      icon: <Package className="w-5 h-5 stroke-[1.5]" />,
      color: '#C4A265',
      bgColor: '#C4A265',
    },
    {
      label: isRTL ? 'הפרסים שלי' : 'My Rewards',
      labelHe: 'הפרסים שלי',
      href: '/customer/rewards',
      icon: <Gift className="w-5 h-5 stroke-[1.5]" />,
      color: '#478c0b',
      bgColor: '#478c0b',
    },
    {
      label: isRTL ? 'הפרופיל שלי' : 'My Profile',
      labelHe: 'הפרופיל שלי',
      href: '/customer/profile',
      icon: <Star className="w-5 h-5 stroke-[1.5]" />,
      color: '#3a3a1d',
      bgColor: '#3a3a1d',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Welcome Header */}
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? `${customerName} ,שלום` : `Welcome back, ${customerName}`}
          subtitle={isRTL ? 'הנה סקירה של החשבון שלך' : 'Here is an overview of your account'}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title={isRTL ? 'סה"כ הזמנות' : 'Total Orders'}
          value={12}
          icon={<ShoppingCart className="w-5 h-5 stroke-[1.5]" />}
          color="green"
          trend={{ value: 8, label: isRTL ? 'החודש' : 'this month' }}
        />
        <StatCard
          title={isRTL ? 'נקודות פרסים' : 'Rewards Points'}
          value={2450}
          icon={<Gift className="w-5 h-5 stroke-[1.5]" />}
          color="amber"
          trend={{ value: 120, label: isRTL ? 'נוספו' : 'earned' }}
        />
        <StatCard
          title={isRTL ? 'סה"כ חיסכון' : 'Total Savings'}
          value={380}
          prefix="₪"
          icon={<DollarSign className="w-5 h-5 stroke-[1.5]" />}
          color="emerald"
          trend={{ value: 12, label: isRTL ? 'החודש' : 'this month' }}
        />
        <StatCard
          title={isRTL ? 'מועדפים' : 'Favorites'}
          value={7}
          icon={<Heart className="w-5 h-5 stroke-[1.5]" />}
          color="purple"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="mb-8">
        <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'פעולות מהירות' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.06 }}
                whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer group transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.label}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-[#2D5A27] transition-colors">
                  <span>{isRTL ? 'פתח' : 'Open'}</span>
                  <ArrowRight className={`w-3 h-3 stroke-[1.5] transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isRTL ? 'הזמנות אחרונות' : 'Recent Orders'}
          </h2>
          <Link
            href="/customer/orders"
            className="text-sm font-medium text-[#2D5A27] hover:text-[#234A1F] transition-colors cursor-pointer flex items-center gap-1"
          >
            {isRTL ? 'צפה בהכל' : 'View All'}
            <ArrowRight className={`w-3.5 h-3.5 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={mockRecentOrders}
          searchable={false}
          pageSize={5}
          emptyTitle={isRTL ? 'אין הזמנות עדיין' : 'No orders yet'}
          emptyDescription={isRTL ? 'התחל לקנות כדי לראות את ההזמנות שלך כאן' : 'Start shopping to see your orders here'}
          emptyIcon="cart"
          isRTL={isRTL}
        />
      </motion.div>
    </motion.div>
  );
}
