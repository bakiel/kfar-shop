'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
// Layout is now handled by admin/layout.tsx
import { FaStore, FaBox, FaShoppingCart, FaChartLine, FaUsers, FaLeaf, FaStar, FaClock } from 'react-icons/fa';
import { vendorStores, getAllProducts } from '@/lib/data/wordpress-style-data-layer';
import { vendorDataService } from '@/lib/services/vendor-data-service';
import '@/styles/kfar-style-system.css';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    totalProducts: 0,
    activeProducts: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0
  });
  const [vendorAnalytics, setVendorAnalytics] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch real vendor data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get all vendors and products
        const vendors = Object.values(vendorStores);
        const allProducts = getAllProducts();
        const activeProducts = allProducts.filter(p => p.status === 'published' && p.inStock);
        
        // Calculate stats
        const stats = {
          totalVendors: vendors.length,
          totalProducts: allProducts.length,
          activeProducts: activeProducts.length,
          todayRevenue: Math.floor(Math.random() * 5000) + 2000, // Simulated for now
          monthlyRevenue: Math.floor(Math.random() * 150000) + 50000, // Simulated for now
          totalOrders: Math.floor(Math.random() * 500) + 200 // Simulated for now
        };
        
        setVendorStats(stats);
        
        // Get analytics for each vendor
        const analyticsPromises = vendors.map(vendor => 
          vendorDataService.getVendorAnalytics(vendor.id)
        );
        const analytics = await Promise.all(analyticsPromises);
        setVendorAnalytics(analytics);
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center kfar-bg-cream">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 kfar-border-leaf-green border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 kfar-border-sun-gold border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="kfar-text-gray-600 text-body">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen kfar-bg-cream">
      <div className="container mx-auto px-4 py-8">
          {/* Header with last update */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h1 font-bold kfar-text-soil">Admin Dashboard</h1>
              <p className="text-body kfar-text-gray-600 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm kfar-text-gray-600">Auto-refresh</span>
              <div className="w-2 h-2 rounded-full kfar-bg-mint animate-pulse"></div>
            </div>
          </div>
          
          {/* Stats Cards with real data */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {/* Total Vendors */}
            <motion.div 
              className="card hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg kfar-bg-mint kfar-text-leaf-green flex items-center justify-center transition-transform group-hover:scale-110">
                  <FaStore className="text-xl" />
                </div>
              </div>
              <h3 className="text-h3 font-bold kfar-text-leaf-green mb-1">
                {vendorStats.totalVendors}
              </h3>
              <p className="text-body-sm kfar-text-gray-600">Total Vendors</p>
            </motion.div>
            
            {/* Total Products */}
            <motion.div 
              className="card hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg badge-primary flex items-center justify-center transition-transform group-hover:scale-110">
                  <FaBox className="text-xl text-white" />
                </div>
              </div>
              <h3 className="text-h3 font-bold kfar-text-soil mb-1">
                {vendorStats.totalProducts}
              </h3>
              <p className="text-body-sm kfar-text-gray-600">Total Products</p>
            </motion.div>
            
            {/* Active Products */}
            <motion.div 
              className="card hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg badge-success flex items-center justify-center transition-transform group-hover:scale-110">
                  <FaStar className="text-xl text-white" />
                </div>
              </div>
              <h3 className="text-h3 font-bold text-green-600 mb-1">
                {vendorStats.activeProducts}
              </h3>
              <p className="text-body-sm kfar-text-gray-600">Active Products</p>
            </motion.div>
            
            {/* Today's Revenue */}
            <motion.div 
              className="card hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg badge-warning flex items-center justify-center transition-transform group-hover:scale-110">
                  <FaClock className="text-xl" />
                </div>
              </div>
              <h3 className="text-h3 font-bold kfar-text-sun-gold mb-1">
                ₪{vendorStats.todayRevenue.toLocaleString()}
              </h3>
              <p className="text-body-sm kfar-text-gray-600">Today's Revenue</p>
            </motion.div>
            
            {/* Monthly Revenue */}
            <motion.div 
              className="card hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg badge-error flex items-center justify-center transition-transform group-hover:scale-110">
                  <FaChartLine className="text-xl text-white" />
                </div>
              </div>
              <h3 className="text-h3 font-bold kfar-text-earth-flame mb-1">
                ₪{vendorStats.monthlyRevenue.toLocaleString()}
              </h3>
              <p className="text-body-sm kfar-text-gray-600">Monthly Revenue</p>
            </motion.div>
            
            {/* Total Orders */}
            <motion.div 
              className="card hover:shadow-xl transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg kfar-bg-gray-100 kfar-text-soil flex items-center justify-center transition-transform group-hover:scale-110">
                  <FaShoppingCart className="text-xl" />
                </div>
              </div>
              <h3 className="text-h3 font-bold kfar-text-soil mb-1">
                {vendorStats.totalOrders}
              </h3>
              <p className="text-body-sm kfar-text-gray-600">Total Orders</p>
            </motion.div>
          </div>

          {/* Vendor Logos Grid */}
          <div className="mb-8">
            <h2 className="text-h3 font-bold kfar-text-soil mb-4">Active Vendors</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.values(vendorStores).map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  className="card p-4 hover:shadow-xl transition-all cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => window.location.href = `/admin/vendors/${vendor.id}`}
                >
                  <div className="relative mb-3 overflow-hidden rounded-lg">
                    <Image
                      src={vendor.branding.logo}
                      alt={vendor.name || "Image"}
                      width={120}
                      height={120}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/vendors/default_logo.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="text-body font-semibold kfar-text-soil text-center truncate">
                    {vendor.name}
                  </h3>
                  <p className="text-body-sm kfar-text-gray-600 text-center">
                    {vendor.productCount} products
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star text-xs ${
                          i < Math.floor(vendor.analytics.averageRating || 0) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}></i>
                      ))}
                    </div>
                    <span className="text-xs kfar-text-gray-600 ml-1">
                      ({vendor.analytics.reviewCount})
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links with enhanced styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/admin/revenue-feed" className="card hover:shadow-xl transition-all group block">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full kfar-bg-mint kfar-text-leaf-green flex items-center justify-center transition-transform group-hover:scale-110">
                    <i className="fas fa-chart-line text-2xl"></i>
                  </div>
                  <h3 className="text-h5 font-semibold kfar-text-soil mb-1">Revenue Feed</h3>
                  <p className="text-body-sm kfar-text-gray-600">View live sales</p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link href="/admin/vendors" className="card hover:shadow-xl transition-all group block">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full badge-primary flex items-center justify-center transition-transform group-hover:scale-110">
                    <i className="fas fa-store text-2xl text-white"></i>
                  </div>
                  <h3 className="text-h5 font-semibold kfar-text-soil mb-1">Vendor Management</h3>
                  <p className="text-body-sm kfar-text-gray-600">Manage all vendors</p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link href="/admin/products" className="card hover:shadow-xl transition-all group block">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full badge-warning flex items-center justify-center transition-transform group-hover:scale-110">
                    <i className="fas fa-box text-2xl"></i>
                  </div>
                  <h3 className="text-h5 font-semibold kfar-text-soil mb-1">All Products</h3>
                  <p className="text-body-sm kfar-text-gray-600">View inventory</p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Link href="/admin/analytics" className="card hover:shadow-xl transition-all group block">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full badge-error flex items-center justify-center transition-transform group-hover:scale-110">
                    <i className="fas fa-chart-pie text-2xl text-white"></i>
                  </div>
                  <h3 className="text-h5 font-semibold kfar-text-soil mb-1">Analytics</h3>
                  <p className="text-body-sm kfar-text-gray-600">View insights</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Vendor Analytics Overview */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Performing Vendors */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <h3 className="text-h4 font-bold kfar-text-soil mb-6">Top Performing Vendors</h3>
              <div className="space-y-4">
                {vendorAnalytics
                  .sort((a, b) => b.totalSales - a.totalSales)
                  .slice(0, 3)
                  .map((vendor, index) => {
                    const vendorInfo = vendorStores[vendor.vendorId];
                    return (
                      <div key={vendor.vendorId} className="flex items-center justify-between p-4 rounded-lg hover:kfar-bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            index === 0 ? 'badge-warning' : 'badge-success'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold kfar-text-soil">{vendorInfo.name}</p>
                            <p className="text-body-sm kfar-text-gray-600">
                              {vendor.activeProducts} active products
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold kfar-text-leaf-green">
                            {vendor.totalSales} sales
                          </p>
                          <p className="text-body-sm kfar-text-gray-600">
                            ⭐ {vendorInfo.analytics.averageRating}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>

            {/* Recent Activity Feed */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <h3 className="text-h4 font-bold kfar-text-soil mb-6">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg kfar-bg-gray-50">
                  <div className="w-8 h-8 rounded-full badge-success flex items-center justify-center">
                    <i className="fas fa-check text-xs text-white"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-body kfar-text-soil">
                      New product added by <strong>Teva Deli</strong>
                    </p>
                    <p className="text-body-sm kfar-text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg kfar-bg-gray-50">
                  <div className="w-8 h-8 rounded-full badge-warning flex items-center justify-center">
                    <i className="fas fa-star text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-body kfar-text-soil">
                      New 5-star review for <strong>Garden of Light</strong>
                    </p>
                    <p className="text-body-sm kfar-text-gray-600">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg kfar-bg-gray-50">
                  <div className="w-8 h-8 rounded-full badge-primary flex items-center justify-center">
                    <i className="fas fa-shopping-cart text-xs text-white"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-body kfar-text-soil">
                      Order #1234 placed at <strong>Queen's Cuisine</strong>
                    </p>
                    <p className="text-body-sm kfar-text-gray-600">30 minutes ago</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
}