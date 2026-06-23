'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, Leaf, Star, Sprout, Wheat, AlertTriangle, Loader, Users } from 'lucide-react';
import CustomerProfileShowcase from '@/components/customer/CustomerProfileShowcase';
import { useAuth } from '@/lib/context/AuthContext';

interface CRMCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loyalty_tier: string;
  points: number;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  tags: string[];
  notes: string | null;
  addresses: any;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalCustomers: number;
  tierDistribution: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  totalOrders: number;
  totalRevenue: number;
}

function computeStats(customers: CRMCustomer[]): Stats {
  const tierDistribution = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let totalOrders = 0;
  let totalRevenue = 0;

  for (const c of customers) {
    const tier = (c.loyalty_tier || 'bronze').toLowerCase() as keyof typeof tierDistribution;
    if (tier in tierDistribution) {
      tierDistribution[tier]++;
    } else {
      tierDistribution.bronze++;
    }
    totalOrders += c.total_orders || 0;
    totalRevenue += Number(c.total_spent) || 0;
  }

  return {
    totalCustomers: customers.length,
    tierDistribution,
    totalOrders,
    totalRevenue,
  };
}

export default function AdminCustomerProfilesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'analytics'>('overview');
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchCustomers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch('/api/admin/crm/customers?limit=100', { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch customers (${res.status})`);
      }
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const stats = computeStats(customers);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
              Customer Profile Management
            </h1>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeOut' as const }}
            >
              <Loader className="w-8 h-8 stroke-[1.5] text-green-600" />
            </motion.div>
            <p className="text-gray-600">Loading customer data from database...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
              Customer Profile Management
            </h1>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-8 h-8 stroke-[1.5] text-red-500" />
            <p className="text-gray-800 font-medium">{error}</p>
            <button
              onClick={fetchCustomers}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
              Customer Profile Management
            </h1>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center gap-4">
            <Users className="w-12 h-12 stroke-[1.5] text-gray-400" />
            <p className="text-gray-800 font-medium text-lg">No customers found</p>
            <p className="text-gray-500 text-sm">
              Customer profiles will appear here once customers register on the platform.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            Back to Admin Dashboard
          </Link>

          <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
            Customer Profile Management
          </h1>
          <p className="text-gray-600 mt-2">
            Real customer data from the database ({stats.totalCustomers} customers)
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex gap-8 px-6">
            {['overview', 'profiles', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-all capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-lg p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Customer Base Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#478c0b' }}>
                      {stats.totalCustomers}
                    </h3>
                    <p className="text-gray-600 mt-1">Total Customers</p>
                    <p className="text-sm text-gray-500 mt-2">Registered in database</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#7c3aed' }}>
                      {stats.tierDistribution.platinum + stats.tierDistribution.gold}
                    </h3>
                    <p className="text-gray-600 mt-1">Premium Members</p>
                    <p className="text-sm text-gray-500 mt-2">Gold & Platinum tiers</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#f6af0d' }}>
                      {stats.totalOrders}
                    </h3>
                    <p className="text-gray-600 mt-1">Total Orders</p>
                    <p className="text-sm text-gray-500 mt-2">Across all customers</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                      {stats.totalRevenue.toLocaleString()} ILS
                    </h3>
                    <p className="text-gray-600 mt-1">Total Revenue</p>
                    <p className="text-sm text-gray-500 mt-2">Lifetime customer spend</p>
                  </div>
                </div>
              </div>

              {/* Tier Distribution */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Loyalty Tier Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.tierDistribution).map(([tier, count]) => (
                    <div key={tier} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium capitalize">{tier}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: stats.totalCustomers > 0 ? `${(count / stats.totalCustomers) * 100}%` : '0%' }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={`h-full flex items-center justify-end px-3 text-white text-sm font-medium ${
                            tier === 'platinum' ? 'bg-purple-500' :
                            tier === 'gold' ? 'bg-yellow-500' :
                            tier === 'silver' ? 'bg-gray-500' :
                            'bg-orange-500'
                          }`}
                        >
                          {count}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Data Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  <Brain className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#3b82f6' }} />
                  Customer Data Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Database Overview</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>- {stats.totalCustomers} registered customers in the system</li>
                      <li>- {stats.tierDistribution.platinum + stats.tierDistribution.gold} premium tier members (Gold + Platinum)</li>
                      <li>- {stats.tierDistribution.silver} Silver tier members</li>
                      <li>- {stats.tierDistribution.bronze} Bronze tier members</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Activity Summary</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>- {stats.totalOrders} total orders placed</li>
                      <li>- {stats.totalRevenue.toLocaleString()} ILS total lifetime spend</li>
                      <li>- {stats.totalCustomers > 0 ? Math.round(stats.totalOrders / stats.totalCustomers) : 0} average orders per customer</li>
                      <li>- {stats.totalCustomers > 0 ? Math.round(stats.totalRevenue / stats.totalCustomers).toLocaleString() : 0} ILS average spend per customer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CustomerProfileShowcase />
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Tier Breakdown */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Loyalty Tier Breakdown
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(stats.tierDistribution).map(([tier, count]) => {
                    const TierIcon = tier === 'platinum' ? Star :
                      tier === 'gold' ? Star :
                      tier === 'silver' ? Star :
                      Leaf;
                    const percentage = stats.totalCustomers > 0 ? Math.round((count / stats.totalCustomers) * 100) : 0;
                    return (
                      <div key={tier} className="bg-green-50 rounded-lg p-4 text-center">
                        <TierIcon className="w-6 h-6 stroke-[1.5] mb-2 mx-auto" style={{ color: '#478c0b' }} />
                        <p className="font-semibold capitalize">{tier}</p>
                        <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>{count}</p>
                        <p className="text-sm text-gray-500">{percentage}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Customers by Spend */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Top Customers by Spend
                </h3>
                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Tier</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Orders</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Total Spent</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...customers]
                        .sort((a, b) => (Number(b.total_spent) || 0) - (Number(a.total_spent) || 0))
                        .slice(0, 10)
                        .map((customer) => (
                          <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                customer.loyalty_tier === 'platinum' ? 'bg-purple-100 text-purple-700' :
                                customer.loyalty_tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                                customer.loyalty_tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {customer.loyalty_tier || 'bronze'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">{customer.total_orders || 0}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                              {(Number(customer.total_spent) || 0).toLocaleString()} ILS
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">{(customer.points || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {customers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No customer data available
                    </div>
                  )}
                </div>
              </div>

              {/* Shopping Patterns Placeholder */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Shopping Patterns & Category Preferences
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Peak Shopping Times</h4>
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <AlertTriangle className="w-8 h-8 stroke-[1.5] mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500 text-center">
                        No analytics data available yet.
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Shopping time patterns will appear once order history builds up.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Category Preferences</h4>
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <AlertTriangle className="w-8 h-8 stroke-[1.5] mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500 text-center">
                        No analytics data available yet.
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Category preferences will appear once purchase data is analyzed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
