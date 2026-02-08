'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ANALYZED_CUSTOMER_PROFILES } from '@/lib/services/customer-avatar-analyzer';
import CustomerQRCode from './CustomerQRCode';

export default function CustomerProfileShowcase() {
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');

  const profiles = ANALYZED_CUSTOMER_PROFILES.map(profile => ({
    ...profile,
    email: `${profile.name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: '+972-50-' + Math.floor(Math.random() * 9000000 + 1000000),
    avatar: `/images/customer-onboarding/${profile.imageId}.jpg`,
    memberSince: 'Jan 2023',
    stats: {
      totalOrders: Math.floor(Math.random() * 50) + 10,
      totalSpent: Math.floor(Math.random() * 3000) + 500,
      savedByDiscounts: Math.floor(Math.random() * 500) + 100
    }
  }));

  const tierColors = {
    bronze: { bg: 'from-orange-100 to-orange-200', color: '#CD7F32', icon: '🥉' },
    silver: { bg: 'from-gray-100 to-gray-200', color: '#C0C0C0', icon: '🥈' },
    gold: { bg: 'from-yellow-100 to-yellow-200', color: '#FFD700', icon: '🥇' },
    platinum: { bg: 'from-purple-100 to-purple-200', color: '#E5E4E2', icon: '💎' }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
          onClick={() => setSelectedProfile(index)}
          whileHover={{ y: -4 }}
        >
          {/* Profile Header */}
          <div className={`h-2 bg-gradient-to-r ${tierColors[profile.loyaltyTier].bg}`} />
          
          <div className="p-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                <span className="absolute -bottom-2 -right-2 text-2xl">
                  {tierColors[profile.loyaltyTier].icon}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: tierColors[profile.loyaltyTier].color }}
                  >
                    {profile.loyaltyTier.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">• {profile.points} pts</span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-2 mb-4">
              {profile.preferences.dietary.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-leaf text-green-500" />
                  <span className="text-gray-600">
                    {profile.preferences.dietary.join(', ')}
                  </span>
                </div>
              )}
              
              {profile.preferences.allergies.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-exclamation-triangle text-yellow-500" />
                  <span className="text-gray-600">
                    Allergic to: {profile.preferences.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold" style={{ color: '#478c0b' }}>
                  {profile.stats.totalOrders}
                </p>
                <p className="text-xs text-gray-600">Orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold" style={{ color: '#f6af0d' }}>
                  ₪{profile.stats.totalSpent}
                </p>
                <p className="text-xs text-gray-600">Spent</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold" style={{ color: '#c23c09' }}>
                  ₪{profile.stats.savedByDiscounts}
                </p>
                <p className="text-xs text-gray-600">Saved</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCarouselView = () => (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-80 snap-center"
          >
            <div 
              className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => setSelectedProfile(index)}
            >
              {/* Large Avatar */}
              <div className="relative h-48">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{profile.name}</h3>
                  <p className="text-sm opacity-90">{profile.description}</p>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="p-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${tierColors[profile.loyaltyTier].bg} mb-4`}>
                  <span className="text-lg">{tierColors[profile.loyaltyTier].icon}</span>
                  <span className="font-semibold text-sm">{profile.loyaltyTier.toUpperCase()}</span>
                  <span className="text-sm">• {profile.points} pts</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences.favoriteCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {profile.preferences.dietary.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dietary</p>
                      <p className="text-sm text-gray-700">{profile.preferences.dietary.join(', ')}</p>
                    </div>
                  )}

                  <button
                    className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProfile(index);
                    }}
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
            Customer Profile Gallery
          </h2>
          <p className="text-gray-600 mb-6">
            AI-analyzed customer profiles with personalized QR codes and shopping preferences
          </p>
          
          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <i className="fas fa-th mr-2" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'carousel'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <i className="fas fa-film mr-2" />
              Carousel View
            </button>
          </div>
        </div>

        {/* Profile Display */}
        {viewMode === 'grid' ? renderGridView() : renderCarouselView()}
      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
                    Customer Profile Details
                  </h3>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl" />
                  </button>
                </div>

                <CustomerQRCode
                  profile={profiles[selectedProfile]}
                  variant="full"
                  showActions={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}