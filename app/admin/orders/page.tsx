'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Eye, RefreshCw, AlertTriangle
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, LoadingState } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber?: string;
  customer: string | { name: string; email?: string };
  vendorName?: string;
  vendor?: string;
  items: number | any[];
  total: number;
  date?: string;
  createdAt?: string;
  status: OrderStatus;
  [key: string]: unknown;
}

interface NormalizedOrder {
  id: string;
  customer: string;
  vendor: string;
  items: number;
  total: number;
  date: string;
  status: OrderStatus;
  [key: string]: unknown;
}

interface OrdersSummary {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// --- Mock fallback data (kept for reference) ---
// const mockOrders: Order[] = [
//   { id: 'KF-1001', customer: 'Sarah Cohen', customerHe: 'שרה כהן', vendor: 'Teva Deli', vendorHe: 'טבע דלי', items: 3, total: 145, date: '2025-02-07', status: 'pending' },
//   ... (15 entries)
// ];

function normalizeOrder(o: Order): NormalizedOrder {
  const customerName = typeof o.customer === 'object' ? o.customer.name : (o.customer || '');
  const vendorName = o.vendorName || o.vendor || '';
  const itemsCount = Array.isArray(o.items) ? o.items.length : (o.items || 0);
  const date = o.date || (o.createdAt ? o.createdAt.split('T')[0] : '');
  return {
    id: o.orderNumber || o.id,
    customer: customerName,
    vendor: vendorName,
    items: itemsCount,
    total: o.total,
    date,
    status: o.status,
  };
}

type FilterStatus = 'all' | OrderStatus;

export default function OrdersPage() {
  const { language, t, isRTL } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [orders, setOrders] = useState<NormalizedOrder[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback((status: FilterStatus) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('kfar_access_token') || localStorage.getItem('kfar_access_token')) : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`/api/admin/orders?${params.toString()}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const normalized = (json.orders || []).map(normalizeOrder);
        setOrders(normalized);
        if (json.summary) setSummary(json.summary);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Orders fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Always fetch 'all' initially so we get full summary counts
    fetchOrders('all');
  }, [fetchOrders]);

  const handleFilterChange = (newFilter: FilterStatus) => {
    setStatusFilter(newFilter);
    fetchOrders(newFilter);
  };

  const handleStatusUpdate = useCallback((orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('kfar_access_token') || localStorage.getItem('kfar_access_token')) : null;
    const patchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) patchHeaders['Authorization'] = `Bearer ${token}`;
    fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: patchHeaders,
      body: JSON.stringify({ orderId, status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        // Re-fetch the current view
        fetchOrders(statusFilter);
      })
      .catch((err) => console.error('Status update error:', err))
      .finally(() => setUpdating(null));
  }, [statusFilter, fetchOrders]);

  const filteredOrders = orders;

  const filters: { id: FilterStatus; label: string; labelHe: string; count: number }[] = [
    { id: 'all', label: 'All', labelHe: 'הכל', count: summary.total },
    { id: 'pending', label: 'Pending', labelHe: 'ממתין', count: summary.pending },
    { id: 'processing', label: 'Processing', labelHe: 'בעיבוד', count: summary.processing },
    { id: 'shipped', label: 'Shipped', labelHe: 'נשלח', count: summary.shipped },
    { id: 'delivered', label: 'Delivered', labelHe: 'נמסר', count: summary.delivered },
    { id: 'cancelled', label: 'Cancelled', labelHe: 'בוטל', count: summary.cancelled },
  ];

  const columns: Column<NormalizedOrder>[] = [
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
      render: (row) => <span className="font-medium text-gray-900">{row.customer}</span>,
    },
    {
      key: 'vendor',
      header: t('Vendor'),
      render: (row) => <span className="text-gray-700">{row.vendor}</span>,
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

  if (loading) {
    return <LoadingState type="page" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 stroke-[1.5] mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {isRTL ? 'שגיאה בטעינת הזמנות' : 'Failed to load orders'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => fetchOrders(statusFilter)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#2D5A27] rounded-lg hover:bg-[#234A1F] transition-colors cursor-pointer"
        >
          {isRTL ? 'נסה שוב' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={t('Orders')}
          subtitle={isRTL ? `${summary.total} הזמנות` : `${summary.total} orders total`}
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
            onClick={() => handleFilterChange(filter.id)}
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
        <DataTable<NormalizedOrder>
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
            {
              label: isRTL ? 'סמן כבעיבוד' : 'Mark Processing',
              onClick: () => handleStatusUpdate(row.id, 'processing'),
            },
            {
              label: isRTL ? 'סמן כנשלח' : 'Mark Shipped',
              onClick: () => handleStatusUpdate(row.id, 'shipped'),
            },
            {
              label: isRTL ? 'סמן כנמסר' : 'Mark Delivered',
              onClick: () => handleStatusUpdate(row.id, 'delivered'),
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
}
