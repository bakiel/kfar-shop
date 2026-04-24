'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Smartphone, Wallet, TrendingUp, CheckCircle, Truck, Headphones, Gift, Star, Check, QrCode, Store, CalendarCheck, Users, ShieldCheck } from 'lucide-react';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/context/AuthContext';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: string;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  preferences: {
    dietary: string[];
    allergies: string[];
    favoriteCategories: string[];
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    savedByDiscounts: number;
  };
}

export default function CustomerQRPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'benefits' | 'how'>('qr');
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, accessToken } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!accessToken) {
        // Try legacy token
        const legacyToken = localStorage.getItem('customerToken');
        if (!legacyToken) {
          setLoading(false);
          return;
        }
        await fetchProfile(legacyToken);
        return;
      }
      await fetchProfile(accessToken);
    };

    loadProfile();
  }, [accessToken]);

  const fetchProfile = async (token: string) => {
    try {
      const [profileRes, statsRes, rewardsRes] = await Promise.all([
        fetch('/api/customer/profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/customer/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/customer/rewards', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      let name = user?.displayName || '';
      let email = user?.email || '';
      let phone = '';
      let avatar = '';
      let memberSince = '';
      let loyaltyTier: CustomerProfile['loyaltyTier'] = 'bronze';
      let points = 0;
      let preferences = { dietary: [] as string[], allergies: [] as string[], favoriteCategories: [] as string[] };
      let stats = { totalOrders: 0, totalSpent: 0, savedByDiscounts: 0 };

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.customer) {
          const c = profileData.customer;
          name = c.name || name;
          email = c.email || email;
          phone = c.phone || '';
          avatar = c.avatar || '';
          memberSince = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
          loyaltyTier = c.loyaltyTier || 'bronze';
          points = c.points || 0;
          if (c.preferences) {
            preferences = {
              dietary: c.preferences.dietary || c.preferences.dietaryRestrictions || [],
              allergies: c.preferences.allergies || [],
              favoriteCategories: c.preferences.favoriteCategories || [],
            };
          }
        }
      }

      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        if (rewardsData.success && rewardsData.rewards) {
          loyaltyTier = rewardsData.rewards.tier || loyaltyTier;
          points = rewardsData.rewards.balance || points;
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        stats = {
          totalOrders: statsData.totalOrders || 0,
          totalSpent: statsData.totalSpent || 0,
          savedByDiscounts: statsData.savedWithDiscounts || 0,
        };
      }

      setCustomerProfile({
        id: user?.customerId || 'customer',
        name,
        email,
        phone,
        avatar,
        memberSince,
        loyaltyTier,
        points,
        preferences,
        stats,
      });
    } catch (error) {
      console.error('Error loading customer profile:', error);
      // Set minimal profile from auth context
      if (user) {
        setCustomerProfile({
          id: user.customerId || user.id,
          name: user.displayName || '',
          email: user.email || '',
          memberSince: '',
          loyaltyTier: 'bronze',
          points: 0,
          preferences: { dietary: [], allergies: [], favoriteCategories: [] },
          stats: { totalOrders: 0, totalSpent: 0, savedByDiscounts: 0 },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWallet = () => {
    toast({
      title: "Coming Soon",
      description: "Apple Wallet and Google Pay integration coming soon!",
    });
  };

  // Tier-specific label
  const tierLabel = customerProfile?.loyaltyTier
    ? customerProfile.loyaltyTier.charAt(0).toUpperCase() + customerProfile.loyaltyTier.slice(1)
    : 'Bronze';

  // Points to next tier
  const tierThresholds: Record<string, { next: string | null; pointsNeeded: number }> = {
    bronze: { next: 'Silver', pointsNeeded: 500 },
    silver: { next: 'Gold', pointsNeeded: 2000 },
    gold: { next: 'Platinum', pointsNeeded: 5000 },
    platinum: { next: null, pointsNeeded: 0 },
  };
  const currentTierInfo = tierThresholds[customerProfile?.loyaltyTier || 'bronze'];
  const pointsToNext = currentTierInfo.next ? Math.max(0, currentTierInfo.pointsNeeded - (customerProfile?.points || 0)) : 0;
  const progressPercent = currentTierInfo.next
    ? Math.min(100, ((customerProfile?.points || 0) / currentTierInfo.pointsNeeded) * 100)
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your QR code</p>
          <Link href="/customer/login" className="text-green-600 hover:text-green-700 font-semibold">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/customer/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
              My Member QR
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {['qr', 'benefits', 'how'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'qr' && 'My QR Code'}
                {tab === 'benefits' && 'Benefits'}
                {tab === 'how' && 'How It Works'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* QR Display Options */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CustomerQRCode
                  profile={customerProfile}
                  variant="card"
                  size={120}
                  showActions={false}
                />
              </motion.div>

              <div className="col-span-2">
                <CustomerQRCode
                  profile={customerProfile}
                  variant="full"
                  size={200}
                  showActions={true}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleAddToWallet}
                className="bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
              >
                <Smartphone className="w-6 h-6 stroke-[1.5]" />
                <span>Add to Apple Wallet</span>
              </button>
              <button
                onClick={handleAddToWallet}
                className="bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <Wallet className="w-6 h-6 stroke-[1.5]" />
                <span>Add to Google Pay</span>
              </button>
            </div>

            {/* Usage Stats */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: '#3a3a1d' }}>
                <TrendingUp className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#478c0b' }} />
                Your Summary
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>{customerProfile.stats.totalOrders}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                    {customerProfile.stats.savedByDiscounts > 0 ? `\u20AA${customerProfile.stats.savedByDiscounts}` : '\u20AA0'}
                  </p>
                  <p className="text-sm text-gray-600">Savings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>{customerProfile.points}</p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Current Benefits */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                    Your {tierLabel} Benefits
                  </h3>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 capitalize">{customerProfile.loyaltyTier}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 stroke-[1.5] text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {customerProfile.loyaltyTier === 'platinum' ? '20%' :
                         customerProfile.loyaltyTier === 'gold' ? '15%' :
                         customerProfile.loyaltyTier === 'silver' ? '10%' : '5%'} Off All Purchases
                      </p>
                      <p className="text-sm text-gray-600">Automatic discount at checkout</p>
                    </div>
                  </div>
                  {(customerProfile.loyaltyTier === 'gold' || customerProfile.loyaltyTier === 'platinum') && (
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 stroke-[1.5] text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Free Shipping Always</p>
                        <p className="text-sm text-gray-600">No minimum order required</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Headphones className="w-5 h-5 stroke-[1.5] text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {customerProfile.loyaltyTier === 'platinum' || customerProfile.loyaltyTier === 'gold' ? 'Priority' : 'Standard'} Support
                      </p>
                      <p className="text-sm text-gray-600">Customer service access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 stroke-[1.5] text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Earn Points</p>
                      <p className="text-sm text-gray-600">1 point per shekel spent</p>
                    </div>
                  </div>
                  {(customerProfile.loyaltyTier === 'gold' || customerProfile.loyaltyTier === 'platinum') && (
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 stroke-[1.5] text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Early Access</p>
                        <p className="text-sm text-gray-600">First to try new products</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Tier */}
              {currentTierInfo.next ? (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                      Next: {currentTierInfo.next}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Current: {customerProfile.points} pts</span>
                      <span>Need: {currentTierInfo.pointsNeeded} pts</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {pointsToNext} points to {currentTierInfo.next}
                    </p>
                  </div>

                  <h4 className="font-semibold mb-3">Unlock at {currentTierInfo.next}:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 stroke-[1.5] text-purple-600" />
                      <span>Higher discount percentage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 stroke-[1.5] text-purple-600" />
                      <span>More exclusive benefits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 stroke-[1.5] text-purple-600" />
                      <span>Priority support access</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                    You are at the top tier!
                  </h3>
                  <p className="text-gray-600">
                    Congratulations! As a Platinum member, you enjoy the best benefits available.
                  </p>
                </div>
              )}
            </div>

            {/* Where to Use QR */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                <QrCode className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#478c0b' }} />
                Where to Use Your QR
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Store className="w-8 h-8 stroke-[1.5] mx-auto mb-2" style={{ color: '#478c0b' }} />
                  <p className="font-semibold">In-Store</p>
                  <p className="text-sm text-gray-600">Quick checkout</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CalendarCheck className="w-8 h-8 stroke-[1.5] mx-auto mb-2" style={{ color: '#f6af0d' }} />
                  <p className="font-semibold">Events</p>
                  <p className="text-sm text-gray-600">Member check-in</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-8 h-8 stroke-[1.5] mx-auto mb-2" style={{ color: '#c23c09' }} />
                  <p className="font-semibold">Referrals</p>
                  <p className="text-sm text-gray-600">Share with friends</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Gift className="w-8 h-8 stroke-[1.5] mx-auto mb-2" style={{ color: '#478c0b' }} />
                  <p className="font-semibold">Rewards</p>
                  <p className="text-sm text-gray-600">Claim instantly</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* How It Works Tab */}
        {activeTab === 'how' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
                How Your Member QR Works
              </h3>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Show Your QR at Checkout</h4>
                    <p className="text-gray-600">
                      Present your unique QR code when making a purchase. The vendor scans it to identify you instantly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-yellow-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Automatic Benefits Applied</h4>
                    <p className="text-gray-600">
                      Your tier discounts and rewards are automatically applied. No need to remember coupon codes!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-orange-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Earn Points Instantly</h4>
                    <p className="text-gray-600">
                      Every purchase earns you points based on the amount spent. Points are added to your account immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-purple-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Track Your Progress</h4>
                    <p className="text-gray-600">
                      Monitor your points, tier status, and savings in real-time through your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <ShieldCheck className="w-4 h-4 stroke-[1.5] inline mr-2" />
                  <strong>Security:</strong> Your QR code contains encrypted data and changes periodically for security.
                  Only authorized KFAR vendors can read your information.
                </p>
              </div>

              {/* FAQ */}
              <div className="mt-8">
                <h4 className="font-bold text-lg mb-4">Frequently Asked Questions</h4>
                <div className="space-y-4">
                  <details className="group">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      Can I use my QR code offline?
                    </summary>
                    <p className="mt-2 text-gray-600 pl-4">
                      Yes! Your QR code works offline. Vendors can scan it even without internet connection.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      What if I lose my phone?
                    </summary>
                    <p className="mt-2 text-gray-600 pl-4">
                      You can always access your QR code by logging into your account on any device. We also recommend saving a copy in your email.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      Can I share my QR with family?
                    </summary>
                    <p className="mt-2 text-gray-600 pl-4">
                      Your QR is personal and tied to your rewards. Family members should create their own accounts to earn their own rewards.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
