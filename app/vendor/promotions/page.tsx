'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PromotionSubmissionForm from '@/components/vendor/PromotionSubmissionForm';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Clock, Eye, TrendingUp, Flag, ArrowRight, Lightbulb, CheckCircle, BarChart3, Info } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface VendorPromotion {
  id: string;
  title: string;
  description: string;
  status: string;
  isActive: boolean;
  endDate?: string;
}

export default function VendorPromotionsPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const vendorId = user?.vendorId || '';
  const [promotions, setPromotions] = useState<VendorPromotion[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const loadPromotions = async () => {
      try {
        const response = await fetch('/api/vendor/promotions', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load promotions');
        }
        setPromotions(data.promotions || []);
        setStats(data.stats || { total: 0, active: 0, pending: 0, rejected: 0 });
      } catch (err) {
        console.error('Error loading vendor promotions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load promotions');
        setPromotions([]);
        setStats({ total: 0, active: 0, pending: 0, rejected: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, [accessToken, authLoading]);

  if (authLoading || !vendorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#478c0b] border-t-transparent rounded-full animate-spin" />
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
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
            Promotion Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Create compelling promotions to feature on the KFAR marketplace homepage
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Promotions</p>
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>{stats.active}</p>
              </div>
              <Megaphone className="w-8 h-8 stroke-[1.5]" style={{ color: '#478c0b' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 stroke-[1.5]" style={{ color: '#f6af0d' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>0</p>
              </div>
              <Eye className="w-8 h-8 stroke-[1.5]" style={{ color: '#c23c09' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>0%</p>
              </div>
              <TrendingUp className="w-8 h-8 stroke-[1.5]" style={{ color: '#3a3a1d' }} />
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PromotionSubmissionForm vendorId={vendorId} />
            </motion.div>
          </div>

          {/* Tips & Guidelines */}
          <div className="space-y-6">
            {/* Banner Manager Link */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-bold mb-3">
                <Flag className="w-5 h-5 stroke-[1.5] mr-2" />
                Store Banner Manager
              </h3>
              <p className="text-sm mb-4 opacity-90">
                Create eye-catching banners that appear on your store page to highlight promotions, events, and special offers.
              </p>
              <Link
                href="/vendor/banners"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Manage Banners
                <ArrowRight className="w-5 h-5 stroke-[1.5]" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                <Lightbulb className="w-5 h-5 stroke-[1.5] mr-2" style={{ color: '#f6af0d' }} />
                Promotion Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use high-quality product images that showcase your items</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Create urgency with limited-time offers or stock quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Write clear, compelling titles that grab attention</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Target specific audiences for better conversion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Schedule promotions during peak shopping hours</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                <BarChart3 className="w-5 h-5 stroke-[1.5] mr-2" style={{ color: '#478c0b' }} />
                Performance Insights
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Best Performing Day</p>
                  <p className="font-semibold" style={{ color: '#478c0b' }}>Thursday</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peak Shopping Time</p>
                  <p className="font-semibold" style={{ color: '#478c0b' }}>6:00 PM - 8:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Promotion Type</p>
                  <p className="font-semibold" style={{ color: '#478c0b' }}>Flash Sales</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                <Info className="w-5 h-5 stroke-[1.5] mr-2" style={{ color: '#478c0b' }} />
                Guidelines
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• All promotions require admin approval</p>
                <p>• Promotions go live within 2-4 hours</p>
                <p>• Maximum 3 active promotions per vendor</p>
                <p>• Minimum promotion duration: 4 hours</p>
                <p>• Images must be 800x600px minimum</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Active Promotions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
            Your Active Promotions
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            {loading ? (
              <p className="text-gray-500 text-center">Loading promotions...</p>
            ) : error ? (
              <p className="text-red-600 text-center">{error}</p>
            ) : promotions.length === 0 ? (
              <p className="text-gray-500 text-center">
                No promotions yet. Create your first promotion above.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {promotions.map((promotion) => (
                  <div key={promotion.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold" style={{ color: '#3a3a1d' }}>{promotion.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{promotion.description}</p>
                      {promotion.endDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Ends {new Date(promotion.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      promotion.isActive || promotion.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : promotion.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {promotion.status === 'pending_approval' ? 'Pending' : promotion.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
