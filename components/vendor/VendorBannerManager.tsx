'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { Calendar, MapPin, Clock, Flag, Plus, Eye, MousePointer, ShoppingCart, Pencil, Trash2, Lightbulb } from 'lucide-react';

// Banner templates
const bannerTemplates = {
  sale: {
    id: 'sale',
    name: 'Flash Sale',
    icon: '⚡',
    gradient: 'from-red-600 to-orange-600',
    textColor: 'text-white',
    features: ['Countdown timer', 'Discount percentage', 'CTA button']
  },
  announcement: {
    id: 'announcement',
    name: 'Announcement',
    icon: '📢',
    gradient: 'from-blue-600 to-purple-600',
    textColor: 'text-white',
    features: ['Title', 'Message', 'Link']
  },
  product_highlight: {
    id: 'product_highlight',
    name: 'Product Highlight',
    icon: '⭐',
    gradient: 'from-green-600 to-teal-600',
    textColor: 'text-white',
    features: ['Product image', 'Description', 'Price']
  },
  event: {
    id: 'event',
    name: 'Event/Workshop',
    icon: '🎉',
    gradient: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
    features: ['Date/time', 'Location', 'RSVP button']
  },
  seasonal: {
    id: 'seasonal',
    name: 'Seasonal Special',
    icon: '🌺',
    gradient: 'from-yellow-600 to-red-600',
    textColor: 'text-white',
    features: ['Theme graphics', 'Special offers', 'Limited time']
  },
  custom: {
    id: 'custom',
    name: 'Custom Design',
    icon: '🎨',
    gradient: 'from-gray-600 to-gray-800',
    textColor: 'text-white',
    features: ['Upload image', 'Custom text', 'Full control']
  }
};

interface BannerData {
  id: string;
  template: string;
  isActive: boolean;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
    backgroundColor?: string;
    textColor?: string;
    startDate?: string;
    endDate?: string;
    discount?: number;
    eventDate?: string;
    eventLocation?: string;
  };
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
  };
}

export default function VendorBannerManager({ vendorId }: { vendorId: string }) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('sale');
  const [isCreating, setIsCreating] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Shop Now',
    ctaLink: '',
    image: '',
    backgroundColor: '#478c0b',
    textColor: '#ffffff',
    startDate: '',
    endDate: '',
    discount: 0,
    eventDate: '',
    eventLocation: ''
  });

  useEffect(() => {
    fetchBanners();
  }, [vendorId]);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`/api/vendor/${vendorId}/banners`);
      const data = await response.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const bannerData = {
        vendorId,
        template: selectedTemplate,
        content: formData,
        isActive: true
      };

      const response = await fetch(`/api/vendor/${vendorId}/banners`, {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bannerData,
          bannerId: editingBanner?.id
        })
      });

      if (response.ok) {
        toast({
          title: editingBanner ? "Banner updated!" : "Banner created!",
          description: "Your banner is now live on your store page.",
        });
        
        // Reset form
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          ctaText: 'Shop Now',
          ctaLink: '',
          image: '',
          backgroundColor: '#478c0b',
          textColor: '#ffffff',
          startDate: '',
          endDate: '',
          discount: 0,
          eventDate: '',
          eventLocation: ''
        });
        setIsCreating(false);
        setEditingBanner(null);
        fetchBanners();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save banner. Please try again.",
      });
    }
  };

  const toggleBannerStatus = async (bannerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/vendor/${vendorId}/banners/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast({
          title: isActive ? "Banner activated" : "Banner deactivated",
          description: isActive ? "Your banner is now visible to customers" : "Banner hidden from customers",
        });
        fetchBanners();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banner status",
      });
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/vendor/${vendorId}/banners/${bannerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Banner deleted",
          description: "The banner has been removed from your store",
        });
        fetchBanners();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete banner",
      });
    }
  };

  const renderBannerPreview = () => {
    const template = bannerTemplates[selectedTemplate as keyof typeof bannerTemplates];
    
    return (
      <div className="relative h-48 rounded-lg overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${template.gradient}`} />
        
        {/* Background Image Overlay */}
        {formData.image && (
          <div className="absolute inset-0">
            <Image
              src={formData.image}
              alt="Banner background"
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-8">
          <div className="flex-1">
            {formData.title && (
              <h2 className={`text-3xl font-bold mb-2 ${template.textColor}`}>
                {formData.title}
              </h2>
            )}
            {formData.subtitle && (
              <p className={`text-xl mb-2 ${template.textColor} opacity-90`}>
                {formData.subtitle}
              </p>
            )}
            {formData.description && (
              <p className={`text-sm ${template.textColor} opacity-80`}>
                {formData.description}
              </p>
            )}
            
            {/* Template-specific elements */}
            {selectedTemplate === 'sale' && formData.discount > 0 && (
              <div className="mt-3">
                <span className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-lg">
                  {formData.discount}% OFF
                </span>
              </div>
            )}
            
            {selectedTemplate === 'event' && formData.eventDate && (
              <div className="mt-3 text-sm">
                <p className={`${template.textColor} font-semibold flex items-center`}>
                  <Calendar className="w-4 h-4 stroke-[1.5] mr-2" />
                  {new Date(formData.eventDate).toLocaleDateString()}
                </p>
                {formData.eventLocation && (
                  <p className={`${template.textColor} flex items-center`}>
                    <MapPin className="w-4 h-4 stroke-[1.5] mr-2" />
                    {formData.eventLocation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          {formData.ctaText && (
            <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {formData.ctaText}
            </button>
          )}
        </div>

        {/* Timer for flash sales */}
        {selectedTemplate === 'sale' && formData.endDate && (
          <div className="absolute bottom-4 left-8 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            <Clock className="w-4 h-4 stroke-[1.5] inline mr-2" />
            Ends: {new Date(formData.endDate).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
            Store Banner Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Create eye-catching banners to promote your products and events
          </p>
        </div>
        
        {!isCreating && !editingBanner && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 stroke-[1.5] inline mr-2" />
            Create New Banner
          </button>
        )}
      </div>

      {/* Banner Creation/Editing Form */}
      {(isCreating || editingBanner) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Template Selection */}
          {isCreating && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: '#3a3a1d' }}>
                Choose Banner Template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(bannerTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.features[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Banner Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                placeholder="e.g., Weekend Special - 30% OFF"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                placeholder="e.g., Limited time offer"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
              placeholder="Brief description of your promotion..."
              rows={2}
            />
          </div>

          {/* Template-specific fields */}
          {selectedTemplate === 'sale' && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                  Discount Percentage
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                  min="0"
                  max="100"
                  placeholder="e.g., 30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                />
              </div>
            </div>
          )}

          {selectedTemplate === 'event' && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                  Event Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                  Event Location
                </label>
                <input
                  type="text"
                  value={formData.eventLocation}
                  onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                  placeholder="e.g., Community Center, Room 101"
                />
              </div>
            </div>
          )}

          {/* CTA Configuration */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                placeholder="e.g., Shop Now, Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Button Link
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb', focusRingColor: '#478c0b' }}
                placeholder="e.g., /store/teva-deli/products"
              />
            </div>
          </div>

          {/* Banner Preview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium" style={{ color: '#3a3a1d' }}>
                Preview
              </label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            {previewMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {renderBannerPreview()}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              style={{ backgroundColor: '#478c0b' }}
            >
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingBanner(null);
                setFormData({
                  title: '',
                  subtitle: '',
                  description: '',
                  ctaText: 'Shop Now',
                  ctaLink: '',
                  image: '',
                  backgroundColor: '#478c0b',
                  textColor: '#ffffff',
                  startDate: '',
                  endDate: '',
                  discount: 0,
                  eventDate: '',
                  eventLocation: ''
                });
              }}
              className="px-6 py-3 border font-semibold rounded-lg hover:bg-gray-50 transition-all"
              style={{ borderColor: '#e5e7eb' }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Banners List */}
      {!isCreating && !editingBanner && (
        <div>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
            Your Active Banners
          </h3>
          
          {banners.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Flag className="w-10 h-10 stroke-[1.5] text-gray-400 mb-4 mx-auto" />
              <p className="text-gray-500">No banners created yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Create your first banner to attract more customers!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  style={{ borderColor: banner.isActive ? '#478c0b' : '#e5e7eb' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {bannerTemplates[banner.template as keyof typeof bannerTemplates]?.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>
                          {banner.content.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {bannerTemplates[banner.template as keyof typeof bannerTemplates]?.name} • 
                          {banner.isActive ? (
                            <span className="text-green-600 ml-1">Active</span>
                          ) : (
                            <span className="text-gray-400 ml-1">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Analytics */}
                      <div className="text-sm text-gray-500 mr-4">
                        <span className="mr-3 inline-flex items-center">
                          <Eye className="w-4 h-4 stroke-[1.5] mr-1" />
                          {banner.analytics.views}
                        </span>
                        <span className="mr-3 inline-flex items-center">
                          <MousePointer className="w-4 h-4 stroke-[1.5] mr-1" />
                          {banner.analytics.clicks}
                        </span>
                        <span className="inline-flex items-center">
                          <ShoppingCart className="w-4 h-4 stroke-[1.5] mr-1" />
                          {banner.analytics.conversions}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <button
                        onClick={() => toggleBannerStatus(banner.id, !banner.isActive)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          banner.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setFormData(banner.content);
                          setSelectedTemplate(banner.template);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 stroke-[1.5]" />
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#fef9ef' }}>
        <h4 className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>
          <Lightbulb className="w-5 h-5 stroke-[1.5] inline mr-2" style={{ color: '#f6af0d' }} />
          Banner Best Practices
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Keep your message clear and concise - customers scan quickly</li>
          <li>• Use high-contrast colors for better visibility</li>
          <li>• Include a strong call-to-action to drive conversions</li>
          <li>• Update banners regularly to keep content fresh</li>
          <li>• Test different templates to see what works best</li>
        </ul>
      </div>
    </div>
  );
}