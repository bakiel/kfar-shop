'use client';

import React, { useState, useEffect } from 'react';
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
import { vendorStores, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';

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

// --- Animation variants ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// --- Mock data generators ---
function getMockRecentOrders(): RecentOrder[] {
  return [
    { id: '1', orderNumber: 'ORD-2025-047', customer: 'Sarah Cohen', items: 3, total: 145, status: 'pending', date: '2025-02-08' },
    { id: '2', orderNumber: 'ORD-2025-046', customer: 'David Levi', items: 1, total: 68, status: 'processing', date: '2025-02-08' },
    { id: '3', orderNumber: 'ORD-2025-045', customer: 'Rachel Ben-Ari', items: 5, total: 230, status: 'completed', date: '2025-02-07' },
    { id: '4', orderNumber: 'ORD-2025-044', customer: 'Yossi Amir', items: 2, total: 89, status: 'processing', date: '2025-02-07' },
    { id: '5', orderNumber: 'ORD-2025-043', customer: 'Miriam Gold', items: 4, total: 176, status: 'completed', date: '2025-02-06' },
  ];
}

export default function VendorDashboard() {
  const router = useRouter();
  const { language, t, isRTL } = useLanguage();

  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem('vendorAuth');
      if (!authStr) return;
      const auth = JSON.parse(authStr);
      const id = auth.vendorId || '';
      const name = auth.vendorName || auth.name || '';
      setVendorId(id);
      setVendorName(name);

      // Get real product data for this vendor
      const products = getProductsByVendor(id);
      setProductCount(products.length);

      // Build top products from actual data
      const tops: TopProduct[] = products.slice(0, 5).map((p, i) => ({
        id: p.id,
        name: (isRTL && (p as Record<string, unknown>).nameHe) ? String((p as Record<string, unknown>).nameHe) : p.name,
        image: p.image || '/images/placeholder.jpg',
        price: p.price,
        sold: Math.floor(Math.random() * 40) + 10, // mock sold count
      }));
      setTopProducts(tops);
    } catch {
      // Layout handles auth redirect
    }
  }, [isRTL]);

  const recentOrders = getMockRecentOrders();

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
        };
        const statusLabels: Record<string, Record<string, string>> = {
          pending: { en: 'Pending', he: 'ממתין' },
          processing: { en: 'Processing', he: 'בעיבוד' },
          completed: { en: 'Completed', he: 'הושלם' },
        };
        const style = statusStyles[row.status] || statusStyles.pending;
        const label = statusLabels[row.status]?.[language] || row.status;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'pending' ? 'bg-amber-400' : row.status === 'processing' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
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

  // --- Vendor store info ---
  const vendorStore = vendorStores[vendorId];
  const storeLogo = vendorStore?.logo;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Page Header */}
      <motion.div variants={item}>
        <PageHeader
          title={vendorName || (isRTL ? 'לוח בקרה' : 'Dashboard')}
          subtitle={isRTL ? 'סקירת ביצועי החנות שלך' : 'Overview of your store performance'}
          isRTL={isRTL}
          actions={
            storeLogo ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                <Image
                  src={storeLogo}
                  alt={vendorName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : undefined
          }
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={isRTL ? 'סה"כ מוצרים' : 'Total Products'}
          value={productCount}
          icon={<Package className="w-5 h-5 stroke-[1.5]" />}
          trend={{ value: 5, label: isRTL ? 'לעומת חודש שעבר' : 'vs last month' }}
          color="green"
        />
        <StatCard
          title={isRTL ? 'הזמנות היום' : 'Orders Today'}
          value={12}
          icon={<ShoppingCart className="w-5 h-5 stroke-[1.5]" />}
          trend={{ value: 18, label: isRTL ? 'לעומת אתמול' : 'vs yesterday' }}
          color="blue"
        />
        <StatCard
          title={isRTL ? 'הכנסות החודש' : 'Revenue This Month'}
          value={8450}
          prefix={'\u20AA'}
          icon={<TrendingUp className="w-5 h-5 stroke-[1.5]" />}
          trend={{ value: 12, label: isRTL ? 'לעומת חודש שעבר' : 'vs last month' }}
          color="amber"
        />
        <StatCard
          title={isRTL ? 'דירוג' : 'Rating'}
          value={4.8}
          suffix="/5"
          icon={<Star className="w-5 h-5 stroke-[1.5]" />}
          trend={{ value: 3, label: isRTL ? '23 ביקורות' : '23 reviews' }}
          color="purple"
        />
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
          <DataTable<RecentOrder>
            columns={orderColumns}
            data={recentOrders}
            searchable={false}
            pageSize={5}
            emptyTitle={isRTL ? 'אין הזמנות עדיין' : 'No orders yet'}
            isRTL={isRTL}
            onRowClick={() => router.push('/vendor/orders')}
          />
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
            {topProducts.length === 0 ? (
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
                      {isRTL ? `${product.sold} נמכרו` : `${product.sold} sold`}
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
