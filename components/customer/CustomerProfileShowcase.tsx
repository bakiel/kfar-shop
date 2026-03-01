'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import CustomerQRCode from './CustomerQRCode';
import {
  Leaf,
  AlertTriangle,
  LayoutGrid,
  Film,
  X,
  Award,
  Crown,
  Star,
  Shield,
  Users,
  Loader2,
} from 'lucide-react';

interface CustomerApiResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  total_orders: number;
  total_spent: number;
  tags?: string[];
  preferences?: {
    dietary?: string[];
    allergies?: string[];
    favoriteCategories?: string[];
  };
  created_at: string;
}

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

function formatMemberSince(dateString: string): string {
  try {
    const date = new Date(dateString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return 'N/A';
  }
}

function mapCustomerToProfile(customer: CustomerApiResponse): CustomerProfile {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    memberSince: formatMemberSince(customer.created_at),
    loyaltyTier: customer.loyalty_tier || 'bronze',
    points: customer.points || 0,
    preferences: {
      dietary: customer.preferences?.dietary || [],
      allergies: customer.preferences?.allergies || [],
      favoriteCategories: customer.preferences?.favoriteCategories || [],
    },
    stats: {
      totalOrders: customer.total_orders || 0,
      totalSpent: customer.total_spent || 0,
      savedByDiscounts: 0,
    },
  };
}

const tierConfig: Record<
  string,
  { bg: string; color: string; label: string; icon: React.ReactNode }
> = {
  bronze: {
    bg: 'from-orange-100 to-orange-200',
    color: '#CD7F32',
    label: 'Bronze',
    icon: <Shield className="w-5 h-5 stroke-[1.5]" style={{ color: '#CD7F32' }} />,
  },
  silver: {
    bg: 'from-gray-100 to-gray-200',
    color: '#8E8E8E',
    label: 'Silver',
    icon: <Star className="w-5 h-5 stroke-[1.5]" style={{ color: '#8E8E8E' }} />,
  },
  gold: {
    bg: 'from-yellow-100 to-yellow-200',
    color: '#D4A017',
    label: 'Gold',
    icon: <Award className="w-5 h-5 stroke-[1.5]" style={{ color: '#D4A017' }} />,
  },
  platinum: {
    bg: 'from-purple-100 to-purple-200',
    color: '#7C3AED',
    label: 'Platinum',
    icon: <Crown className="w-5 h-5 stroke-[1.5]" style={{ color: '#7C3AED' }} />,
  },
};

export default function CustomerProfileShowcase() {
  const { accessToken } = useAuth();
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');

  useEffect(() => {
    async function fetchCustomers() {
      setIsLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const res = await fetch('/api/admin/crm/customers?limit=50', { headers });

        if (!res.ok) {
          throw new Error(`Failed to fetch customers (${res.status})`);
        }

        const data = await res.json();
        const customers: CustomerApiResponse[] = data.customers || [];
        setProfiles(customers.map(mapCustomerToProfile));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load customers';
        setError(message);
        console.error('CustomerProfileShowcase fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomers();
  }, [accessToken]);

  const getTier = (tier: string) => tierConfig[tier] || tierConfig.bronze;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-2 bg-gray-200 animate-pulse" />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="bg-gray-50 rounded-lg p-2">
                      <div className="h-6 w-10 mx-auto bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-12 mx-auto bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 stroke-[1.5] text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-1">Failed to load customers</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (profiles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 stroke-[1.5] text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No customers found</h3>
          <p className="text-sm text-gray-500">
            Customer profiles will appear here once customers register on the platform.
          </p>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile, index) => {
        const tier = getTier(profile.loyaltyTier);
        return (
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
            <div className={`h-2 bg-gradient-to-r ${tier.bg}`} />

            <div className="p-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: tier.color }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                    {tier.icon}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{profile.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: tier.color }}
                    >
                      {tier.label.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {profile.points} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2 mb-4">
                {profile.preferences.dietary.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 stroke-[1.5] text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 truncate">
                      {profile.preferences.dietary.join(', ')}
                    </span>
                  </div>
                )}

                {profile.preferences.allergies.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 stroke-[1.5] text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-600 truncate">
                      Allergic to: {profile.preferences.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold" style={{ color: '#478c0b' }}>
                    {profile.stats.totalOrders}
                  </p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold" style={{ color: '#f6af0d' }}>
                    {'\u20AA'}{profile.stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Spent</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderCarouselView = () => (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        {profiles.map((profile, index) => {
          const tier = getTier(profile.loyaltyTier);
          return (
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
                {/* Avatar Header */}
                <div className={`relative h-32 bg-gradient-to-br ${tier.bg} flex items-center justify-center`}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                    style={{ backgroundColor: tier.color }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{profile.name}</h3>
                    <span className="bg-white rounded-full p-1 shadow">
                      {tier.icon}
                    </span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${tier.bg} mb-4`}>
                    {tier.icon}
                    <span className="font-semibold text-sm">{tier.label.toUpperCase()}</span>
                    <span className="text-sm text-gray-600">{profile.points} pts</span>
                  </div>

                  <div className="space-y-3">
                    {profile.preferences.favoriteCategories.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Preferences
                        </p>
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
                    )}

                    {profile.preferences.dietary.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Dietary
                        </p>
                        <p className="text-sm text-gray-700">
                          {profile.preferences.dietary.join(', ')}
                        </p>
                      </div>
                    )}

                    <button
                      className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
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
          );
        })}
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
            {profiles.length} registered customer{profiles.length !== 1 ? 's' : ''} with personalized QR codes and shopping preferences
          </p>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[1.5] mr-2 inline" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Film className="w-4 h-4 stroke-[1.5] mr-2 inline" />
              Carousel View
            </button>
          </div>
        </div>

        {/* Profile Display */}
        {viewMode === 'grid' ? renderGridView() : renderCarouselView()}
      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile !== null && profiles[selectedProfile] && (
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
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
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
