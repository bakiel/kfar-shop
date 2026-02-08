'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Eye, RefreshCw
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer: string;
  customerHe: string;
  vendor: string;
  vendorHe: string;
  items: number;
  total: number;
  date: string;
  status: OrderStatus;
  [key: string]: unknown;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const mockOrders: Order[] = [
  { id: 'KF-1001', customer: 'Sarah Cohen', customerHe: 'שרה כהן', vendor: 'Teva Deli', vendorHe: 'טבע דלי', items: 3, total: 145, date: '2025-02-07', status: 'pending' },
  { id: 'KF-1002', customer: 'David Levi', customerHe: 'דוד לוי', vendor: 'Garden of Light', vendorHe: 'גן האור', items: 5, total: 230, date: '2025-02-07', status: 'processing' },
  { id: 'KF-1003', customer: 'Miriam Yosef', customerHe: 'מרים יוסף', vendor: "Queen's Cuisine", vendorHe: 'המטבח של המלכה', items: 2, total: 89, date: '2025-02-06', status: 'shipped' },
  { id: 'KF-1004', customer: 'Avi Ben-Israel', customerHe: 'אבי בן-ישראל', vendor: 'Gahn Delight', vendorHe: 'גן תענוג', items: 4, total: 178, date: '2025-02-06', status: 'delivered' },
  { id: 'KF-1005', customer: 'Rivka Amar', customerHe: 'רבקה עמר', vendor: 'People Store', vendorHe: 'חנות העם', items: 1, total: 52, date: '2025-02-05', status: 'pending' },
  { id: 'KF-1006', customer: 'Yonatan Dayan', customerHe: 'יונתן דיין', vendor: 'VOP Shop', vendorHe: 'חנות כפר השלום', items: 7, total: 320, date: '2025-02-05', status: 'processing' },
  { id: 'KF-1007', customer: 'Naomi Ben-Ami', customerHe: 'נעמי בן-עמי', vendor: 'Teva Deli', vendorHe: 'טבע דלי', items: 2, total: 75, date: '2025-02-04', status: 'delivered' },
  { id: 'KF-1008', customer: 'Moshe Peretz', customerHe: 'משה פרץ', vendor: 'Garden of Light', vendorHe: 'גן האור', items: 3, total: 134, date: '2025-02-04', status: 'shipped' },
  { id: 'KF-1009', customer: 'Esther Friedman', customerHe: 'אסתר פרידמן', vendor: "Queen's Cuisine", vendorHe: 'המטבח של המלכה', items: 1, total: 48, date: '2025-02-03', status: 'cancelled' },
  { id: 'KF-1010', customer: 'Benny Chaim', customerHe: 'בני חיים', vendor: 'Gahn Delight', vendorHe: 'גן תענוג', items: 6, total: 267, date: '2025-02-03', status: 'delivered' },
  { id: 'KF-1011', customer: 'Tamar Shalom', customerHe: 'תמר שלום', vendor: 'People Store', vendorHe: 'חנות העם', items: 4, total: 198, date: '2025-02-02', status: 'pending' },
  { id: 'KF-1012', customer: 'Yair Rosen', customerHe: 'יאיר רוזן', vendor: 'Teva Deli', vendorHe: 'טבע דלי', items: 2, total: 94, date: '2025-02-02', status: 'processing' },
  { id: 'KF-1013', customer: 'Leah Mizrachi', customerHe: 'לאה מזרחי', vendor: 'VOP Shop', vendorHe: 'חנות כפר השלום', items: 3, total: 156, date: '2025-02-01', status: 'delivered' },
  { id: 'KF-1014', customer: 'Ori Dagan', customerHe: 'אורי דגן', vendor: 'Garden of Light', vendorHe: 'גן האור', items: 5, total: 245, date: '2025-02-01', status: 'shipped' },
  { id: 'KF-1015', customer: 'Shira Katz', customerHe: 'שירה כץ', vendor: 'Gahn Delight', vendorHe: 'גן תענוג', items: 1, total: 42, date: '2025-01-31', status: 'cancelled' },
];

type FilterStatus = 'all' | OrderStatus;

export default function OrdersPage() {
  const { language, t, isRTL } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return mockOrders;
    return mockOrders.filter((o) => o.status === statusFilter);
  }, [statusFilter]);

  const filters: { id: FilterStatus; label: string; labelHe: string; count: number }[] = [
    { id: 'all', label: 'All', labelHe: 'הכל', count: mockOrders.length },
    { id: 'pending', label: 'Pending', labelHe: 'ממתין', count: mockOrders.filter((o) => o.status === 'pending').length },
    { id: 'processing', label: 'Processing', labelHe: 'בעיבוד', count: mockOrders.filter((o) => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', labelHe: 'נשלח', count: mockOrders.filter((o) => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', labelHe: 'נמסר', count: mockOrders.filter((o) => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', labelHe: 'בוטל', count: mockOrders.filter((o) => o.status === 'cancelled').length },
  ];

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: t('Order ID'),
      sortable: true,
      render: (row) => <span className="font-mono text-sm font-medium text-gray-900">{row.id}</span>,
    },
    {
      key: 'customer',
      header: t('Customer'),
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{isRTL ? row.customerHe : row.customer}</span>,
    },
    {
      key: 'vendor',
      header: t('Vendor'),
      render: (row) => <span className="text-gray-700">{isRTL ? row.vendorHe : row.vendor}</span>,
    },
    {
      key: 'items',
      header: t('Items'),
      sortable: true,
      render: (row) => <span>{row.items} {isRTL ? 'פריטים' : 'items'}</span>,
    },
    {
      key: 'total',
      header: t('Total'),
      sortable: true,
      render: (row) => <span className="font-semibold text-gray-900">{'\u20AA'}{row.total}</span>,
    },
    {
      key: 'date',
      header: t('Date'),
      sortable: true,
      render: (row) => <span className="text-sm text-gray-500">{row.date}</span>,
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={t('Orders')}
          subtitle={isRTL ? `${mockOrders.length} הזמנות` : `${mockOrders.length} orders total`}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Status Filter Buttons */}
      <motion.div variants={item} className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter(filter.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              statusFilter === filter.id
                ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filter.id !== 'all' && (
              <StatusBadge status={filter.id as OrderStatus} language={language} size="sm" />
            )}
            {filter.id === 'all' && <span>{isRTL ? filter.labelHe : filter.label}</span>}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              statusFilter === filter.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {filter.count}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Orders Table */}
      <motion.div variants={item}>
        <DataTable<Order>
          columns={columns}
          data={filteredOrders}
          searchable
          searchPlaceholder={isRTL ? 'חפש הזמנות...' : 'Search orders...'}
          pageSize={10}
          emptyTitle={isRTL ? 'אין הזמנות' : 'No orders found'}
          emptyDescription={isRTL ? 'נסה לשנות את הסינון' : 'Try changing the filter'}
          emptyIcon="cart"
          isRTL={isRTL}
          rowActions={(row) => [
            { label: t('View Details'), onClick: () => {} },
            { label: isRTL ? 'עדכן סטטוס' : 'Update Status', onClick: () => {} },
          ]}
        />
      </motion.div>
    </motion.div>
  );
}
