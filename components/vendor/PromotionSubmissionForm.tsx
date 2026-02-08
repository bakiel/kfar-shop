'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';

type PromotionType = 'flash_sale' | 'vendor_special' | 'new_arrival' | 'limited_stock' | 'bundle_deal';

interface PromotionFormData {
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  salePrice?: number;
  promotionType: PromotionType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  stock?: number;
  targetAudience: string[];
  budget?: number;
}

export default function PromotionSubmissionForm({ vendorId }: { vendorId: string }) {
  const [formData, setFormData] = useState<PromotionFormData>({
    productId: '',
    productName: '',
    productImage: '',
    originalPrice: 0,
    promotionType: 'vendor_special',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: []
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const promotionTemplates = {
    flash_sale: {
      icon: '⚡',
      color: 'from-red-500 to-orange-500',
      title: 'Flash Sale',
      description: 'Limited time offer with significant discount'
    },
    vendor_special: {
      icon: '🌟',
      color: 'from-purple-600 to-pink-600',
      title: 'Vendor Special',
      description: 'Your unique promotion or bundle'
    },
    new_arrival: {
      icon: '🆕',
      color: 'from-blue-600 to-cyan-600',
      title: 'New Arrival',
      description: 'Showcase your latest products'
    },
    limited_stock: {
      icon: '🔥',
      color: 'from-yellow-600 to-red-600',
      title: 'Limited Stock',
      description: 'Create urgency with low stock alerts'
    },
    bundle_deal: {
      icon: '🎁',
      color: 'from-indigo-600 to-purple-600',
      title: 'Bundle Deal',
      description: 'Offer multiple products together'
    }
  };

  const audienceOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'vegan', label: 'Vegan Community' },
    { value: 'kosher', label: 'Kosher Shoppers' },
    { value: 'organic', label: 'Organic Enthusiasts' },
    { value: 'families', label: 'Families' },
    { value: 'tourists', label: 'Tourists' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vendor/promotions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          ...formData,
          status: 'pending_approval'
        })
      });

      if (response.ok) {
        toast({
          title: "Promotion submitted!",
          description: "Your promotion is pending admin approval.",
        });
        // Reset form
        setFormData({
          productId: '',
          productName: '',
          productImage: '',
          originalPrice: 0,
          promotionType: 'vendor_special',
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          targetAudience: []
        });
        setPreviewMode(false);
      } else {
        throw new Error('Failed to submit promotion');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit promotion. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDiscount = () => {
    if (formData.salePrice && formData.originalPrice) {
      return Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
            Create Promotion
          </h2>
          <p className="text-gray-600 mt-1">
            Submit a promotion for the homepage feed
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#478c0b', color: '#478c0b' }}
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {!previewMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Promotion Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#3a3a1d' }}>
              Promotion Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(promotionTemplates).map(([type, template]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, promotionType: type as PromotionType })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.promotionType === type
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <div className="text-sm font-medium">{template.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Product Image URL *
              </label>
              <input
                type="url"
                value={formData.productImage}
                onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Original Price (₪) *
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Sale Price (₪)
              </label>
              <input
                type="number"
                value={formData.salePrice || ''}
                onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) || undefined })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Discount
              </label>
              <div className="w-full px-4 py-2 bg-gray-100 rounded-lg text-center font-bold" style={{ color: '#c23c09' }}>
                {calculateDiscount()}% OFF
              </div>
            </div>
          </div>

          {/* Promotion Details */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
              Promotion Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
              placeholder="e.g., Weekend Special - 30% OFF"
              required
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
              placeholder="Describe what makes this promotion special..."
              rows={3}
              required
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/150 characters</p>
          </div>

          {/* Schedule */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                required
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#3a3a1d' }}>
              Target Audience
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {audienceOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: formData.targetAudience.includes(option.value) ? '#478c0b' : '#e5e7eb' }}
                >
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetAudience: [...formData.targetAudience, option.value] });
                      } else {
                        setFormData({ ...formData, targetAudience: formData.targetAudience.filter(t => t !== option.value) });
                      }
                    }}
                    className="text-green-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Available Stock (optional)
              </label>
              <input
                type="number"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || undefined })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                min="0"
                placeholder="Show limited stock"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Promotion Budget (₪)
              </label>
              <input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) || undefined })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                min="0"
                step="10"
                placeholder="Future: Paid placement"
              />
            </div>
          </div>

          {/* Pricing Info */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fef9ef' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>
              Promotion Pricing (Coming Soon)
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Basic placement: Free during launch period</p>
              <p>• Priority placement: ₪50/day (top rotation)</p>
              <p>• Featured banner: ₪100/day (guaranteed visibility)</p>
              <p>• Performance-based: ₪5 per conversion</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: '#478c0b' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit for Approval'
              )}
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                productId: '',
                productName: '',
                productImage: '',
                originalPrice: 0,
                promotionType: 'vendor_special',
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                targetAudience: []
              })}
              className="px-6 py-3 border font-semibold rounded-lg hover:bg-gray-50 transition-all"
              style={{ borderColor: '#e5e7eb' }}
            >
              Clear
            </button>
          </div>
        </form>
      ) : (
        // Preview Mode
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
              Preview how your promotion will appear
            </h3>
            
            {/* Mini Preview Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
              <div className="relative h-48">
                {formData.productImage && (
                  <Image
                    src={formData.productImage}
                    alt={formData.productName}
                    fill
                    className="object-cover"
                  />
                )}
                {calculateDiscount() > 0 && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{calculateDiscount()}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold mb-1" style={{ color: '#478c0b' }}>
                  {formData.title || 'Promotion Title'}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {formData.productName || 'Product Name'}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {formData.description || 'Promotion description...'}
                </p>
                <div className="flex items-baseline gap-2">
                  {formData.salePrice ? (
                    <>
                      <span className="text-xl font-bold" style={{ color: '#c23c09' }}>
                        ₪{formData.salePrice}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₪{formData.originalPrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold" style={{ color: '#478c0b' }}>
                      ₪{formData.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}