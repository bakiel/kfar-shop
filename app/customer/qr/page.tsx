'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import { useToast } from '@/components/ui/use-toast';

export default function CustomerQRPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'benefits' | 'how'>('qr');
  const { toast } = useToast();

  // Mock customer data - in production, this would come from auth/database
  const customerProfile = {
    id: 'cust_123456',
    name: 'Sarah Cohen',
    email: 'sarah.cohen@example.com',
    phone: '+972-50-123-4567',
    avatar: '/images/customer-avatars/sarah.jpg',
    memberSince: 'Jan 2023',
    loyaltyTier: 'gold' as const,
    points: 3250,
    preferences: {
      dietary: ['vegan', 'gluten-free'],
      allergies: ['nuts'],
      favoriteCategories: ['bakery', 'prepared-meals', 'desserts']
    },
    stats: {
      totalOrders: 47,
      totalSpent: 2840,
      savedByDiscounts: 426
    }
  };

  const handleAddToWallet = () => {
    // In production, this would integrate with mobile wallet APIs
    toast({
      title: "Coming Soon",
      description: "Apple Wallet and Google Pay integration coming soon!",
    });
  };

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
              <i className="fas fa-arrow-left" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
              My Member QR
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
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
                <i className="fab fa-apple text-2xl" />
                <span>Add to Apple Wallet</span>
              </button>
              <button
                onClick={handleAddToWallet}
                className="bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <i className="fab fa-google-pay text-2xl" />
                <span>Add to Google Pay</span>
              </button>
            </div>

            {/* Usage Stats */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: '#3a3a1d' }}>
                <i className="fas fa-chart-line mr-2" style={{ color: '#478c0b' }} />
                Your QR Usage
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>23</p>
                  <p className="text-sm text-gray-600">Times Scanned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#f6af0d' }}>₪426</p>
                  <p className="text-sm text-gray-600">Rewards Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#c23c09' }}>15%</p>
                  <p className="text-sm text-gray-600">Avg Discount</p>
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
                    Your Gold Benefits
                  </h3>
                  <span className="text-3xl">🥇</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">15% Off All Purchases</p>
                      <p className="text-sm text-gray-600">Automatic discount at checkout</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-truck text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Free Shipping Always</p>
                      <p className="text-sm text-gray-600">No minimum order required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-headset text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Priority Support</p>
                      <p className="text-sm text-gray-600">Direct line to customer service</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-gift text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Birthday Surprise</p>
                      <p className="text-sm text-gray-600">Special gift on your birthday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-star text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold">Early Access</p>
                      <p className="text-sm text-gray-600">First to try new products</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Tier */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                    Next: Platinum
                  </h3>
                  <span className="text-3xl">💎</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current: 3,250 pts</span>
                    <span>Need: 10,000 pts</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000"
                      style={{ width: '32.5%' }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    6,750 points to Platinum
                  </p>
                </div>

                <h4 className="font-semibold mb-3">Unlock at Platinum:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-purple-600" />
                    <span>20% off all purchases</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-purple-600" />
                    <span>VIP event invitations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-purple-600" />
                    <span>Personal shopping assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-purple-600" />
                    <span>Exclusive product launches</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ways to Use QR */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                <i className="fas fa-qrcode mr-2" style={{ color: '#478c0b' }} />
                Where to Use Your QR
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="fas fa-store text-3xl mb-2" style={{ color: '#478c0b' }} />
                  <p className="font-semibold">In-Store</p>
                  <p className="text-sm text-gray-600">Quick checkout</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="fas fa-calendar-check text-3xl mb-2" style={{ color: '#f6af0d' }} />
                  <p className="font-semibold">Events</p>
                  <p className="text-sm text-gray-600">Member check-in</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="fas fa-users text-3xl mb-2" style={{ color: '#c23c09' }} />
                  <p className="font-semibold">Referrals</p>
                  <p className="text-sm text-gray-600">Share with friends</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="fas fa-gift text-3xl mb-2" style={{ color: '#478c0b' }} />
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
                {/* Step 1 */}
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

                {/* Step 2 */}
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

                {/* Step 3 */}
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

                {/* Step 4 */}
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
                  <i className="fas fa-shield-alt mr-2" />
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