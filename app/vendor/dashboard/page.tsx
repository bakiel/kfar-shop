'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, Package, QrCode, BarChart3, Settings, Users, 
  Calendar, Download, TrendingUp, ShoppingBag, Star,
  MessageSquare, FileText, Camera, Plus
} from 'lucide-react';

// Sample analytics data
const SAMPLE_ANALYTICS = {
  views: 342,
  viewsTrend: 12,
  orders: 28,
  ordersTrend: 8,
  revenue: 4250,
  revenueTrend: 15,
  products: 12,
  reviews: 4.8,
  reviewCount: 23
};

export default function VendorDashboard() {
  const searchParams = useSearchParams();
  const [vendorId, setVendorId] = useState('demo-vendor');
  const [vendorName, setVendorName] = useState('Sample Organic Store');
  const [isNewVendor, setIsNewVendor] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get vendor ID from URL params or use demo
    const id = searchParams.get('vendorId') || 'demo-vendor';
    const name = searchParams.get('storeName') || 'Sample Organic Store';
    const newVendor = searchParams.get('newVendor') === 'true';
    
    setVendorId(id);
    setVendorName(decodeURIComponent(name));
    setIsNewVendor(newVendor);
    setShowWelcome(newVendor);
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-leaf-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Store Page',
      description: 'View and edit your public store page',
      icon: Store,
      link: `/store/${vendorId}`,
      color: 'leaf-green',
      badge: 'Live'
    },
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      link: `/vendor/products?vendorId=${vendorId}`,
      color: 'sun-gold',
      badge: `${SAMPLE_ANALYTICS.products} items`
    },
    {
      title: 'QR Marketing',
      description: 'Generate QR codes for marketing',
      icon: QrCode,
      link: `/vendor/qr-codes?vendorId=${vendorId}`,
      color: 'earth-flame',
      badge: 'New!'
    },
    {
      title: 'Analytics',
      description: 'Track store performance',
      icon: BarChart3,
      link: `/vendor/analytics?vendorId=${vendorId}`,
      color: 'soil-brown',
      badge: 'Coming Soon'
    }
  ];

  const quickStats = [
    {
      label: 'Store Views',
      value: SAMPLE_ANALYTICS.views.toLocaleString(),
      trend: `+${SAMPLE_ANALYTICS.viewsTrend}%`,
      icon: Users,
      trendUp: true
    },
    {
      label: 'Orders',
      value: SAMPLE_ANALYTICS.orders.toLocaleString(),
      trend: `+${SAMPLE_ANALYTICS.ordersTrend}%`,
      icon: ShoppingBag,
      trendUp: true
    },
    {
      label: 'Revenue',
      value: `₪${SAMPLE_ANALYTICS.revenue.toLocaleString()}`,
      trend: `+${SAMPLE_ANALYTICS.revenueTrend}%`,
      icon: TrendingUp,
      trendUp: true
    },
    {
      label: 'Rating',
      value: SAMPLE_ANALYTICS.reviews.toFixed(1),
      trend: `${SAMPLE_ANALYTICS.reviewCount} reviews`,
      icon: Star,
      trendUp: true
    }
  ];

  const recentActivities = [
    { type: 'order', message: 'New order #1234 received', time: '2 hours ago', icon: ShoppingBag },
    { type: 'review', message: 'New 5-star review from Sarah', time: '5 hours ago', icon: Star },
    { type: 'product', message: 'Product "Organic Hummus" updated', time: '1 day ago', icon: Package },
    { type: 'qr', message: 'QR code scanned 5 times today', time: '1 day ago', icon: QrCode }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/logos/kfar_logo_primary_horizontal.png"
                alt="KFAR Marketplace"
                className="h-8"
              />
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Vendor Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/vendor/settings"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-leaf-green flex items-center justify-center text-white font-semibold">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendorName}</p>
                  <p className="text-xs text-gray-500">Vendor ID: {vendorId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-leaf-green to-leaf-green-dark text-white">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {vendorName}!</h2>
          <p className="text-white/80">Here's an overview of your store performance</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* New Vendor Welcome Message */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-leaf-green to-sun-gold text-white rounded-xl shadow-xl p-6 mb-8 relative overflow-hidden">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                Welcome to KFAR Marketplace!
              </h3>
              <p className="text-lg mb-4 text-white/90">
                Your store is now live! Here's what you should do next:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <QrCode className="w-6 h-6" />
                    <span className="font-semibold">Generate QR Codes</span>
                  </div>
                  <p className="text-sm text-white/80">
                    Create marketing materials to promote your store
                  </p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6" />
                    <span className="font-semibold">Add Products</span>
                  </div>
                  <p className="text-sm text-white/80">
                    Expand your catalog with more offerings
                  </p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Store className="w-6 h-6" />
                    <span className="font-semibold">View Your Store</span>
                  </div>
                  <p className="text-sm text-white/80">
                    See how customers view your store page
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/vendor/qr-codes?vendorId=${vendorId}`}
                  className="px-6 py-3 bg-white text-leaf-green rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  Generate Your First QR Code
                </Link>
                <Link
                  href={`/store/${vendorId}`}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Store className="w-5 h-5" />
                  View Store Page
                </Link>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            const colorMap = {
              'leaf-green': '#478c0b',
              'sun-gold': '#f6af0d',
              'earth-flame': '#c23c09',
              'soil-brown': '#3a3a1d'
            };
            
            return (
              <Link
                key={index}
                href={card.link}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${colorMap[card.color]}20` }}
                    >
                      <Icon 
                        className="w-8 h-8" 
                        style={{ color: colorMap[card.color] }}
                      />
                    </div>
                    {card.badge && (
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${colorMap[card.color]}20`,
                          color: colorMap[card.color]
                        }}
                      >
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {card.description}
                  </p>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ backgroundColor: colorMap[card.color] }}
                />
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/vendor/activity"
              className="block text-center text-sm text-leaf-green hover:text-leaf-green-dark font-medium mt-4"
            >
              View all activity →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/vendor/products/add?vendorId=${vendorId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-leaf-green hover:bg-leaf-green/5 transition-all"
              >
                <Plus className="w-5 h-5 text-leaf-green" />
                <span className="text-sm font-medium">Add New Product</span>
              </Link>
              
              <Link
                href={`/vendor/qr-codes?vendorId=${vendorId}&type=special-offer`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-sun-gold hover:bg-sun-gold/5 transition-all"
              >
                <QrCode className="w-5 h-5 text-sun-gold" />
                <span className="text-sm font-medium">Create Special Offer</span>
              </Link>
              
              <Link
                href={`/vendor/photos?vendorId=${vendorId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-earth-flame hover:bg-earth-flame/5 transition-all"
              >
                <Camera className="w-5 h-5 text-earth-flame" />
                <span className="text-sm font-medium">Upload Photos</span>
              </Link>
              
              <Link
                href={`/vendor/reports?vendorId=${vendorId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-soil-brown hover:bg-soil-brown/5 transition-all"
              >
                <FileText className="w-5 h-5 text-soil-brown" />
                <span className="text-sm font-medium">Download Reports</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Marketing Tip */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            💡 Marketing Tip of the Day
          </h3>
          <p className="text-blue-700 mb-3">
            Did you know that QR codes can increase customer engagement by up to 40%? 
            Create custom QR codes for your products and special offers to drive more traffic to your store.
          </p>
          <Link
            href={`/vendor/qr-codes?vendorId=${vendorId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create QR Codes Now →
          </Link>
        </div>
      </div>
    </div>
  );
}