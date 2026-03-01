'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
  AlertTriangle, UserPlus, X
} from 'lucide-react';
import { PageHeader, StatusBadge, LoadingState } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loyalty_tier: string;
  points: number;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  last_order_date?: string | null; // alias kept for compat
  tags: string[];
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const tierBadgeColors: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-gray-100 text-gray-700 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function CustomersPage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { accessToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCustomers = useCallback(
    (page: number = 1) => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      headers['Authorization'] = `Bearer ${accessToken}`;

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (tierFilter) params.set('tier', tierFilter);

      fetch(`/api/admin/crm/customers?${params.toString()}`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json) => {
          setCustomers(json.customers || []);
          setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch customers error:', err);
          setError(err.message);
          setLoading(false);
        });
    },
    [accessToken, search, tierFilter]
  );

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setTierFilter('');
  };

  const hasActiveFilters = search || tierFilter;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'לקוחות' : 'Customers'}
          subtitle={isRTL ? `${pagination.total} לקוחות` : `${pagination.total} customers`}
          breadcrumbs={[
            { label: isRTL ? 'ניהול' : 'Admin', href: '/admin/dashboard' },
            { label: 'CRM', href: '/admin/crm' },
            { label: isRTL ? 'לקוחות' : 'Customers' },
          ]}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Search + Filters Bar */}
      <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isRTL ? 'חפש לפי שם, אימייל או טלפון...' : 'Search by name, email, or phone...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-[#2D5A27] text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              {isRTL ? 'חפש' : 'Search'}
            </motion.button>
          </form>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors ${
              showFilters ? 'border-[#2D5A27] text-[#2D5A27] bg-[#2D5A27]/5' : 'border-gray-200 text-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 stroke-[1.5]" />
            {isRTL ? 'סינון' : 'Filters'}
          </motion.button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 items-center"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">
                {isRTL ? 'שכבה:' : 'Tier:'}
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
              >
                <option value="">{isRTL ? 'הכל' : 'All Tiers'}</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3 stroke-[1.5]" />
                {isRTL ? 'נקה הכל' : 'Clear All'}
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={item}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 stroke-[1.5] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                {isRTL ? 'שגיאה בטעינת לקוחות' : 'Error loading customers'}
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && <LoadingState message={isRTL ? 'טוען לקוחות...' : 'Loading customers...'} />}

      {/* Customer Table */}
      {!loading && !error && (
        <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-gray-500 font-medium">
                {isRTL ? 'לא נמצאו לקוחות' : 'No customers found'}
              </p>
              {hasActiveFilters && (
                <p className="text-sm text-gray-400 mt-1">
                  {isRTL ? 'נסה לשנות את הסינון' : 'Try adjusting your filters'}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'לקוח' : 'Customer'}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        {isRTL ? 'אימייל' : 'Email'}
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {isRTL ? 'שכבה' : 'Tier'}
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        {isRTL ? 'הזמנות' : 'Orders'}
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        {isRTL ? 'סה"כ הוצאות' : 'Total Spent'}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        {isRTL ? 'הזמנה אחרונה' : 'Last Order'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, idx) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => router.push(`/admin/crm/customers/${customer.id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2D5A27]/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-[#2D5A27]">
                                {customer.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-400 md:hidden">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                          {customer.email}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${
                              tierBadgeColors[customer.loyalty_tier] || 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {customer.loyalty_tier || 'bronze'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 hidden sm:table-cell">
                          {customer.total_orders || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 hidden sm:table-cell">
                          {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(
                            customer.total_spent || 0
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                          {(customer.last_order_at || customer.last_order_date)
                            ? new Date((customer.last_order_at || customer.last_order_date)!).toLocaleDateString()
                            : '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {isRTL
                      ? `מציג ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )} מתוך ${pagination.total}`
                      : `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )} of ${pagination.total}`}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchCustomers(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchCustomers(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
