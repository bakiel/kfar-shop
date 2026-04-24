'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Activity, Crown,
  ArrowRight, Clock, Tag, AlertTriangle
} from 'lucide-react';
import { PageHeader, StatCard, LoadingState } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

interface CRMStats {
  totalCustomers: number;
  newThisMonth: number;
  activeShoppers: number;
  byTier: { tier: string; count: number }[];
}

interface RecentActivity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  customer_id: string;
  performed_by: string | null;
  created_at: string;
}

interface Segment {
  id: string;
  name: string;
  segment_type: 'manual' | 'auto';
  customer_count: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-gray-100 text-gray-700',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-indigo-100 text-indigo-800',
};

export default function CRMDashboard() {
  const { t, isRTL } = useLanguage();
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const headers: Record<string, string> = {};
    headers['Authorization'] = `Bearer ${accessToken}`;

    Promise.all([
      fetch('/api/admin/crm/stats', { headers }).then((r) => r.json()),
      fetch('/api/admin/crm/segments', { headers }).then((r) => r.json()),
    ])
      .then(([statsData, segmentsData]) => {
        setStats(statsData);
        setSegments(segmentsData.segments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('CRM dashboard fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [accessToken]);

  if (loading) {
    return <LoadingState message="Loading CRM data..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 stroke-[1.5] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Failed to load CRM</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 space-y-8"
    >
      <motion.div variants={item}>
        <PageHeader
          title={isRTL ? 'ניהול לקוחות' : 'Customer CRM'}
          subtitle={isRTL ? 'נהל לקוחות, פלחי שוק ופעילות' : 'Manage customers, segments, and activity'}
          breadcrumbs={[
            { label: isRTL ? 'ניהול' : 'Admin', href: '/admin/dashboard' },
            { label: 'CRM' },
          ]}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isRTL ? 'סה"כ לקוחות' : 'Total Customers'}
          value={stats?.totalCustomers || 0}
          icon={<Users className="w-5 h-5 stroke-[1.5]" />}
          color="blue"
        />
        <StatCard
          title={isRTL ? 'חדשים החודש' : 'New This Month'}
          value={stats?.newThisMonth || 0}
          icon={<UserPlus className="w-5 h-5 stroke-[1.5]" />}
          color="green"
        />
        <StatCard
          title={isRTL ? 'קונים פעילים' : 'Active Shoppers'}
          value={stats?.activeShoppers || 0}
          icon={<Activity className="w-5 h-5 stroke-[1.5]" />}
          color="emerald"
        />
        <StatCard
          title={isRTL ? 'לקוחות VIP' : 'VIP Customers'}
          value={
            (stats?.byTier || [])
              .filter((t) => t.tier === 'gold' || t.tier === 'platinum')
              .reduce((sum, t) => sum + t.count, 0)
          }
          icon={<Crown className="w-5 h-5 stroke-[1.5]" />}
          color="amber"
        />
      </motion.div>

      {/* Two-column layout: Tier breakdown + Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Breakdown */}
        <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'התפלגות שכבות' : 'Tier Breakdown'}
            </h2>
            <Link
              href="/admin/crm/customers"
              className="text-sm text-[#2D5A27] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isRTL ? 'כל הלקוחות' : 'All Customers'}
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </Link>
          </div>

          {(stats?.byTier || []).length === 0 ? (
            <p className="text-sm text-gray-500 py-4">{isRTL ? 'אין נתונים' : 'No data available'}</p>
          ) : (
            <div className="space-y-3">
              {(stats?.byTier || []).map((tierData) => {
                const percentage = stats?.totalCustomers
                  ? Math.round((tierData.count / stats.totalCustomers) * 100)
                  : 0;
                return (
                  <div key={tierData.tier} className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize min-w-[80px] justify-center ${
                        tierColors[tierData.tier] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tierData.tier}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#2D5A27] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[60px] text-right">
                      {tierData.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Segments */}
        <motion.div variants={item} className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'פלחי שוק' : 'Customer Segments'}
            </h2>
            <Link
              href="/admin/crm/segments"
              className="text-sm text-[#2D5A27] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isRTL ? 'ניהול פלחים' : 'Manage'}
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </Link>
          </div>

          {segments.length === 0 ? (
            <div className="text-center py-6">
              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
              <p className="text-sm text-gray-500">
                {isRTL ? 'אין פלחי שוק עדיין' : 'No segments created yet'}
              </p>
              <Link
                href="/admin/crm/segments"
                className="text-sm text-[#2D5A27] hover:underline mt-2 inline-block cursor-pointer"
              >
                {isRTL ? 'צור פלח ראשון' : 'Create your first segment'}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {segments.slice(0, 5).map((seg) => (
                <div
                  key={seg.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                    <span className="text-sm font-medium text-gray-900">{seg.name}</span>
                    <span className="text-xs text-gray-400 capitalize">({seg.segment_type})</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {seg.customer_count} {isRTL ? 'לקוחות' : 'customers'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/crm/customers" className="cursor-pointer">
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isRTL ? 'רשימת לקוחות' : 'Customer List'}
              </p>
              <p className="text-xs text-gray-500">
                {isRTL ? 'חפש, סנן וצפה' : 'Search, filter and view'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 stroke-[1.5] ml-auto" />
          </motion.div>
        </Link>

        <Link href="/admin/crm/segments" className="cursor-pointer">
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isRTL ? 'פלחי שוק' : 'Segments'}
              </p>
              <p className="text-xs text-gray-500">
                {isRTL ? 'צור וערוך פלחים' : 'Create and manage segments'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 stroke-[1.5] ml-auto" />
          </motion.div>
        </Link>

        <Link href="/admin/crm/customers" className="cursor-pointer">
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-600 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isRTL ? 'פעילות אחרונה' : 'Recent Activity'}
              </p>
              <p className="text-xs text-gray-500">
                {isRTL ? 'צפה בלוג הפעילות' : 'View activity log'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 stroke-[1.5] ml-auto" />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
