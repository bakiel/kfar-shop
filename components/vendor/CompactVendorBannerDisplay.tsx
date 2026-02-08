'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerContent {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  discount?: number;
  endDate?: string;
}

interface VendorBanner {
  id: string;
  template: string;
  content: BannerContent;
  isActive: boolean;
}

export default function CompactVendorBannerDisplay({ vendorId }: { vendorId: string }) {
  const [banners, setBanners] = useState<VendorBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    // Check for dismissal in sessionStorage
    const dismissalKey = `vendor_banner_dismissed_${vendorId}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(dismissalKey) === 'true') {
      setIsDismissed(true);
    }
    fetchActiveBanners();
  }, [vendorId]);

  // Auto-rotate banners if multiple
  useEffect(() => {
    if (banners.length > 1 && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [banners.length, isDismissed]);

  // Countdown timer for sales
  useEffect(() => {
    const currentBanner = banners[currentBannerIndex];
    if (currentBanner?.template === 'sale' && currentBanner.content.endDate) {
      const timer = setInterval(() => {
        const end = new Date(currentBanner.content.endDate!).getTime();
        const now = new Date().getTime();
        const distance = end - now;

        if (distance > 0) {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft('Ended');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [banners, currentBannerIndex]);

  const fetchActiveBanners = async () => {
    try {
      const response = await fetch(`/api/vendor/${vendorId}/banners/active`);
      const data = await response.json();
      setBanners(data.banners || []);
    } catch (error) {
      // Fallback to mock data for demonstration
      setBanners([
        {
          id: '1',
          template: 'sale',
          content: {
            title: 'Weekend Special',
            description: 'Save on select items',
            discount: 20,
            ctaText: 'Shop Now',
            endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          },
          isActive: true
        }
      ]);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    const dismissalKey = `vendor_banner_dismissed_${vendorId}_${new Date().toDateString()}`;
    sessionStorage.setItem(dismissalKey, 'true');
  };

  if (banners.length === 0 || isDismissed) return null;

  const currentBanner = banners[currentBannerIndex];

  const getBannerStyle = (template: string) => {
    switch (template) {
      case 'sale':
        return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'announcement':
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'product_highlight':
        return 'bg-gradient-to-r from-green-500 to-teal-500';
      case 'event':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="relative mb-6">
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4"
          >
            <div className={`relative rounded-lg shadow-md overflow-hidden ${getBannerStyle(currentBanner.template)}`}>
              <div className="flex items-center p-4 text-white">
                {/* Content */}
                <div className="flex-1 flex items-center gap-4">
                  {currentBanner.content.discount && (
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-bold">
                      {currentBanner.content.discount}% OFF
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {currentBanner.content.title}
                    </h3>
                    {currentBanner.content.description && (
                      <p className="text-sm opacity-90">
                        {currentBanner.content.description}
                      </p>
                    )}
                  </div>

                  {timeLeft && (
                    <div className="hidden md:flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Ends in {timeLeft}</span>
                    </div>
                  )}

                  {currentBanner.content.ctaText && (
                    <Link
                      href={currentBanner.content.ctaLink || '#'}
                      className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors text-sm"
                    >
                      {currentBanner.content.ctaText}
                    </Link>
                  )}
                </div>

                {/* Navigation for multiple banners */}
                {banners.length > 1 && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setCurrentBannerIndex((prev - 1 + banners.length) % banners.length)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs">
                      {currentBannerIndex + 1}/{banners.length}
                    </span>
                    <button
                      onClick={() => setCurrentBannerIndex((prev + 1) % banners.length)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}