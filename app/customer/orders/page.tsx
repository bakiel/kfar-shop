'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Store, Eye, RotateCcw } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge } from '@/components/portal';
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

interface Order {
  id: string;
  date: string;
  items: string;
  total: string;
  status: string;
  vendor: string;
  [key: string]: unknown;
}

const mockOrders: Order[] = [
  { id: 'ORD-2025-042', date: '2025-02-06', items: '4 items', total: '189.50', status: 'delivered', vendor: 'Teva Deli' },
  { id: 'ORD-2025-039', date: '2025-02-03', items: '2 items', total: '67.00', status: 'shipped', vendor: 'Gahn Delight' },
  { id: 'ORD-2025-035', date: '2025-01-29', items: '6 items', total: '312.75', status: 'delivered', vendor: "Queen's Cuisine" },
  { id: 'ORD-2025-031', date: '2025-01-24', items: '1 item', total: '45.00', status: 'processing', vendor: 'Garden of Light' },
  { id: 'ORD-2025-028', date: '2025-01-19', items: '3 items', total: '134.25', status: 'delivered', vendor: 'People Store' },
  { id: 'ORD-2025-022', date: '2025-01-12', items: '5 items', total: '256.80', status: 'delivered', vendor: 'Teva Deli' },
  { id: 'ORD-2025-018', date: '2025-01-07', items: '2 items', total: '78.50', status: 'cancelled', vendor: 'VOP Shop' },
  { id: 'ORD-2025-014', date: '2025-01-02', items: '4 items', total: '198.00', status: 'delivered', vendor: "Queen's Cuisine" },
  { id: 'ORD-2024-098', date: '2024-12-28', items: '3 items', total: '145.75', status: 'delivered', vendor: 'Gahn Delight' },
  { id: 'ORD-2024-091', date: '2024-12-20', items: '1 item', total: '32.00', status: 'refunded', vendor: 'Garden of Light' },
];

export default function CustomerOrders() {
  const { language, t, isRTL } = useLanguage();

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
          { label: isRTL ? 'סה"כ הזמנות' : 'Total Orders', value: '10', color: '#2D5A27' },
          { label: isRTL ? 'נמסרו' : 'Delivered', value: '6', color: '#10b981' },
          { label: isRTL ? 'פעילות' : 'Active', value: '2', color: '#C4A265' },
          { label: isRTL ? 'בוטלו/הוחזרו' : 'Cancelled/Refunded', value: '2', color: '#ef4444' },
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
        <DataTable
          columns={columns}
          data={mockOrders}
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
      </motion.div>
    </motion.div>
  );
}
