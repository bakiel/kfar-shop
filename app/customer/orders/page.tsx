'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Store, Eye, RotateCcw, Loader2 } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge } from '@/components/portal';
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

interface Order {
  id: string;
  date: string;
  items: string;
  total: string;
  status: string;
  vendor: string;
  [key: string]: unknown;
}

export default function CustomerOrders() {
  const { language, t, isRTL } = useLanguage();
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/customer/orders?limit=100', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          const mapped: Order[] = data.orders.map((o: any) => {
            const itemCount = Array.isArray(o.items) ? o.items.length : (o.item_count || 0);
            return {
              id: o.id || o.order_number || '-',
              date: o.created_at || o.date || '',
              items: itemCount === 1
                ? (isRTL ? 'פריט 1' : '1 item')
                : (isRTL ? `${itemCount} פריטים` : `${itemCount} items`),
              total: String(parseFloat(o.total_amount || o.total || '0').toFixed(2)),
              status: o.status || 'pending',
              vendor: o.vendor_name || o.vendor || '-',
            };
          });
          setOrders(mapped);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isRTL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const summaryStats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const active = orders.filter(o => ['shipped', 'processing', 'pending'].includes(o.status)).length;
    const cancelledRefunded = orders.filter(o => ['cancelled', 'refunded'].includes(o.status)).length;
    return { total, delivered, active, cancelledRefunded };
  }, [orders]);

  const columns: Column<Order>[] = [
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
      key: 'items',
      header: isRTL ? 'פריטים' : 'Items',
      render: (row) => (
        <span className="text-sm text-gray-600">{row.items}</span>
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
        <StatusBadge
          status={row.status as 'delivered' | 'shipped' | 'processing' | 'pending' | 'cancelled' | 'refunded'}
          language={language}
        />
      ),
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'ההזמנות שלי' : 'My Orders'}
          subtitle={isRTL ? 'צפה ועקוב אחרי כל ההזמנות שלך' : 'View and track all your orders'}
          breadcrumbs={[
            { label: isRTL ? 'לוח בקרה' : 'Dashboard', href: '/customer/dashboard' },
            { label: isRTL ? 'הזמנות' : 'Orders' },
          ]}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: isRTL ? 'סה"כ הזמנות' : 'Total Orders', value: String(summaryStats.total), color: '#2D5A27' },
          { label: isRTL ? 'נמסרו' : 'Delivered', value: String(summaryStats.delivered), color: '#10b981' },
          { label: isRTL ? 'פעילות' : 'Active', value: String(summaryStats.active), color: '#C4A265' },
          { label: isRTL ? 'בוטלו/הוחזרו' : 'Cancelled/Refunded', value: String(summaryStats.cancelledRefunded), color: '#ef4444' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 p-4"
          >
            <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Orders Table */}
      <motion.div variants={item}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#2D5A27] animate-spin stroke-[1.5]" />
            <span className="ml-2 text-sm text-gray-500">{isRTL ? 'טוען הזמנות...' : 'Loading orders...'}</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            searchable={true}
            searchPlaceholder={isRTL ? 'חפש הזמנות...' : 'Search orders...'}
            pageSize={8}
            emptyTitle={isRTL ? 'אין הזמנות עדיין' : 'No orders yet'}
            emptyDescription={isRTL ? 'התחל לקנות כדי לראות את ההזמנות שלך כאן' : 'Start shopping to see your orders here'}
            emptyIcon="cart"
            isRTL={isRTL}
            rowActions={(row) => [
              {
                label: isRTL ? 'צפה בפרטים' : 'View Details',
                onClick: () => {},
              },
              ...(row.status === 'delivered' ? [{
                label: isRTL ? 'הזמן שוב' : 'Reorder',
                onClick: () => {},
              }] : []),
            ]}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
