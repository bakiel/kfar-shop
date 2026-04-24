'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Gift, DollarSign, Heart, Store, ArrowRight,
  ShoppingBag, Star, Package, Loader2
} from 'lucide-react';
import { StatCard, DataTable, PageHeader, StatusBadge } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

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

export default function CustomerDashboard() {
  const { language, t, isRTL } = useLanguage();
  const { accessToken, user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [rewardsPoints, setRewardsPoints] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = user?.displayName || localStorage.getItem('customerName') || 'Customer';
    setCustomerName(name);
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      // Fetch orders and rewards in parallel
      const [ordersRes, rewardsRes] = await Promise.allSettled([
        fetch('/api/customer/orders?limit=5', { headers }),
        fetch('/api/customer/rewards', { headers }),
      ]);

      // Process orders
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const ordersData = await ordersRes.value.json();
        if (ordersData.success && ordersData.orders) {
          setTotalOrders(ordersData.pagination?.total || ordersData.orders.length);
          const mapped: RecentOrder[] = ordersData.orders.map((o: any) => ({
            id: o.id || o.order_number || '-',
            date: o.created_at || o.date || '',
            items: Array.isArray(o.items) ? o.items.length : (o.item_count || 0),
            total: String(parseFloat(o.total_amount || o.total || '0').toFixed(2)),
            status: o.status || 'pending',
            vendor: o.vendor_name || o.vendor || '-',
          }));
          setRecentOrders(mapped);
        }
      }

      // Process rewards
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value.ok) {
        const rewardsData = await rewardsRes.value.json();
        if (rewardsData.success && rewardsData.rewards) {
          setRewardsPoints(rewardsData.rewards.balance || 0);
          setTotalSavings(rewardsData.rewards.lifetimeRedeemed || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          actions={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0369a1] text-white text-xs font-semibold uppercase tracking-wide">
              My Account
            </span>
          }
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title={isRTL ? 'סה"כ הזמנות' : 'Total Orders'}
          value={totalOrders}
          icon={<ShoppingCart className="w-5 h-5 stroke-[1.5]" />}
          color="green"
        />
        <StatCard
          title={isRTL ? 'נקודות פרסים' : 'Rewards Points'}
          value={rewardsPoints}
          icon={<Gift className="w-5 h-5 stroke-[1.5]" />}
          color="amber"
        />
        <StatCard
          title={isRTL ? 'סה"כ חיסכון' : 'Total Savings'}
          value={totalSavings}
          prefix="₪"
          icon={<DollarSign className="w-5 h-5 stroke-[1.5]" />}
          color="emerald"
        />
        <StatCard
          title={isRTL ? 'מועדפים' : 'Favorites'}
          value={0}
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#2D5A27] animate-spin stroke-[1.5]" />
            <span className="ml-2 text-sm text-gray-500">{isRTL ? 'טוען...' : 'Loading...'}</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={recentOrders}
            searchable={false}
            pageSize={5}
            emptyTitle={isRTL ? 'אין הזמנות עדיין' : 'No orders yet'}
            emptyDescription={isRTL ? 'התחל לקנות כדי לראות את ההזמנות שלך כאן' : 'Start shopping to see your orders here'}
            emptyIcon="cart"
            isRTL={isRTL}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
