'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaStore, FaBox, FaShoppingCart, FaChartLine, FaUsers, 
  FaLeaf, FaStar, FaClock, FaEye, FaEdit, FaDollarSign,
  FaCheckCircle, FaExclamationCircle, FaSyncAlt
} from 'react-icons/fa';
import { vendorStores, getAllProducts } from '@/lib/data/wordpress-style-data-layer';
import { vendorDataService } from '@/lib/services/vendor-data-service';

// Get vendor logo helper
const getVendorLogo = (vendorId: string) => {
  const logoMap: { [key: string]: string } = {
    'teva-deli': '/images/vendors/teva_deli_logo_vegan_factory.jpg',
    'garden-of-light': '/images/vendors/Garden of Light Logo.jpg',
    'queens-cuisine': '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
    'gahn-delight': '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
    'people-store': '/images/vendors/people_store_logo_community_retail.jpg',
    'vop-shop': '/images/vendors/vop_shop_logo_village_marketplace.jpg'
  };
  return logoMap[vendorId] || '/images/vendors/default-vendor.jpg';
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [vendorAnalytics, setVendorAnalytics] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all vendors and products
      const vendors = Object.values(vendorStores);
      const allProducts = getAllProducts();
      const activeProducts = allProducts.filter(p => p.inStock);
      const outOfStock = allProducts.filter(p => !p.inStock);
      
      // Calculate stats
      const stats = {
        totalVendors: vendors.length,
        totalProducts: allProducts.length,
        activeProducts: activeProducts.length,
        outOfStock: outOfStock.length,
        todayRevenue: Math.floor(Math.random() * 5000) + 2000,
        monthlyRevenue: Math.floor(Math.random() * 150000) + 50000,
        totalOrders: Math.floor(Math.random() * 500) + 200,
        pendingOrders: Math.floor(Math.random() * 20) + 5
      };
      
      setVendorStats(stats);
      
      // Get analytics for each vendor
      const analyticsPromises = vendors.map(async vendor => {
        const analytics = await vendorDataService.getVendorAnalytics(vendor.id);
        return {
          ...analytics,
          vendor: vendor,
          revenue: Math.floor(Math.random() * 30000) + 5000,
          growth: Math.floor(Math.random() * 40) - 10
        };
      });
      
      const analytics = await Promise.all(analyticsPromises);
      setVendorAnalytics(analytics);
      
      // Generate recent activity
      const activities = [
        { type: 'order', message: 'New order #1234 from Garden of Light', time: '2 minutes ago', icon: FaShoppingCart, color: '#478c0b' },
        { type: 'product', message: 'Teva Deli updated 3 products', time: '15 minutes ago', icon: FaBox, color: '#f6af0d' },
        { type: 'review', message: 'New 5-star review for Gahn Delight', time: '1 hour ago', icon: FaStar, color: '#c23c09' },
        { type: 'vendor', message: 'Queens Cuisine inventory update', time: '2 hours ago', icon: FaStore, color: '#478c0b' }
      ];
      setRecentActivity(activities);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && vendorStats.totalVendors === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fef9ef' }}>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#478c0b' }}></div>
            <div className="absolute inset-2 border-4 border-b-transparent rounded-full animate-spin" style={{ borderColor: '#f6af0d', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all hover:scale-105"
              style={{ backgroundColor: '#478c0b' }}
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Auto-refresh</span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#478c0b' }}></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#cfe7c1' }}>
                <FaStore className="text-2xl" style={{ color: '#478c0b' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#478c0b' }}>+12%</span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>{vendorStats.totalVendors}</h3>
            <p className="text-gray-600">Active Vendors</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(246, 175, 13, 0.2)' }}>
                <FaBox className="text-2xl" style={{ color: '#f6af0d' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#f6af0d' }}>
                {vendorStats.outOfStock > 0 && `${vendorStats.outOfStock} out`}
              </span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>{vendorStats.totalProducts}</h3>
            <p className="text-gray-600">Total Products</p>
            <div className="mt-2 text-sm">
              <span style={{ color: '#478c0b' }}>{vendorStats.activeProducts} in stock</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(194, 60, 9, 0.2)' }}>
                <FaShoppingCart className="text-2xl" style={{ color: '#c23c09' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#c23c09' }}>
                {vendorStats.pendingOrders} pending
              </span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>{vendorStats.totalOrders}</h3>
            <p className="text-gray-600">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#cfe7c1' }}>
                <FaDollarSign className="text-2xl" style={{ color: '#478c0b' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#478c0b' }}>+23%</span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>₪{vendorStats.monthlyRevenue.toLocaleString()}</h3>
            <p className="text-gray-600">Monthly Revenue</p>
            <div className="mt-2 text-sm text-gray-500">
              Today: ₪{vendorStats.todayRevenue.toLocaleString()}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendor Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>Vendor Performance</h2>
                <Link href="/admin/vendors" className="text-sm hover:underline" style={{ color: '#478c0b' }}>
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {vendorAnalytics.map((analytics, index) => (
                  <motion.div
                    key={analytics.vendorId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={getVendorLogo(analytics.vendorId)}
                          alt={analytics.vendor.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold" style={{ color: '#3a3a1d' }}>
                            {analytics.vendor.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{analytics.totalProducts} products</span>
                            <span className="flex items-center gap-1">
                              <FaStar style={{ color: '#f6af0d' }} />
                              {analytics.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#3a3a1d' }}>
                          ₪{analytics.revenue.toLocaleString()}
                        </p>
                        <p className={`text-sm flex items-center gap-1 ${analytics.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics.growth > 0 ? '↑' : '↓'} {Math.abs(analytics.growth)}%
                        </p>
                      </div>
                      
                      <Link
                        href={`/admin/vendor/${analytics.vendorId}`}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <FaEdit className="text-gray-600" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Recent Activity</h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${activity.color}20` }}
                    >
                      <Icon style={{ color: activity.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: '#3a3a1d' }}>{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Link 
              href="/admin/activity"
              className="block text-center mt-6 text-sm hover:underline"
              style={{ color: '#478c0b' }}
            >
              View All Activity →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/vendors/new"
            className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#cfe7c1' }}>
              <FaStore style={{ color: '#478c0b' }} />
            </div>
            <p className="font-semibold" style={{ color: '#3a3a1d' }}>Add Vendor</p>
          </Link>

          <Link
            href="/admin/products/new"
            className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(246, 175, 13, 0.2)' }}>
              <FaBox style={{ color: '#f6af0d' }} />
            </div>
            <p className="font-semibold" style={{ color: '#3a3a1d' }}>Add Product</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(194, 60, 9, 0.2)' }}>
              <FaShoppingCart style={{ color: '#c23c09' }} />
            </div>
            <p className="font-semibold" style={{ color: '#3a3a1d' }}>View Orders</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#cfe7c1' }}>
              <FaChartLine style={{ color: '#478c0b' }} />
            </div>
            <p className="font-semibold" style={{ color: '#3a3a1d' }}>Analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}