'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, Leaf, Star, Sprout, Wheat, AlertTriangle } from 'lucide-react';
import CustomerProfileShowcase from '@/components/customer/CustomerProfileShowcase';
import { ANALYZED_CUSTOMER_PROFILES } from '@/lib/services/customer-avatar-analyzer';

export default function AdminCustomerProfilesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'analytics'>('overview');

  // Calculate statistics
  const stats = {
    totalCustomers: ANALYZED_CUSTOMER_PROFILES.length,
    tierDistribution: {
      platinum: ANALYZED_CUSTOMER_PROFILES.filter(p => p.loyaltyTier === 'platinum').length,
      gold: ANALYZED_CUSTOMER_PROFILES.filter(p => p.loyaltyTier === 'gold').length,
      silver: ANALYZED_CUSTOMER_PROFILES.filter(p => p.loyaltyTier === 'silver').length,
      bronze: ANALYZED_CUSTOMER_PROFILES.filter(p => p.loyaltyTier === 'bronze').length
    },
    dietaryPreferences: {
      vegan: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.dietary.includes('vegan')).length,
      kosher: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.dietary.includes('kosher')).length,
      organic: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.dietary.includes('organic')).length,
      glutenFree: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.dietary.includes('gluten-free')).length
    },
    commonAllergies: {
      nuts: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.allergies.includes('nuts')).length,
      dairy: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.allergies.includes('dairy')).length,
      gluten: ANALYZED_CUSTOMER_PROFILES.filter(p => p.preferences.allergies.includes('gluten')).length
    }
  };

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
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            Back to Admin Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold" style={{ color: '#3a3a1d' }}>
            Customer Profile Management
          </h1>
          <p className="text-gray-600 mt-2">
            AI-analyzed customer profiles with visual recognition and behavior patterns
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex gap-8 px-6">
            {['overview', 'profiles', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-lg p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Customer Base Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#478c0b' }}>
                      {stats.totalCustomers}
                    </h3>
                    <p className="text-gray-600 mt-1">Total Profiles</p>
                    <p className="text-sm text-gray-500 mt-2">AI-analyzed & categorized</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#7c3aed' }}>
                      {stats.tierDistribution.platinum + stats.tierDistribution.gold}
                    </h3>
                    <p className="text-gray-600 mt-1">Premium Members</p>
                    <p className="text-sm text-gray-500 mt-2">Gold & Platinum tiers</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#f6af0d' }}>
                      {stats.dietaryPreferences.vegan + stats.dietaryPreferences.organic}
                    </h3>
                    <p className="text-gray-600 mt-1">Health Conscious</p>
                    <p className="text-sm text-gray-500 mt-2">Special dietary needs</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                    <h3 className="text-3xl font-bold" style={{ color: '#c23c09' }}>
                      {Object.values(stats.commonAllergies).reduce((a, b) => a + b, 0)}
                    </h3>
                    <p className="text-gray-600 mt-1">With Allergies</p>
                    <p className="text-sm text-gray-500 mt-2">Requiring special care</p>
                  </div>
                </div>
              </div>

              {/* Tier Distribution */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Loyalty Tier Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.tierDistribution).map(([tier, count]) => (
                    <div key={tier} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium capitalize">{tier}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / stats.totalCustomers) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={`h-full flex items-center justify-end px-3 text-white text-sm font-medium ${
                            tier === 'platinum' ? 'bg-purple-500' :
                            tier === 'gold' ? 'bg-yellow-500' :
                            tier === 'silver' ? 'bg-gray-500' :
                            'bg-orange-500'
                          }`}
                        >
                          {count}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis Insights */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  <Brain className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#3b82f6' }} />
                  AI Vision Analysis Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Visual Characteristics Detected</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Age demographics: 25-65 years</li>
                      <li>• Professional & family-oriented individuals</li>
                      <li>• Health-conscious appearance indicators</li>
                      <li>• Diverse cultural backgrounds</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Behavioral Predictions</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Weekly shopping patterns likely</li>
                      <li>• Quality over quantity preference</li>
                      <li>• Brand loyalty indicators high</li>
                      <li>• Social shopping tendencies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CustomerProfileShowcase />
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Dietary Preferences */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Dietary Preferences Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(stats.dietaryPreferences).map(([pref, count]) => {
                    const DietaryIcon = pref === 'vegan' ? Leaf :
                      pref === 'kosher' ? Star :
                      pref === 'organic' ? Sprout :
                      Wheat;
                    return (
                    <div key={pref} className="bg-green-50 rounded-lg p-4 text-center">
                      <DietaryIcon className="w-6 h-6 stroke-[1.5] mb-2 mx-auto" style={{ color: '#478c0b' }} />
                      <p className="font-semibold capitalize">
                        {pref.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>{count}</p>
                    </div>
                  );})}
                </div>
              </div>

              {/* Allergy Distribution */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Allergy Awareness
                </h3>
                <div className="bg-yellow-50 rounded-xl p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(stats.commonAllergies).map(([allergy, count]) => (
                      <div key={allergy} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 stroke-[1.5] text-yellow-500" />
                          <span className="font-medium capitalize">{allergy}</span>
                        </div>
                        <span className="text-xl font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shopping Patterns */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  Predicted Shopping Patterns
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Peak Shopping Times</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Morning (7-10 AM)</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Afternoon (2-5 PM)</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Evening (6-9 PM)</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Category Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fresh Produce</span>
                        <span className="font-bold text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bakery</span>
                        <span className="font-bold text-green-600">72%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Prepared Meals</span>
                        <span className="font-bold text-green-600">58%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Specialty Foods</span>
                        <span className="font-bold text-green-600">45%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}