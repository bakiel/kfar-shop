'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Store, Shield, Star, AlertTriangle
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, LoadingState } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';

interface CustomerAccount {
  id: string;
  name: string;
  nameHe: string;
  email: string;
  orders: number;
  points: number;
  status: 'active' | 'inactive';
  [key: string]: unknown;
}

interface VendorAccount {
  id: string;
  storeName: string;
  storeNameHe: string;
  products: number;
  revenue: number;
  rating: number;
  status: 'active' | 'inactive';
  [key: string]: unknown;
}

interface AdminAccount {
  id: string;
  name: string;
  nameHe: string;
  email: string;
  role: string;
  roleHe: string;
  lastLogin: string;
  status: 'active' | 'inactive';
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

// --- Mock fallback data (kept for reference) ---
// const mockCustomers: CustomerAccount[] = [
//   { id: 'cust-001', name: 'Sarah Cohen', nameHe: 'שרה כהן', email: 'sarah@example.com', orders: 12, points: 480, status: 'active' },
//   ... (6 entries)
// ];

const mockAdmins: AdminAccount[] = [
  { id: 'adm-001', name: 'System Admin', nameHe: 'מנהל מערכת', email: 'admin@kfar.com', role: 'Super Admin', roleHe: 'מנהל ראשי', lastLogin: '2025-02-07', status: 'active' },
  { id: 'adm-002', name: 'Content Manager', nameHe: 'מנהל תוכן', email: 'content@kfar.com', role: 'Content Admin', roleHe: 'מנהל תוכן', lastLogin: '2025-02-06', status: 'active' },
];

type TabId = 'customers' | 'vendors' | 'admins';

export default function AccountsPage() {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('customers');
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [vendorAccounts, setVendorAccounts] = useState<VendorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback((search?: string) => {
    setLoading(true);
    setError(null);

    const customerParams = new URLSearchParams({ type: 'customers' });
    const vendorParams = new URLSearchParams({ type: 'vendors' });
    if (search) {
      customerParams.set('search', search);
      vendorParams.set('search', search);
    }

    Promise.all([
      fetch(`/api/admin/accounts?${customerParams.toString()}`).then((r) => {
        if (!r.ok) throw new Error(`Customers: HTTP ${r.status}`);
        return r.json();
      }),
      fetch(`/api/admin/accounts?${vendorParams.toString()}`).then((r) => {
        if (!r.ok) throw new Error(`Vendors: HTTP ${r.status}`);
        return r.json();
      }),
    ])
      .then(([custData, vendData]) => {
        // Normalize customer data from API shape to our interface
        const normalizedCustomers: CustomerAccount[] = (custData.customers || []).map((c: any) => ({
          id: c.id,
          name: c.name || '',
          nameHe: c.name || '',
          email: c.email || '',
          orders: c.totalOrders ?? c.orders ?? 0,
          points: c.loyaltyPoints ?? c.points ?? 0,
          status: c.status || 'active',
        }));
        setCustomers(normalizedCustomers);

        // Normalize vendor data
        const normalizedVendors: VendorAccount[] = (vendData.vendors || []).map((v: any) => ({
          id: v.id,
          storeName: v.name || '',
          storeNameHe: v.name || '',
          products: v.productCount ?? v.products ?? 0,
          revenue: v.totalRevenue ?? v.revenue ?? 0,
          rating: v.averageRating ?? v.rating ?? 4.5,
          status: v.status || 'active',
        }));
        setVendorAccounts(normalizedVendors);

        setLoading(false);
      })
      .catch((err) => {
        console.error('Accounts fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const tabs: { id: TabId; label: string; labelHe: string; icon: React.ReactNode; count: number }[] = [
    { id: 'customers', label: 'Customers', labelHe: 'לקוחות', icon: <Users className="w-4 h-4 stroke-[1.5]" />, count: customers.length },
    { id: 'vendors', label: 'Vendors', labelHe: 'ספקים', icon: <Store className="w-4 h-4 stroke-[1.5]" />, count: vendorAccounts.length },
    { id: 'admins', label: 'Admins', labelHe: 'מנהלים', icon: <Shield className="w-4 h-4 stroke-[1.5]" />, count: mockAdmins.length },
  ];

  const customerColumns: Column<CustomerAccount>[] = [
    {
      key: 'name',
      header: t('Name'),
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{isRTL ? row.nameHe : row.name}</span>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    { key: 'email', header: t('Email'), sortable: true },
    {
      key: 'orders',
      header: t('Orders'),
      sortable: true,
      render: (row) => <span className="font-medium">{row.orders}</span>,
    },
    {
      key: 'points',
      header: isRTL ? 'נקודות' : 'Points',
      sortable: true,
      render: (row) => <span className="text-[#C4A265] font-medium">{row.points}</span>,
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  const vendorColumns: Column<VendorAccount>[] = [
    {
      key: 'storeName',
      header: t('Store Name'),
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
          </div>
          <span className="font-medium text-gray-900">{row.storeName}</span>
        </div>
      ),
    },
    {
      key: 'products',
      header: t('Products'),
      sortable: true,
      render: (row) => <span>{row.products}</span>,
    },
    {
      key: 'revenue',
      header: isRTL ? 'הכנסות' : 'Revenue',
      sortable: true,
      render: (row) => <span className="font-semibold text-gray-900">{'\u20AA'}{row.revenue.toLocaleString()}</span>,
    },
    {
      key: 'rating',
      header: t('Rating'),
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 stroke-[1.5]" />
          {row.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  const adminColumns: Column<AdminAccount>[] = [
    {
      key: 'name',
      header: t('Name'),
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{isRTL ? row.nameHe : row.name}</span>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: isRTL ? 'תפקיד' : 'Role',
      render: (row) => <span className="text-sm">{isRTL ? row.roleHe : row.role}</span>,
    },
    {
      key: 'lastLogin',
      header: isRTL ? 'התחברות אחרונה' : 'Last Login',
      render: (row) => <span className="text-sm text-gray-500">{row.lastLogin}</span>,
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
          {isRTL ? 'שגיאה בטעינת חשבונות' : 'Failed to load accounts'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => fetchAccounts()}
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
          title={t('Accounts')}
          subtitle={isRTL
            ? `${customers.length} לקוחות, ${vendorAccounts.length} ספקים, ${mockAdmins.length} מנהלים`
            : `${customers.length} customers, ${vendorAccounts.length} vendors, ${mockAdmins.length} admins`
          }
          isRTL={isRTL}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelHe : tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#2D5A27]/10 text-[#2D5A27]' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={item}>
        {activeTab === 'customers' && (
          <DataTable<CustomerAccount>
            columns={customerColumns}
            data={customers}
            searchable
            searchPlaceholder={isRTL ? 'חפש לקוחות...' : 'Search customers...'}
            pageSize={10}
            emptyTitle={isRTL ? 'אין לקוחות עדיין' : 'No customers yet'}
            emptyIcon="users"
            isRTL={isRTL}
            rowActions={(row) => [
              { label: t('View Details'), onClick: () => {} },
              {
                label: row.status === 'active' ? (isRTL ? 'השבת' : 'Deactivate') : (isRTL ? 'הפעל' : 'Activate'),
                onClick: () => {},
              },
            ]}
          />
        )}

        {activeTab === 'vendors' && (
          <DataTable<VendorAccount>
            columns={vendorColumns}
            data={vendorAccounts}
            searchable
            searchPlaceholder={isRTL ? 'חפש ספקים...' : 'Search vendors...'}
            pageSize={10}
            emptyTitle={isRTL ? 'אין ספקים עדיין' : 'No vendors yet'}
            emptyIcon="package"
            isRTL={isRTL}
            rowActions={(row) => [
              { label: t('View Details'), onClick: () => {} },
              {
                label: row.status === 'active' ? (isRTL ? 'השבת' : 'Deactivate') : (isRTL ? 'הפעל' : 'Activate'),
                onClick: () => {},
              },
            ]}
          />
        )}

        {activeTab === 'admins' && (
          <DataTable<AdminAccount>
            columns={adminColumns}
            data={mockAdmins}
            searchable={false}
            pageSize={10}
            emptyTitle={isRTL ? 'אין מנהלים' : 'No admins'}
            emptyIcon="users"
            isRTL={isRTL}
            rowActions={(row) => [
              { label: t('View Details'), onClick: () => {} },
            ]}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
