'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, TrendingUp, Star,
  Plus, Tag, QrCode, ArrowRight, Eye
} from 'lucide-react';
import { PageHeader, StatCard, DataTable } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import SalesLeaderboards from '@/components/vendor/SalesLeaderboards';

// --- Types ---
interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  date: string;
  [key: string]: unknown;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  sold: number;
  [key: string]: unknown;
}

interface AnalyticsData {
  totalRevenue: number;
  orderCount: number;
  productCount: number;
  avgOrderValue: number;
  statusBreakdown: Record<string, number>;
  topProducts: { id: string; name: string; price: number; image: string; views: number; orderAppearances: number }[];
}

// --- Animation variants ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function VendorDashboard() {
  const router = useRouter();
  const { language, t, isRTL } = useLanguage();
  const { user, accessToken } = useAuth();

  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Fetch analytics from real API
  const fetchAnalytics = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/vendor/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
          setProductCount(data.analytics.productCount);

          // Build top products from analytics response
          if (data.analytics.topProducts && data.analytics.topProducts.length > 0) {
            const tops: TopProduct[] = data.analytics.topProducts.slice(0, 5).map((p: any) => ({
              id: p.id,
              name: p.name,
              image: p.image || '/images/placeholder.jpg',
              price: p.price,
              sold: p.orderAppearances || 0,
            }));
            setTopProducts(tops);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Fetch recent orders from real API
  const fetchRecentOrders = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/vendor/orders?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          const formatted: RecentOrder[] = data.orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.order_number || order.id,
            customer: order.customer_name || (isRTL ? 'לקוח' : 'Customer'),
            items: Array.isArray(order.items) ? order.items.length : 0,
            total: parseFloat(order.total || '0'),
            status: order.status || 'pending',
            date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '',
          }));
          setRecentOrders(formatted);
        }
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, [isRTL]);

  const fetchPublicVendorSnapshot = useCallback(async (id: string, shouldPopulateProducts: boolean) => {
    try {
      const response = await fetch(`/api/vendors/${id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Vendor feed failed: ${response.status}`);
      const vendor = await response.json();
      const products = Array.isArray(vendor?.products) ? vendor.products : [];

      if (vendor?.logo) setStoreLogo(vendor.logo);
      if (vendor?.name) setVendorName(current => current || vendor.name);
      if (shouldPopulateProducts) {
        setProductCount(products.length);
        const tops: TopProduct[] = products.slice(0, 5).map((product: any) => ({
          id: product.id,
          name: isRTL && product.nameHe ? product.nameHe : product.name,
          image: product.image || product.images?.[0] || '/images/placeholder.jpg',
          price: Number(product.price) || 0,
          sold: 0,
        }));
        setTopProducts(tops);
      }
    } catch (error) {
      console.error('Error fetching public vendor snapshot:', error);
      if (shouldPopulateProducts) {
        setProductCount(0);
        setTopProducts([]);
      }
    } finally {
      if (shouldPopulateProducts) {
        setLoadingOrders(false);
        setLoadingAnalytics(false);
      }
    }
  }, [isRTL]);

  useEffect(() => {
    // Get vendor info from auth context or legacy localStorage
    let id = user?.vendorId || '';
    let name = user?.displayName || '';

    if (!id) {
      try {
        const authStr = localStorage.getItem('vendorAuth');
        if (authStr) {
          const auth = JSON.parse(authStr);
          id = auth.vendorId || '';
          name = auth.vendorName || auth.name || '';
        }
      } catch { /* ignore */ }
    }

    setVendorId(id);
    setVendorName(name);

    if (id) {
      fetchPublicVendorSnapshot(id, !accessToken);
    }

    // Fetch from real APIs if we have an access token
    if (accessToken) {
      fetchAnalytics(accessToken);
      fetchRecentOrders(accessToken);
    } else {
      if (!id) {
        setProductCount(0);
        setTopProducts([]);
        setLoadingOrders(false);
        setLoadingAnalytics(false);
      }
    }
  }, [user, accessToken, isRTL, fetchAnalytics, fetchRecentOrders, fetchPublicVendorSnapshot]);

  // --- Order table columns ---
  const orderColumns: Column<RecentOrder>[] = [
    {
      key: 'orderNumber',
      header: isRTL ? 'מזהה הזמנה' : 'Order ID',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: isRTL ? 'לקוח' : 'Customer',
    },
    {
      key: 'items',
      header: isRTL ? 'פריטים' : 'Items',
    },
    {
      key: 'total',
      header: isRTL ? 'סכום' : 'Amount',
      render: (row) => <span className="font-semibold">{'\u20AA'}{row.total}</span>,
    },
    {
      key: 'status',
      header: isRTL ? 'סטטוס' : 'Status',
      render: (row) => {
        const statusStyles: Record<string, string> = {
          pending: 'bg-amber-50 text-amber-700 border-amber-200',
          processing: 'bg-blue-50 text-blue-700 border-blue-200',
          completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accepted: 'bg-blue-50 text-blue-700 border-blue-200',
          preparing: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        const statusLabels: Record<string, Record<string, string>> = {
          pending: { en: 'Pending', he: 'ממתין' },
          processing: { en: 'Processing', he: 'בעיבוד' },
          completed: { en: 'Completed', he: 'הושלם' },
          ready: { en: 'Ready', he: 'מוכן' },
          accepted: { en: 'Accepted', he: 'אושר' },
          preparing: { en: 'Preparing', he: 'בהכנה' },
        };
        const style = statusStyles[row.status] || statusStyles.pending;
        const label = statusLabels[row.status]?.[language] || row.status;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              row.status === 'pending' ? 'bg-amber-400' :
              row.status === 'completed' || row.status === 'ready' ? 'bg-emerald-400' :
              'bg-blue-400'
            }`} />
            {label}
          </span>
        );
      },
    },
  ];

  // --- Quick actions ---
  const quickActions = [
    {
      label: isRTL ? 'הוסף מוצר' : 'Add Product',
      labelDesc: isRTL ? 'הוסף מוצר חדש לקטלוג' : 'Add a new product to your catalog',
      href: '/vendor/admin/products',
      icon: <Plus className="w-5 h-5 stroke-[1.5]" />,
      color: '#478c0b',
    },
    {
      label: isRTL ? 'צפה בהזמנות' : 'View Orders',
      labelDesc: isRTL ? 'נהל את ההזמנות שלך' : 'Manage your incoming orders',
      href: '/vendor/orders',
      icon: <ShoppingCart className="w-5 h-5 stroke-[1.5]" />,
      color: '#2D5A27',
    },
    {
      label: isRTL ? 'מבצעים' : 'Promotions',
      labelDesc: isRTL ? 'צור הנחות ומבצעים' : 'Create deals and discounts',
      href: '/vendor/promotions',
      icon: <Tag className="w-5 h-5 stroke-[1.5]" />,
      color: '#C4A265',
    },
    {
      label: isRTL ? 'קודי QR' : 'QR Codes',
      labelDesc: isRTL ? 'צור קודי QR שיווקיים' : 'Generate marketing QR codes',
      href: '/vendor/qr-codes',
      icon: <QrCode className="w-5 h-5 stroke-[1.5]" />,
      color: '#3a3a1d',
    },
  ];

  // Derived stats
  const totalRevenue = analytics?.totalRevenue ?? 0;
  const orderCount = analytics?.orderCount ?? 0;
  const pendingCount = analytics?.statusBreakdown?.pending ?? 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Page Header */}
      <motion.div variants={item}>
        <PageHeader
          title={vendorName || (isRTL ? 'לוח בקרה' : 'Vendor Dashboard')}
          subtitle={isRTL ? 'סקירת ביצועי החנות שלך' : 'Overview of your store performance'}
          isRTL={isRTL}
          actions={
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#92400e] text-white text-xs font-semibold uppercase tracking-wide">
                Vendor Portal
              </span>
              {storeLogo && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                  <Image
                    src={storeLogo}
                    alt={vendorName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          }
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={isRTL ? 'סה"כ מוצרים' : 'Total Products'}
          value={productCount}
          icon={<Package className="w-5 h-5 stroke-[1.5]" />}
          color="green"
        />
        <StatCard
          title={isRTL ? 'הזמנות' : 'Orders'}
          value={orderCount}
          icon={<ShoppingCart className="w-5 h-5 stroke-[1.5]" />}
          color="blue"
        />
        <StatCard
          title={isRTL ? 'הכנסות' : 'Revenue'}
          value={Math.round(totalRevenue)}
          prefix={'\u20AA'}
          icon={<TrendingUp className="w-5 h-5 stroke-[1.5]" />}
          color="amber"
        />
        <StatCard
          title={isRTL ? 'ממוצע הזמנה' : 'Avg Order'}
          value={analytics?.avgOrderValue ? Math.round(analytics.avgOrderValue) : 0}
          prefix={'\u20AA'}
          icon={<Star className="w-5 h-5 stroke-[1.5]" />}
          color="purple"
        />
      </motion.div>

      {/* Task #7: Best-sellers + top-buyers leaderboards (real order data) */}
      <motion.div variants={item} className="mb-8">
        <SalesLeaderboards />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'הזמנות אחרונות' : 'Recent Orders'}
            </h2>
            <Link
              href="/vendor/orders"
              className="flex items-center gap-1 text-sm text-[#478c0b] hover:text-[#3a7209] font-medium transition-colors cursor-pointer"
            >
              {isRTL ? 'צפה בהכל' : 'View All'}
              <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
          {loadingOrders ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#478c0b] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <DataTable<RecentOrder>
              columns={orderColumns}
              data={recentOrders}
              searchable={false}
              pageSize={5}
              emptyTitle={isRTL ? 'אין הזמנות עדיין' : 'No orders yet'}
              isRTL={isRTL}
              onRowClick={() => router.push('/vendor/orders')}
            />
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isRTL ? 'פעולות מהירות' : 'Quick Actions'}
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${action.color}15`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500 truncate">{action.labelDesc}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-300 stroke-[1.5] flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isRTL ? 'מוצרים מובילים' : 'Top Products'}
          </h2>
          <Link
            href="/vendor/admin/products"
            className="flex items-center gap-1 text-sm text-[#478c0b] hover:text-[#3a7209] font-medium transition-colors cursor-pointer"
          >
            {isRTL ? 'כל המוצרים' : 'All Products'}
            <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {loadingAnalytics ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#478c0b] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                {isRTL ? 'אין מוצרים עדיין' : 'No products yet'}
              </div>
            ) : (
              topProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {product.sold > 0
                        ? (isRTL ? `${product.sold} הזמנות` : `${product.sold} orders`)
                        : (isRTL ? 'אין הזמנות עדיין' : 'No orders yet')
                      }
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {'\u20AA'}{product.price}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
