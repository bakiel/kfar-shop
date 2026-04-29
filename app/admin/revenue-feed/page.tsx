'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Calculator, Users, Trophy, RefreshCw, AlertTriangle, Store
} from 'lucide-react';
import { PageHeader, LoadingState, StatusBadge } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

// --- Types ---

interface VendorInfo {
  id: string;
  name: string;
  logo: string;
  color: string;
  totalRevenue: number;
  totalOrders: number;
}

interface FeedOrder {
  id: string;
  orderNumber: string;
  customer: string;
  vendorId: string;
  vendorName: string;
  items: number;
  total: number;
  date: string;
  timestamp: Date;
  status: string;
  paymentMethod: string;
}

// --- Constants ---

const defaultColors = ['#2E7D32', '#F57C00', '#1976D2', '#388E3C', '#7B1FA2', '#E91E63'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Helpers ---

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function normalizeOrder(o: any): FeedOrder {
  const customerName = typeof o.customer === 'object' ? o.customer?.name : (o.customer || 'Unknown');
  const vendorName = o.vendorName || o.vendor_name || o.vendor || '';
  const vendorId = o.vendorId || o.vendor_id || '';
  const itemsCount = Array.isArray(o.items) ? o.items.length : (typeof o.items === 'number' ? o.items : 0);
  const dateStr = o.date || (o.createdAt ? o.createdAt.split('T')[0] : (o.created_at ? o.created_at.split('T')[0] : ''));
  const timestamp = o.createdAt ? new Date(o.createdAt) : (o.created_at ? new Date(o.created_at) : (o.date ? new Date(o.date) : new Date()));

  return {
    id: o.id || o.orderNumber || '',
    orderNumber: o.orderNumber || o.order_number || o.id || '',
    customer: customerName,
    vendorId,
    vendorName,
    items: itemsCount,
    total: typeof o.total_amount === 'number' ? o.total_amount : (typeof o.total === 'number' ? o.total : parseFloat(o.total_amount ?? o.total) || 0),
    date: dateStr,
    timestamp,
    status: o.status || 'pending',
    paymentMethod: o.paymentMethod || o.payment_method || 'Credit Card',
  };
}

// --- Component ---

export default function RevenueFeedPage() {
  const { language, t, isRTL } = useLanguage();
  const { accessToken } = useAuth();

  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [orders, setOrders] = useState<FeedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  // Build vendor lookup map
  const vendorMap = useMemo(() => {
    const map: Record<string, VendorInfo> = {};
    vendors.forEach(v => { map[v.id] = v; });
    return map;
  }, [vendors]);

  // --- Data fetching ---

  const fetchData = useCallback(async (showRefresh = false) => {
    if (!accessToken) return;

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

    try {
      const [vendorsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/accounts?type=vendors', { headers }),
        fetch('/api/admin/orders?limit=200', { headers }),
      ]);

      // --- Vendors ---
      if (vendorsRes.ok) {
        const vendorsJson = await vendorsRes.json();
        const vendorList: VendorInfo[] = (vendorsJson.vendors || []).map((v: any, i: number) => ({
          id: v.vendorId || v.vendor_id || v.id,
          name: v.name || v.storeName || v.store_name || '',
          logo: v.logo_url || v.logo || `/images/vendors/default-vendor.png`,
          color: v.primary_color || defaultColors[i % defaultColors.length],
          totalRevenue: v.totalRevenue || 0,
          totalOrders: v.totalOrders || 0,
        }));
        setVendors(vendorList);
      } else {
        console.error('Vendors fetch failed:', vendorsRes.status);
      }

      // --- Orders ---
      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        const normalizedOrders = (ordersJson.orders || []).map(normalizeOrder);
        // Sort newest first
        normalizedOrders.sort((a: FeedOrder, b: FeedOrder) => b.timestamp.getTime() - a.timestamp.getTime());
        setOrders(normalizedOrders);
      } else {
        console.error('Orders fetch failed:', ordersRes.status);
        if (ordersRes.status === 401) {
          setError('Unauthorized. Please log in again.');
        }
      }
    } catch (err: any) {
      console.error('Revenue feed fetch error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetchData();
  }, [fetchData, accessToken]);

  // --- Filtering ---

  const filteredOrders = useMemo(() => {
    let items = orders;

    // Store filter
    if (filter !== 'all') {
      items = items.filter(o => o.vendorId === filter || o.vendorName === filter);
    }

    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      const hoursAgo = parseInt(timeRange, 10);
      if (!isNaN(hoursAgo)) {
        items = items.filter(o => o.timestamp.getTime() > now.getTime() - hoursAgo * 60 * 60 * 1000);
      }
    }

    return items;
  }, [orders, filter, timeRange]);

  // --- Computed stats ---

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  const storeStats = useMemo(() => {
    return vendors.map(vendor => {
      const vendorOrders = orders.filter(o => o.vendorId === vendor.id || o.vendorName === vendor.name);
      const revenue = vendorOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...vendor,
        orderCount: vendorOrders.length,
        feedRevenue: revenue,
      };
    });
  }, [vendors, orders]);

  const topStore = useMemo(() => {
    if (storeStats.length === 0) return null;
    return [...storeStats].sort((a, b) => b.feedRevenue - a.feedRevenue)[0];
  }, [storeStats]);

  const avgOrder = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    return totalRevenue / filteredOrders.length;
  }, [totalRevenue, filteredOrders]);

  // --- Render ---

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState type="page" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 lg:p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item}>
        <PageHeader
          title={language === 'he' ? 'פיד הכנסות' : 'Revenue Feed'}
          subtitle={language === 'he' ? 'הזמנות ונתוני הכנסות בזמן אמת' : 'Latest orders and revenue data across all stores'}
          isRTL={isRTL}
          actions={
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 stroke-[1.5] ${refreshing ? 'animate-spin' : ''}`} />
                {language === 'he' ? 'רענן' : 'Refresh'}
              </motion.button>
              <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                <p className="text-sm text-gray-500">{language === 'he' ? 'סה"כ הכנסות' : 'Total Revenue'}</p>
                <p className="text-xl font-bold text-emerald-600">{'\u20AA'}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          }
        />
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.div variants={item} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 stroke-[1.5] text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Store Stats Cards */}
      {vendors.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {storeStats.map((store) => (
            <motion.div
              key={store.id}
              whileHover={{ y: -4, boxShadow: '0 12px 24px -6px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2, ease: 'easeOut' as const }}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                filter === store.id
                  ? 'ring-2 ring-offset-2 border-transparent'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              style={{
                '--tw-ring-color': store.color,
              } as React.CSSProperties}
              onClick={() => setFilter(filter === store.id ? 'all' : store.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={store.logo}
                    alt={store.name || 'Vendor'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-xs text-gray-700 line-clamp-1">{store.name}</h3>
              </div>
              <p className="text-xl font-bold" style={{ color: store.color }}>
                {'\u20AA'}{store.feedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{store.orderCount} {language === 'he' ? 'הזמנות' : 'orders'}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">
              {language === 'he' ? 'טווח זמן:' : 'Time Range:'}
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="all">{language === 'he' ? 'הכל' : 'All Time'}</option>
              <option value="1">{language === 'he' ? 'שעה אחרונה' : 'Last Hour'}</option>
              <option value="6">{language === 'he' ? '6 שעות' : 'Last 6 Hours'}</option>
              <option value="24">{language === 'he' ? '24 שעות' : 'Last 24 Hours'}</option>
              <option value="168">{language === 'he' ? 'שבוע' : 'Last 7 Days'}</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {language === 'he' ? 'כל החנויות' : 'All Stores'}
          </motion.button>

          <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
            <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
            <span>{filteredOrders.length} {language === 'he' ? 'הזמנות' : 'orders'}</span>
          </div>
        </div>
      </motion.div>

      {/* Order Feed */}
      <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 stroke-[1.5] text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {language === 'he' ? 'אין הזמנות להצגה' : 'No orders to display'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {language === 'he' ? 'נסה לשנות את הסינון או טווח הזמן' : 'Try adjusting your filters or time range'}
            </p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50">
            {filteredOrders.map((order) => {
              const vendor = vendorMap[order.vendorId];
              const vendorColor = vendor?.color || '#6B7280';
              const vendorLogo = vendor?.logo;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Vendor logo */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {vendorLogo ? (
                            <Image
                              src={vendorLogo}
                              alt={order.vendorName || 'Vendor'}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: vendorColor }}
                            >
                              {(order.vendorName || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Order details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{order.customer}</h4>
                            <StatusBadge
                              status={order.status as any}
                              language={language as 'en' | 'he'}
                              size="sm"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {order.orderNumber && <span className="text-gray-400 mr-1">#{order.orderNumber}</span>}
                            {order.items > 0 && (
                              <span>{order.items} {language === 'he' ? 'פריטים' : order.items === 1 ? 'item' : 'items'}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span style={{ color: vendorColor }} className="font-medium">{order.vendorName}</span>
                            <span>-</span>
                            <span>{order.paymentMethod}</span>
                            <span>-</span>
                            <span>{formatTimeAgo(order.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold" style={{ color: vendorColor }}>
                          {'\u20AA'}{order.total.toFixed(2)}
                        </p>
                        {order.date && (
                          <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {language === 'he' ? 'סה"כ הזמנות' : 'Total Orders'}
            </h3>
            <ShoppingCart className="w-5 h-5 stroke-[1.5] text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {filteredOrders.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {language === 'he' ? 'ממוצע הזמנה' : 'Average Order'}
            </h3>
            <Calculator className="w-5 h-5 stroke-[1.5] text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {'\u20AA'}{avgOrder.toFixed(0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {language === 'he' ? 'חנויות פעילות' : 'Active Stores'}
            </h3>
            <Users className="w-5 h-5 stroke-[1.5] text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {storeStats.filter(s => s.orderCount > 0).length} / {vendors.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              {language === 'he' ? 'חנות מובילה' : 'Top Store'}
            </h3>
            <Trophy className="w-5 h-5 stroke-[1.5] text-gray-300" />
          </div>
          {topStore ? (
            <>
              <p className="text-base font-bold text-gray-900 truncate">{topStore.name}</p>
              <p className="text-sm text-gray-500">
                {'\u20AA'}{topStore.feedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </>
          ) : (
            <p className="text-base text-gray-400">-</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
