'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import PersonalizedShopping from '@/components/customer/PersonalizedShopping';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ShoppingCart, QrCode, Heart, Settings, ShoppingBag, Star, Trophy, Percent, Gift, Zap, Leaf, MapPin, Recycle, Store, Package, Coins } from 'lucide-react';

export default function EnhancedCustomerDashboard() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'rewards' | 'preferences' | 'insights'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    savedWithDiscounts: 0,
    favoriteVendor: '',
    lastOrderDate: null as Date | null
  });

  const loadCustomerData = useCallback(async (token: string) => {
    try {
      // Load profile, stats, rewards, and orders in parallel
      const [profileRes, statsRes, rewardsRes, ordersRes] = await Promise.all([
        fetch('/api/customer/profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/customer/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/customer/rewards', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/customer/orders?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Profile
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.customer) {
          const c = profileData.customer;
          setCustomer({
            id: c.id,
            name: c.name || user?.displayName || '',
            email: c.email || user?.email || '',
            avatar: c.avatar || '',
            joinedDate: c.createdAt || new Date().toISOString(),
            loyaltyTier: c.loyaltyTier || 'bronze',
            points: c.points || 0,
            lifetimePoints: c.points || 0, // Will be overridden by rewards data
            preferences: {
              dietaryRestrictions: c.preferences?.dietary || c.preferences?.dietaryRestrictions || [],
              favoriteCategories: c.preferences?.favoriteCategories || [],
              shoppingFrequency: c.preferences?.shoppingFrequency || 'weekly',
              preferredVendors: c.preferences?.preferredVendors || [],
            },
            address: c.addresses?.[0] || {},
          });
        }
      }

      // If profile failed, set customer from auth context
      if (!profileRes.ok && user) {
        setCustomer({
          id: user.customerId || user.id,
          name: user.displayName || '',
          email: user.email || '',
          avatar: '',
          joinedDate: new Date().toISOString(),
          loyaltyTier: 'bronze',
          points: 0,
          lifetimePoints: 0,
          preferences: {
            dietaryRestrictions: [],
            favoriteCategories: [],
            shoppingFrequency: 'weekly',
            preferredVendors: [],
          },
          address: {},
        });
      }

      // Stats
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalOrders: statsData.totalOrders || 0,
          totalSpent: statsData.totalSpent || 0,
          savedWithDiscounts: statsData.savedWithDiscounts || 0,
          favoriteVendor: statsData.favoriteVendor || '',
          lastOrderDate: statsData.lastOrderDate ? new Date(statsData.lastOrderDate) : null,
        });
      }

      // Rewards
      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        if (rewardsData.success && rewardsData.rewards) {
          setRewards(rewardsData.rewards);
          // Update customer points from rewards
          setCustomer((prev: any) => prev ? {
            ...prev,
            loyaltyTier: rewardsData.rewards.tier || prev.loyaltyTier,
            points: rewardsData.rewards.balance || prev.points,
            lifetimePoints: rewardsData.rewards.lifetimeEarned || prev.lifetimePoints,
          } : prev);
        }
      }

      // Orders
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      // Minimal customer from auth context
      if (user) {
        setCustomer({
          id: user.customerId || user.id,
          name: user.displayName || '',
          email: user.email || '',
          avatar: '',
          joinedDate: new Date().toISOString(),
          loyaltyTier: 'bronze',
          points: 0,
          lifetimePoints: 0,
          preferences: {
            dietaryRestrictions: [],
            favoriteCategories: [],
            shoppingFrequency: 'weekly',
            preferredVendors: [],
          },
          address: {},
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      // Try legacy token
      const legacyToken = localStorage.getItem('customerToken');
      if (legacyToken) {
        loadCustomerData(legacyToken);
        return;
      }
      router.push('/customer/login');
      return;
    }

    if (accessToken) {
      loadCustomerData(accessToken);
    }
  }, [authLoading, isAuthenticated, accessToken, loadCustomerData, router]);

  const getLoyaltyProgress = () => {
    const tiers: Record<string, { min: number; max: number; next: string | null }> = {
      bronze: { min: 0, max: 499, next: 'Silver' },
      silver: { min: 500, max: 1999, next: 'Gold' },
      gold: { min: 2000, max: 4999, next: 'Platinum' },
      platinum: { min: 5000, max: Infinity, next: null }
    };

    const currentTier = tiers[customer?.loyaltyTier || 'bronze'];
    const progress = customer?.points ?
      ((customer.points - currentTier.min) / (currentTier.max - currentTier.min + 1)) * 100 : 0;

    return {
      progress: Math.min(progress, 100),
      pointsToNext: currentTier.next ? Math.max(0, currentTier.max + 1 - (customer?.points || 0)) : 0,
      nextTier: currentTier.next
    };
  };

  const quickActionIcons: Record<string, React.ReactNode> = {
    'shopping-cart': <ShoppingCart className="w-6 h-6 stroke-[1.5]" />,
    'qrcode': <QrCode className="w-6 h-6 stroke-[1.5]" />,
    'heart': <Heart className="w-6 h-6 stroke-[1.5]" />,
    'settings': <Settings className="w-6 h-6 stroke-[1.5]" />,
  };

  const quickActions = [
    { icon: 'shopping-cart', label: 'Browse Products', href: '/shop', color: 'green' },
    { icon: 'qrcode', label: 'Show QR Code', action: 'showQR', color: 'blue' },
    { icon: 'heart', label: 'Saved Items', href: '/customer/saved', color: 'red' },
    { icon: 'settings', label: 'Settings', href: '/customer/settings', color: 'gray' }
  ];

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to view your dashboard</p>
            <Link href="/customer/login" className="text-green-600 hover:text-green-700 font-semibold">
              Log In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Build QR profile shape for CustomerQRCode component
  const qrProfile = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: '',
    memberSince: customer.joinedDate ? new Date(customer.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
    loyaltyTier: customer.loyaltyTier || 'bronze',
    points: customer.points || 0,
    preferences: {
      dietary: customer.preferences?.dietaryRestrictions || [],
      allergies: [],
      favoriteCategories: customer.preferences?.favoriteCategories || [],
    },
    stats: {
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      savedByDiscounts: stats.savedWithDiscounts,
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                    <span className="text-3xl text-white font-bold">
                      {customer.name ? customer.name.charAt(0) : '?'}
                    </span>
                  </div>
                </div>
                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  customer.loyaltyTier === 'platinum' ? 'bg-purple-600' :
                  customer.loyaltyTier === 'gold' ? 'bg-yellow-500' :
                  customer.loyaltyTier === 'silver' ? 'bg-gray-400' :
                  'bg-orange-500'
                } text-white capitalize`}>
                  {customer.loyaltyTier}
                </div>
              </div>

              {/* Welcome Message */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {customer.name || 'Member'}!
                </h1>
                <p className="opacity-90">
                  {customer.joinedDate
                    ? `Member since ${new Date(customer.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                    : 'Welcome to KFAR Marketplace'
                  }
                </p>

                {/* Loyalty Progress */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{customer.points || 0} points</span>
                    {getLoyaltyProgress().nextTier && (
                      <span>{getLoyaltyProgress().pointsToNext} to {getLoyaltyProgress().nextTier}</span>
                    )}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${getLoyaltyProgress().progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <div className="text-sm opacity-75">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.savedWithDiscounts > 0 ? `\u20AA${stats.savedWithDiscounts}` : '\u20AA0'}
                  </div>
                  <div className="text-sm opacity-75">Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.href ? (
                    <Link
                      href={action.href}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors cursor-pointer`}
                    >
                      <span className={`text-${action.color}-600`}>{quickActionIcons[action.icon]}</span>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (action.action === 'showQR') {
                          setActiveTab('overview');
                        }
                      }}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors cursor-pointer w-full`}
                    >
                      <span className={`text-${action.color}-600`}>{quickActionIcons[action.icon]}</span>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="flex overflow-x-auto">
              {(['overview', 'orders', 'rewards', 'preferences', 'insights'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 font-semibold capitalize transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* QR Code Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Your QR Code</h3>
                  <div className="flex justify-center">
                    <CustomerQRCode profile={qrProfile} variant="full" />
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Show this to vendors for quick checkout and to earn points
                  </p>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {orders.length > 0 ? (
                      orders.slice(0, 3).map((order: any, idx: number) => (
                        <div key={order.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ShoppingBag className="w-5 h-5 stroke-[1.5] text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium">
                              Order {order.order_number || order.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''} - {'\u20AA'}{parseFloat(order.total || '0')}
                            </p>
                          </div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 capitalize">
                            {order.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <ShoppingBag className="w-8 h-8 stroke-[1.5] mx-auto mb-2" />
                        <p>No recent orders</p>
                        <Link href="/shop" className="text-sm text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                          Start Shopping
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personalized Shopping */}
                <div className="md:col-span-2">
                  <PersonalizedShopping
                    customerId={customer.id}
                    customerName={customer.name}
                  />
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Order History</h3>
                  </div>

                  {/* Order List */}
                  <div className="space-y-4">
                    {orders.length > 0 ? (
                      orders.map((order: any, idx: number) => (
                        <div key={order.id || idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">Order {order.order_number || `#${String(idx + 1).padStart(6, '0')}`}</p>
                              <p className="text-sm text-gray-600">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{'\u20AA'}{parseFloat(order.total || '0')}</p>
                              <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status || 'pending'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {order.vendor_name && (
                              <span className="inline-flex items-center gap-1"><Store className="w-3.5 h-3.5 stroke-[1.5]" />{order.vendor_name}</span>
                            )}
                            {Array.isArray(order.items) && (
                              <span className="inline-flex items-center gap-1"><Package className="w-3.5 h-3.5 stroke-[1.5]" />{order.items.length} items</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <ShoppingBag className="w-10 h-10 stroke-[1.5] mx-auto mb-3" />
                        <p>No orders yet</p>
                        <Link href="/shop" className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                          Start Shopping
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Points Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Points Summary</h3>

                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {customer.points || 0}
                      </div>
                      <p className="text-gray-600">Available Points</p>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lifetime Points</span>
                        <span className="font-medium">{customer.lifetimePoints || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Points Redeemed</span>
                        <span className="font-medium">
                          {rewards ? rewards.lifetimeRedeemed || 0 : (customer.lifetimePoints || 0) - (customer.points || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Tier</span>
                        <span className={`font-medium capitalize ${
                          customer.loyaltyTier === 'gold' ? 'text-yellow-600' :
                          customer.loyaltyTier === 'platinum' ? 'text-purple-600' :
                          customer.loyaltyTier === 'silver' ? 'text-gray-500' : ''
                        }`}>
                          {customer.loyaltyTier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Rewards */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Available Rewards</h3>

                  <div className="space-y-3">
                    <div className={`p-4 border rounded-lg transition-colors ${(customer.points || 0) >= 500 ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{'\u20AA'}10 Off Next Order</h4>
                        <span className="text-green-600 font-semibold">500 pts</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(customer.points || 0) >= 500 ? 'Valid on orders over \u20AA50' : 'Not enough points'}
                      </p>
                      {(customer.points || 0) >= 500 && (
                        <button className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                          Redeem
                        </button>
                      )}
                    </div>

                    <div className={`p-4 border rounded-lg transition-colors ${(customer.points || 0) >= 300 ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Free Delivery</h4>
                        <span className="text-green-600 font-semibold">300 pts</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(customer.points || 0) >= 300 ? 'One-time free delivery' : 'Not enough points'}
                      </p>
                      {(customer.points || 0) >= 300 && (
                        <button className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                          Redeem
                        </button>
                      )}
                    </div>

                    <div className={`p-4 border rounded-lg ${(customer.points || 0) >= 1000 ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">20% Off Entire Order</h4>
                        <span className={`font-semibold ${(customer.points || 0) >= 1000 ? 'text-green-600' : 'text-gray-600'}`}>1000 pts</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(customer.points || 0) >= 1000 ? 'Maximum \u20AA50 discount' : 'Not enough points'}
                      </p>
                      {(customer.points || 0) >= 1000 && (
                        <button className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                          Redeem
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tier Benefits */}
                <div className="md:col-span-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Your {customer.loyaltyTier ? customer.loyaltyTier.charAt(0).toUpperCase() + customer.loyaltyTier.slice(1) : 'Bronze'} Tier Benefits</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Percent className="w-5 h-5 stroke-[1.5] text-yellow-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">
                          {customer.loyaltyTier === 'platinum' ? '20%' :
                           customer.loyaltyTier === 'gold' ? '15%' :
                           customer.loyaltyTier === 'silver' ? '10%' : '5%'} Discount
                        </h4>
                        <p className="text-sm text-gray-600">On all orders</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Gift className="w-5 h-5 stroke-[1.5] text-yellow-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Earn Points</h4>
                        <p className="text-sm text-gray-600">1 point per shekel</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 stroke-[1.5] text-yellow-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">
                          {customer.loyaltyTier === 'gold' || customer.loyaltyTier === 'platinum' ? 'Early Access' : 'Member Perks'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {customer.loyaltyTier === 'gold' || customer.loyaltyTier === 'platinum' ? 'New products & sales' : 'Exclusive deals'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-6">Your Preferences</h3>

                  <div className="space-y-6">
                    {/* Dietary Restrictions */}
                    <div>
                      <h4 className="font-medium mb-3">Dietary Restrictions</h4>
                      <div className="flex flex-wrap gap-2">
                        {customer.preferences?.dietaryRestrictions?.length > 0 ? (
                          customer.preferences.dietaryRestrictions.map((diet: string) => (
                            <span key={diet} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {diet}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No dietary restrictions set</span>
                        )}
                        <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-600 hover:border-gray-400">
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Favorite Categories */}
                    <div>
                      <h4 className="font-medium mb-3">Favorite Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {customer.preferences?.favoriteCategories?.length > 0 ? (
                          customer.preferences.favoriteCategories.map((cat: string) => (
                            <span key={cat} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {cat.replace(/-/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No favorite categories set</span>
                        )}
                      </div>
                    </div>

                    {/* Shopping Frequency */}
                    <div>
                      <h4 className="font-medium mb-3">Shopping Frequency</h4>
                      <select className="px-4 py-2 border rounded-lg" defaultValue={customer.preferences?.shoppingFrequency || 'weekly'}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Communication Preferences */}
                    <div>
                      <h4 className="font-medium mb-3">Communication</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Email notifications for orders</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600" />
                          <span className="text-sm">SMS alerts for deliveries</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Weekly newsletter</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Shopping Patterns */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Shopping Patterns</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-semibold">
                        {stats.totalOrders > 0 ? `\u20AA${Math.round(stats.totalSpent / stats.totalOrders)}` : '\u20AA0'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-semibold">{'\u20AA'}{stats.totalSpent}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Favorite Vendor</span>
                      <span className="font-semibold">{stats.favoriteVendor || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-semibold">{stats.totalOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Impact */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Impact</h3>

                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {stats.totalOrders} Orders
                    </div>
                    <p className="text-gray-600">Supporting local vendors</p>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3">
                      <Leaf className="w-5 h-5 stroke-[1.5] text-green-600" />
                      <span className="text-sm">100% plant-based marketplace</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 stroke-[1.5] text-green-600" />
                      <span className="text-sm">Supporting local community vendors</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Recycle className="w-5 h-5 stroke-[1.5] text-green-600" />
                      <span className="text-sm">Eco-friendly shopping</span>
                    </div>
                  </div>
                </div>

                {/* Savings Summary */}
                <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Total Savings</h3>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {'\u20AA'}{stats.savedWithDiscounts}
                      </div>
                      <p className="text-sm text-gray-600">From Discounts</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {'\u20AA'}{rewards ? rewards.lifetimeRedeemed || 0 : 0}
                      </div>
                      <p className="text-sm text-gray-600">Points Redeemed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {'\u20AA'}{stats.savedWithDiscounts + (rewards ? rewards.lifetimeRedeemed || 0 : 0)}
                      </div>
                      <p className="text-sm text-gray-600">Total Saved</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
