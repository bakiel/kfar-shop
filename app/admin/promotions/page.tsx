'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Clock, CheckCircle, DollarSign, Store, Check, X } from 'lucide-react';

interface Promotion {
  id: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  salePrice?: number;
  promotionType: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  stock?: number;
  targetAudience: string[];
  budget?: number;
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'expired';
  submittedAt: string;
  priority: number;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'approved' | 'active'>('pending_approval');
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, [filter]);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`/api/admin/promotions?status=${filter}`);
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Error",
        description: "Failed to load promotions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (promotionId: string, action: 'approve' | 'reject', priority?: number) => {
    try {
      const response = await fetch('/api/admin/promotions/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotionId, action, priority })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Promotion ${action}d successfully`,
        });
        fetchPromotions();
        setSelectedPromotion(null);
      } else {
        throw new Error('Failed to moderate promotion');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate promotion",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      flash_sale: '⚡',
      vendor_special: '🌟',
      new_arrival: '🆕',
      limited_stock: '🔥',
      bundle_deal: '🎁',
      kfar_announcement: '📢'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 stroke-[1.5] animate-spin mb-4" style={{ color: '#478c0b' }} />
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Promotion Management
          </h1>
          <p className="text-gray-600">
            Review and approve vendor promotions for the homepage feed
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {promotions.filter(p => p.status === 'pending_approval').length}
                </p>
              </div>
              <Clock className="w-8 h-8 stroke-[1.5] text-yellow-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {promotions.filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 stroke-[1.5] text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  ₪{promotions.reduce((sum, p) => sum + (p.budget || 0), 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 stroke-[1.5]" style={{ color: '#478c0b' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendors</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(promotions.map(p => p.vendorId)).size}
                </p>
              </div>
              <Store className="w-8 h-8 stroke-[1.5] text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending_approval', 'approved', 'active'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48">
                <Image
                  src={promotion.productImage}
                  alt={promotion.productName}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-2xl">{getTypeIcon(promotion.promotionType)}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(promotion.status)}`}>
                    {promotion.status.replace('_', ' ')}
                  </span>
                </div>
                {promotion.salePrice && (
                  <div className="absolute bottom-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{Math.round(((promotion.originalPrice - promotion.salePrice) / promotion.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Vendor Info */}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>
                    {promotion.vendorName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(promotion.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Promotion Title */}
                <h3 className="font-bold mb-1" style={{ color: '#478c0b' }}>
                  {promotion.title}
                </h3>

                {/* Product Name */}
                <p className="text-sm text-gray-600 mb-2">
                  {promotion.productName}
                </p>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {promotion.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  {promotion.salePrice ? (
                    <>
                      <span className="text-lg font-bold" style={{ color: '#c23c09' }}>
                        ₪{promotion.salePrice}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₪{promotion.originalPrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                      ₪{promotion.originalPrice}
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>Duration: {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}</p>
                  {promotion.stock && <p>Stock: {promotion.stock} units</p>}
                  {promotion.budget && <p>Budget: ₪{promotion.budget}</p>}
                  <p>Audience: {promotion.targetAudience.join(', ') || 'All'}</p>
                </div>

                {/* Actions */}
                {promotion.status === 'pending_approval' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPromotion(promotion)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleApproval(promotion.id, 'approve', 5)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[1.5]" />
                    </button>
                    <button
                      onClick={() => handleApproval(promotion.id, 'reject')}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No promotions found</p>
          </div>
        )}

        {/* Review Modal */}
        {selectedPromotion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                    Review Promotion
                  </h2>
                  <button
                    onClick={() => setSelectedPromotion(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>

                {/* Full Preview */}
                <div className="space-y-4">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedPromotion.productImage}
                      alt={selectedPromotion.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#478c0b' }}>
                      {selectedPromotion.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{selectedPromotion.description}</p>
                  </div>

                  {/* Priority Setting */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                      Display Priority (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      defaultValue={selectedPromotion.priority || 5}
                      className="w-full px-4 py-2 border rounded-lg"
                      id="priorityInput"
                    />
                  </div>

                  {/* Approval Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        const priority = Number((document.getElementById('priorityInput') as HTMLInputElement).value);
                        handleApproval(selectedPromotion.id, 'approve', priority);
                      }}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Approve Promotion
                    </button>
                    <button
                      onClick={() => handleApproval(selectedPromotion.id, 'reject')}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Reject Promotion
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}