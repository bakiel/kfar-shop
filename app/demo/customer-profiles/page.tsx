'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';
import CustomerQRCode from '@/components/customer/CustomerQRCode';
import {
  ArrowLeft, Crown, QrCode, Database, Star, Heart, Clock,
  Banknote, Gift, UserCheck, TrendingUp, CheckCircle, Shield,
  Settings, X, Info, User, Bell
} from 'lucide-react';

const featureIconMap: Record<string, React.ReactNode> = {
  qrcode: <QrCode className="w-10 h-10 stroke-[1.5]" style={{ color: '#478c0b' }} />,
  crown: <Crown className="w-10 h-10 stroke-[1.5]" style={{ color: '#f6af0d' }} />,
  settings: <Settings className="w-10 h-10 stroke-[1.5]" style={{ color: '#c23c09' }} />,
  trending: <TrendingUp className="w-10 h-10 stroke-[1.5]" style={{ color: '#478c0b' }} />,
  star: <Star className="w-10 h-10 stroke-[1.5]" style={{ color: '#f6af0d' }} />,
  bell: <Bell className="w-10 h-10 stroke-[1.5]" style={{ color: '#c23c09' }} />,
};

export default function CustomerProfilesDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'integration'>('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Sample customer profiles
  const sampleCustomers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Sarah Cohen',
      email: 'sarah.cohen@example.com',
      avatar: '/images/avatars/sarah.jpg',
      avatarDescription: 'Woman with curly hair wearing glasses and a bright smile',
      loyaltyTier: 'gold',
      points: 5250,
      lifetimePoints: 5250,
      preferences: {
        favoriteCategories: ['dairy-alternatives', 'prepared-foods'],
        shoppingFrequency: 'weekly',
        dietaryRestrictions: ['vegan', 'gluten-free']
      },
      location: 'Dimona',
      joinedDate: '2023-06-15',
      lastPurchase: '2024-01-20'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'David Levi',
      email: 'david.levi@example.com',
      avatar: '/images/avatars/david.jpg',
      avatarDescription: 'Man with short beard wearing a casual shirt',
      loyaltyTier: 'silver',
      points: 2100,
      lifetimePoints: 2100,
      preferences: {
        favoriteCategories: ['beverages', 'snacks'],
        shoppingFrequency: 'bi-weekly',
        dietaryRestrictions: ['vegan']
      },
      location: 'Eilat',
      joinedDate: '2023-09-22',
      lastPurchase: '2024-01-18'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Rachel Green',
      email: 'rachel.green@example.com',
      avatar: '/images/avatars/rachel.jpg',
      avatarDescription: 'Young woman with long hair and friendly expression',
      loyaltyTier: 'bronze',
      points: 750,
      lifetimePoints: 750,
      preferences: {
        favoriteCategories: ['personal-care', 'home-essentials'],
        shoppingFrequency: 'monthly',
        dietaryRestrictions: ['vegan', 'organic']
      },
      location: 'Beer Sheva',
      joinedDate: '2023-12-01',
      lastPurchase: '2024-01-15'
    }
  ];

  const features = [
    {
      icon: 'qrcode',
      title: 'Unique QR Codes',
      description: 'Each customer gets a personal QR code with embedded profile data'
    },
    {
      icon: 'crown',
      title: 'Loyalty Tiers',
      description: 'Bronze, Silver, Gold, and Platinum tiers with progressive benefits'
    },
    {
      icon: 'settings',
      title: 'Smart Preferences',
      description: 'Track dietary restrictions, shopping habits, and favorite categories'
    },
    {
      icon: 'trending',
      title: 'Points System',
      description: 'Earn points for purchases, reviews, and engagement activities'
    },
    {
      icon: 'star',
      title: 'AI-Powered Insights',
      description: 'Vision AI analyzes profile images to enhance personalization'
    },
    {
      icon: 'bell',
      title: 'Smart Notifications',
      description: 'Personalized alerts based on preferences and shopping behavior'
    }
  ];

  const tierBenefits = {
    bronze: {
      color: '#CD7F32',
      benefits: ['Basic points earning (1x)', 'Birthday bonus', 'New product alerts'],
      pointsRequired: 0
    },
    silver: {
      color: '#C0C0C0',
      benefits: ['1.5x points earning', 'Early access to sales', 'Free shipping on orders over ₪100'],
      pointsRequired: 2000
    },
    gold: {
      color: '#FFD700',
      benefits: ['2x points earning', 'Exclusive products', 'Free shipping on all orders', 'Priority support'],
      pointsRequired: 5000
    },
    platinum: {
      color: '#E5E4E2',
      benefits: ['3x points earning', 'VIP events', 'Personal shopper', 'Custom product requests'],
      pointsRequired: 10000
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
              Back to Demos
            </Link>
            
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Complete Customer Profile System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our comprehensive customer management system with QR codes,
              loyalty tiers, AI-powered insights, and seamless Supabase integration
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              {(['overview', 'features', 'integration'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-md font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Sample Customer Profiles */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Customer Profiles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {sampleCustomers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowQRModal(true);
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-gray-200">
                            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <div 
                              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: tierBenefits[customer.loyaltyTier as keyof typeof tierBenefits].color }}
                            >
                              <Crown className="w-3 h-3 stroke-[1.5]" />
                              {customer.loyaltyTier.charAt(0).toUpperCase() + customer.loyaltyTier.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Points Balance</span>
                            <span className="font-bold" style={{ color: '#478c0b' }}>
                              {customer.points.toLocaleString()} pts
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Lifetime Points</span>
                            <span className="font-semibold text-gray-800">
                              {customer.lifetimePoints.toLocaleString()} pts
                            </span>
                          </div>

                          <div className="pt-3 border-t">
                            <p className="text-xs text-gray-600 mb-1">Dietary Preferences:</p>
                            <div className="flex flex-wrap gap-1">
                              {customer.preferences.dietaryRestrictions.map((diet, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                                >
                                  {diet}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Member since {new Date(customer.joinedDate).toLocaleDateString()}</span>
                            <span>{customer.location}</span>
                          </div>
                        </div>

                        <button className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                          <QrCode className="w-4 h-4 stroke-[1.5] mr-2" />
                          View QR Code
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  System Features
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="mb-3 flex justify-center">{featureIconMap[feature.icon]}</div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Loyalty Tiers */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Loyalty Tier System
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(tierBenefits).map(([tier, info]) => (
                    <div
                      key={tier}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      style={{ borderColor: info.color }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: info.color }}
                          >
                            <Crown className="w-5 h-5 stroke-[1.5]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg capitalize">{tier} Tier</h3>
                            <p className="text-sm text-gray-600">
                              {info.pointsRequired.toLocaleString()}+ lifetime points
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-2">
                        {info.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 stroke-[1.5] text-green-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Features */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  QR Code Capabilities
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Embedded Data</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Database className="w-4 h-4 stroke-[1.5] text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Customer ID and basic profile info</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 stroke-[1.5] text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>Current loyalty tier and points balance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-4 h-4 stroke-[1.5] text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Dietary preferences and restrictions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4 h-4 stroke-[1.5] text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Real-time timestamp for security</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Use Cases</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Banknote className="w-4 h-4 stroke-[1.5] text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>Quick checkout with loyalty points</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-4 h-4 stroke-[1.5] text-pink-500 mt-0.5 flex-shrink-0" />
                        <span>Instant reward redemption</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <UserCheck className="w-4 h-4 stroke-[1.5] text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span>Vendor customer verification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 stroke-[1.5] text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Analytics and behavior tracking</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Points System */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Points Earning Structure
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Purchases</h4>
                      <p className="text-sm text-gray-600">Earn points on every shekel spent</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                      1 ₪ = 1 pt
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Basic Reviews</h4>
                      <p className="text-sm text-gray-600">Rate products you've purchased</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                      50 pts
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Detailed Reviews</h4>
                      <p className="text-sm text-gray-600">Add comments (50+ characters)</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                      100 pts
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Photo Reviews</h4>
                      <p className="text-sm text-gray-600">Include product photos</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                      150 pts
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'integration' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Supabase Database Architecture
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5 stroke-[1.5] text-green-500" />
                      Customer Tables
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                      <div className="mb-3">
                        <span className="text-purple-600">customers</span>
                        <ul className="ml-4 mt-1 text-gray-700">
                          <li>• id, user_id, name, email, phone</li>
                          <li>• avatar, avatar_description</li>
                          <li>• loyalty_tier, points, lifetime_points</li>
                          <li>• preferences (JSONB), dietary_restrictions</li>
                          <li>• location, language_preference</li>
                        </ul>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-purple-600">points_transactions</span>
                        <ul className="ml-4 mt-1 text-gray-700">
                          <li>• customer_id, points, type</li>
                          <li>• description, reference_id, reference_type</li>
                        </ul>
                      </div>
                      
                      <div>
                        <span className="text-purple-600">customer_qr_scans</span>
                        <ul className="ml-4 mt-1 text-gray-700">
                          <li>• customer_id, scanned_by_vendor_id</li>
                          <li>• scan_location, scan_purpose, scan_data</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 stroke-[1.5] text-blue-500" />
                      Security Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Row Level Security</h4>
                        <p className="text-sm text-blue-700">
                          Customers can only view and edit their own profiles
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Encrypted Storage</h4>
                        <p className="text-sm text-green-700">
                          Sensitive data encrypted at rest and in transit
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Settings className="w-5 h-5 stroke-[1.5] text-purple-500" />
                      API Endpoints
                    </h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded">GET</span>
                        <span>/api/customers - Get customer profile</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">POST</span>
                        <span>/api/customers - Create new customer</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded">PATCH</span>
                        <span>/api/customers - Update profile</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">POST</span>
                        <span>/api/customers/qr - Record QR scan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Features */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Real-time Capabilities
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Live Points Updates</h3>
                    <p className="text-sm text-gray-700">
                      Points balance updates instantly across all devices when customers
                      earn or redeem rewards
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <h3 className="font-semibold mb-3">QR Scan Notifications</h3>
                    <p className="text-sm text-gray-700">
                      Vendors receive instant notifications when customers scan
                      their QR codes at checkout
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Profile Sync</h3>
                    <p className="text-sm text-gray-700">
                      Profile updates sync automatically across mobile app,
                      web, and vendor systems
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-700">
                      Real-time customer behavior analytics for vendors
                      to optimize their offerings
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* QR Code Modal */}
          {showQRModal && selectedCustomer && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                    Customer QR Code
                  </h3>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
                
                <div className="text-center">
                  <CustomerQRCode 
                    profile={selectedCustomer}
                    variant="full"
                  />
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Embedded Data:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Customer ID: {selectedCustomer.id.slice(0, 8)}...</li>
                      <li>• Name: {selectedCustomer.name}</li>
                      <li>• Tier: {selectedCustomer.loyaltyTier}</li>
                      <li>• Points: {selectedCustomer.points}</li>
                      <li>• Preferences: {selectedCustomer.preferences.dietaryRestrictions.join(', ')}</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      toast({
                        title: "QR Code Usage",
                        description: "Vendors can scan this code for instant customer verification and personalized service",
                      });
                    }}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <Info className="w-4 h-4 stroke-[1.5] mr-2" />
                    How It Works
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Try It Live CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready to Experience It?</h3>
              <p className="text-lg mb-6 opacity-90">
                Create your customer profile and start earning rewards today
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/customer/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                  Customer Dashboard
                </Link>
                <Link
                  href="/demo/qr-scanner"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
                >
                  <QrCode className="w-5 h-5 stroke-[1.5]" />
                  Try QR Scanner
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}