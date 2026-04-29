'use client';

import React from 'react';
import { motion } from 'framer-motion';
import VendorBannerManager from '@/components/vendor/VendorBannerManager';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function VendorBannersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const vendorId = user?.vendorId || '';

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
            Store Banner Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Create eye-catching banners to promote your products and events on your store page
          </p>
        </motion.div>

        {/* Banner Manager Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <VendorBannerManager vendorId={vendorId} />
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
            <HelpCircle className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#478c0b' }} />
            How Banners Work
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-3" style={{ color: '#478c0b' }}>
                Banner Placement
              </h3>
              <p className="text-gray-600 mb-4">
                Your banners appear prominently on your store page, right below the hero section. 
                Active banners rotate automatically every 8 seconds to showcase multiple promotions.
              </p>
              
              <h3 className="font-bold mb-3" style={{ color: '#478c0b' }}>
                Analytics Tracking
              </h3>
              <p className="text-gray-600">
                Track your banner performance with real-time analytics:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Views: How many times your banner was displayed</li>
                <li>Clicks: Number of customers who clicked your CTA</li>
                <li>Conversions: Actual purchases from banner clicks</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-3" style={{ color: '#478c0b' }}>
                Best Templates for Results
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold text-gray-700">Flash Sale</p>
                    <p className="text-sm text-gray-600">Perfect for time-limited offers with countdown timer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📢</span>
                  <div>
                    <p className="font-semibold text-gray-700">Announcement</p>
                    <p className="text-sm text-gray-600">Great for new products or important updates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="font-semibold text-gray-700">Event</p>
                    <p className="text-sm text-gray-600">Ideal for workshops, tastings, or special events</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-semibold text-gray-700">Product Highlight</p>
                    <p className="text-sm text-gray-600">Showcase your bestsellers or new arrivals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#fef9ef' }}>
            <p className="text-sm text-gray-600">
              <Info className="w-4 h-4 stroke-[1.5] inline mr-2" style={{ color: '#f6af0d' }} />
              <strong>Pro Tip:</strong> Update your banners regularly to keep customers engaged. 
              Seasonal promotions and limited-time offers typically see the highest conversion rates.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
