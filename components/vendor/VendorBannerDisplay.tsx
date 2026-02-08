'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface BannerContent {
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
}

interface VendorBanner {
  id: string;
  template: string;
  content: BannerContent;
  isActive: boolean;
}

const bannerTemplates = {
  sale: {
    gradient: 'from-red-600 to-orange-600',
    icon: '⚡'
  },
  announcement: {
    gradient: 'from-blue-600 to-purple-600',
    icon: '📢'
  },
  product_highlight: {
    gradient: 'from-green-600 to-teal-600',
    icon: '⭐'
  },
  event: {
    gradient: 'from-purple-600 to-pink-600',
    icon: '🎉'
  },
  seasonal: {
    gradient: 'from-yellow-600 to-red-600',
    icon: '🌺'
  },
  custom: {
    gradient: 'from-gray-600 to-gray-800',
    icon: '🎨'
  }
};

export default function VendorBannerDisplay({ vendorId }: { vendorId: string }) {
  const [banners, setBanners] = useState<VendorBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchActiveBanners();
  }, [vendorId]);

  // Auto-rotate banners if multiple
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 8000); // Change every 8 seconds
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Countdown timer for sales
  useEffect(() => {
    const currentBanner = banners[currentBannerIndex];
    if (currentBanner?.template === 'sale' && currentBanner.content.endDate) {
      const timer = setInterval(() => {
        const end = new Date(currentBanner.content.endDate!).getTime();
        const now = new Date().getTime();
        const distance = end - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          }
        } else {
          setTimeLeft('Sale Ended');
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
      console.error('Error fetching banners:', error);
    }
  };

  const trackBannerClick = async (bannerId: string) => {
    try {
      await fetch(`/api/vendor/${vendorId}/banners/${bannerId}/click`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentBannerIndex];
  const template = bannerTemplates[currentBanner.template as keyof typeof bannerTemplates];

  return (
    <div className="relative mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative h-48 md:h-56 rounded-xl overflow-hidden shadow-2xl"
        >
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${template.gradient}`} />
          
          {/* Background Image */}
          {currentBanner.content.image && (
            <div className="absolute inset-0">
              <Image
                src={currentBanner.content.image}
                alt="Banner background"
                fill
                className="object-cover opacity-20"
              />
            </div>
          )}

          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-64 h-64 bg-white rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-white rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-8 md:px-12">
            <div className="flex-1 max-w-3xl">
              {/* Badge */}
              {currentBanner.template === 'sale' && currentBanner.content.discount && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-block mb-3"
                >
                  <span className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    {currentBanner.content.discount}% OFF
                  </span>
                </motion.div>
              )}

              {/* Title */}
              {currentBanner.content.title && (
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-4xl font-bold text-white mb-2"
                >
                  {currentBanner.content.title}
                </motion.h2>
              )}

              {/* Subtitle */}
              {currentBanner.content.subtitle && (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-white/90 mb-2"
                >
                  {currentBanner.content.subtitle}
                </motion.p>
              )}

              {/* Description */}
              {currentBanner.content.description && (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm md:text-base text-white/80 mb-4 max-w-xl"
                >
                  {currentBanner.content.description}
                </motion.p>
              )}

              {/* Event Details */}
              {currentBanner.template === 'event' && currentBanner.content.eventDate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 text-white/90 text-sm mb-4"
                >
                  <span>
                    <i className="far fa-calendar mr-2" />
                    {new Date(currentBanner.content.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {currentBanner.content.eventLocation && (
                    <span>
                      <i className="fas fa-map-marker-alt mr-2" />
                      {currentBanner.content.eventLocation}
                    </span>
                  )}
                </motion.div>
              )}

              {/* CTA Button */}
              {currentBanner.content.ctaText && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  {currentBanner.content.ctaLink ? (
                    <Link
                      href={currentBanner.content.ctaLink}
                      onClick={() => trackBannerClick(currentBanner.id)}
                      className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                    >
                      {currentBanner.content.ctaText}
                      <i className="fas fa-arrow-right" />
                    </Link>
                  ) : (
                    <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
                      {currentBanner.content.ctaText}
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Side Elements */}
            <div className="hidden md:block">
              {/* Timer for Sales */}
              {currentBanner.template === 'sale' && timeLeft && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-black/30 backdrop-blur-sm text-white px-6 py-4 rounded-lg text-center"
                >
                  <p className="text-sm opacity-80 mb-1">Sale ends in</p>
                  <p className="text-2xl font-bold font-mono">{timeLeft}</p>
                </motion.div>
              )}

              {/* Template Icon */}
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 0.2 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-6xl md:text-8xl text-white"
              >
                {template.icon}
              </motion.div>
            </div>
          </div>

          {/* Mobile Timer */}
          {currentBanner.template === 'sale' && timeLeft && (
            <div className="md:hidden absolute bottom-4 left-8 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
              <i className="far fa-clock mr-2" />
              Ends: {timeLeft}
            </div>
          )}

          {/* Banner Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 right-8 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBannerIndex
                      ? 'w-8 bg-white'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats Bar */}
      {currentBanner.template === 'sale' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute -bottom-6 left-8 right-8 bg-white rounded-lg shadow-lg p-4 flex items-center justify-around text-center"
        >
          <div>
            <p className="text-sm text-gray-600">Free Delivery</p>
            <p className="font-semibold" style={{ color: '#478c0b' }}>Orders > ₪50</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-600">Limited Stock</p>
            <p className="font-semibold" style={{ color: '#c23c09' }}>Order Now!</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-600">Community Favorite</p>
            <p className="font-semibold" style={{ color: '#f6af0d' }}>⭐⭐⭐⭐⭐</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}