'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaStore, FaBox, FaShoppingCart, FaChartLine, FaQrcode, FaLeaf, FaStar, FaClock } from 'react-icons/fa';
import { vendorStores, getAllProducts } from '@/lib/data/wordpress-style-data-layer';
import QRTrackingDashboard from '@/components/admin/QRTrackingDashboard';

export default function EnhancedAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    totalProducts: 0,
    activeProducts: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    qrScans: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Get real data
      const vendors = Object.values(vendorStores);
      const allProducts = getAllProducts();
      const activeProducts = allProducts.filter(p => p.inStock);
      
      setVendorStats({
        totalVendors: vendors.length,
        totalProducts: allProducts.length,
        activeProducts: activeProducts.length,
        todayRevenue: 4850,
        monthlyRevenue: 125000,
        totalOrders: 342,
        qrScans: 1248
      });
      
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef9ef]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#478c0b] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fef9ef]">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#478c0b' }}>
                <FaLeaf className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
                  KFAR Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Village of Peace Marketplace Management</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'overview' 
                    ? 'text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={activeTab === 'overview' ? { backgroundColor: '#478c0b' } : {}}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('qr-tracking')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'qr-tracking' 
                    ? 'text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={activeTab === 'qr-tracking' ? { backgroundColor: '#478c0b' } : {}}
              >
                <FaQrcode className="inline mr-2" />
                QR Tracking
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' ? (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#cfe7c1' }}>
                    <FaStore className="text-2xl" style={{ color: '#478c0b' }} />
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +2 this month
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: '#478c0b' }}>
                  {vendorStats.totalVendors}
                </h3>
                <p className="text-sm text-gray-600">Active Vendors</p>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                    <FaBox className="text-2xl" style={{ color: '#f6af0d' }} />
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    {vendorStats.activeProducts} active
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: '#f6af0d' }}>
                  {vendorStats.totalProducts}
                </h3>
                <p className="text-sm text-gray-600">Total Products</p>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fecaca' }}>
                    <FaChartLine className="text-2xl" style={{ color: '#c23c09' }} />
                  </div>
                  <span className="text-xs text-green-600">
                    <i className="fas fa-arrow-up mr-1"></i>
                    12%
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: '#c23c09' }}>
                  ₪{vendorStats.monthlyRevenue.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-purple-100">
                    <FaQrcode className="text-2xl text-purple-600" />
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Today: 48
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1 text-purple-600">
                  {vendorStats.qrScans}
                </h3>
                <p className="text-sm text-gray-600">QR Code Scans</p>
              </motion.div>
            </div>

            {/* Vendor Grid with Enhanced Design */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                  Vendor Management
                </h2>
                <Link 
                  href="/admin/vendors/new"
                  className="px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Vendor
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(vendorStores).map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    className="border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => window.location.href = `/admin/vendor/${vendor.id}`}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={vendor.branding.logo}
                        alt={vendor.name || "Image"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 flex gap-2">
                        {vendor.categories.slice(0, 2).map((cat, i) => (
                          <span key={i} className="text-xs bg-white/90 px-2 py-1 rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2" style={{ color: '#3a3a1d' }}>
                        {vendor.name}
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                            {vendor.productCount}
                          </p>
                          <p className="text-xs text-gray-600">Products</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                            {vendor.analytics.averageRating.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-600">Rating</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                            {vendor.analytics.totalSales}
                          </p>
                          <p className="text-xs text-gray-600">Sales</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                        <button className="flex-1 px-3 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#478c0b' }}>
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/revenue-feed" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-chart-line text-3xl" style={{ color: '#478c0b' }}></i>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:translate-x-2 transition-transform"></i>
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>Revenue Feed</h3>
                <p className="text-sm text-gray-600">View live sales data</p>
              </Link>

              <Link href="/admin/products" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-box text-3xl" style={{ color: '#f6af0d' }}></i>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:translate-x-2 transition-transform"></i>
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>Product Catalog</h3>
                <p className="text-sm text-gray-600">Manage all products</p>
              </Link>

              <Link href="/admin/orders" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-shopping-cart text-3xl" style={{ color: '#c23c09' }}></i>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:translate-x-2 transition-transform"></i>
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>Orders</h3>
                <p className="text-sm text-gray-600">Process orders</p>
              </Link>

              <Link href="/admin/analytics" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <i className="fas fa-chart-pie text-3xl text-purple-600"></i>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:translate-x-2 transition-transform"></i>
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>Analytics</h3>
                <p className="text-sm text-gray-600">View insights</p>
              </Link>
            </div>
          </>
        ) : (
          /* QR Tracking Tab */
          <QRTrackingDashboard />
        )}
      </div>
    </div>
  );
}