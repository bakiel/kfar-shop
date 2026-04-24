'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PromotionSubmissionForm from '@/components/vendor/PromotionSubmissionForm';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Clock, Eye, TrendingUp, Flag, ArrowRight, Lightbulb, CheckCircle, BarChart3, Info } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function VendorPromotionsPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || '';
  
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
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>3</p>
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
                <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>1</p>
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
                <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>1,247</p>
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
                <p className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>18%</p>
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
            <p className="text-gray-500 text-center">
              No active promotions yet. Create your first promotion above!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}