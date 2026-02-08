'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { toast } from '@/components/ui/use-toast';

// Feed item types
type FeedItemType = 'flash_sale' | 'new_arrival' | 'vendor_special' | 'kfar_announcement' | 'limited_stock' | 'bundle_deal';

interface FeedItem {
  id: string;
  type: FeedItemType;
  vendor: {
    id: string;
    name: string;
    logo: string;
  };
  product: {
    id: string;
    name: string;
    image: string;
    originalPrice: number;
    salePrice?: number;
    discount?: number;
    stock?: number;
  };
  promotion: {
    title: string;
    description: string;
    endTime?: Date;
    urgency?: string;
    badge?: string;
  };
  interaction: {
    likes: number;
    shares: number;
    hasLiked: boolean;
  };
  adminApproved: boolean;
  priority: number;
}

// Create stable dates for SSR/hydration
const getStableEndTime = (hoursFromNow: number) => {
  // Return a stable date for SSR - will be updated on client
  if (typeof window === 'undefined') {
    // Server-side: return a fixed future date
    return new Date('2025-12-31T23:59:59Z');
  }
  // Client-side: return actual dynamic date
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
};

// Mock data - In production, this would come from Supabase
const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'flash_sale',
    vendor: {
      id: 'teva-deli',
      name: 'Teva Deli',
      logo: '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg'
    },
    product: {
      id: 'schnitzel-special',
      name: 'Vegan Schnitzel Platter',
      image: '/images/teva-deli/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
      originalPrice: 45,
      salePrice: 32,
      discount: 29,
      stock: 8
    },
    promotion: {
      title: '⚡ FLASH SALE - 29% OFF',
      description: 'Fresh made today! Limited quantity',
      endTime: getStableEndTime(2), // 2 hours
      urgency: 'Only 8 left!',
      badge: 'HOT DEAL'
    },
    interaction: {
      likes: 124,
      shares: 23,
      hasLiked: false
    },
    adminApproved: true,
    priority: 1
  },
  {
    id: '2',
    type: 'kfar_announcement',
    vendor: {
      id: 'garden-of-light',
      name: 'Garden of Light',
      logo: '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg'
    },
    product: {
      id: 'weekly-harvest',
      name: 'Weekly Harvest Box',
      image: '/images/garden-of-light/1.jpg',
      originalPrice: 120,
      salePrice: 89
    },
    promotion: {
      title: '🌟 NEW: Community Harvest Box',
      description: 'Support local farmers - 7 fresh items from Village of Peace gardens',
      badge: 'COMMUNITY SPECIAL'
    },
    interaction: {
      likes: 256,
      shares: 45,
      hasLiked: true
    },
    adminApproved: true,
    priority: 2
  },
  {
    id: '3',
    type: 'vendor_special',
    vendor: {
      id: 'vop-shop',
      name: 'VOP Shop',
      logo: '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg'
    },
    product: {
      id: 'wellness-book',
      name: 'Holistic Health Guide',
      image: '/images/vop-shop/vop_shop_wellness_education_product_11_healing_books_holistic_health_community_wisdom.jpg',
      originalPrice: 75,
      salePrice: 65
    },
    promotion: {
      title: '📚 Wellness Weekend Special',
      description: 'Transform your health journey - Community wisdom for holistic living',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      badge: 'WELLNESS DEAL'
    },
    interaction: {
      likes: 89,
      shares: 12,
      hasLiked: false
    },
    adminApproved: true,
    priority: 3
  }
];

export default function SpecialFeedSection() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const autoScrollRef = useRef<NodeJS.Timeout>();
  
  // Initialize feed items on client to avoid hydration mismatch
  useEffect(() => {
    setFeedItems(mockFeedItems);
  }, []);

  // Auto-rotate through items
  useEffect(() => {
    if (!isPaused) {
      autoScrollRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % feedItems.length);
      }, 5000);
    }
    return () => clearInterval(autoScrollRef.current);
  }, [isPaused, feedItems.length]);

  const handleQuickAdd = (item: FeedItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.salePrice || item.product.originalPrice,
      vendor: item.vendor.name,
      image: item.product.image,
      quantity: 1
    });

    toast({
      title: "Added to cart!",
      description: `${item.product.name} from ${item.vendor.name}`,
    });
  };

  const handleLike = (itemId: string) => {
    setFeedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            interaction: { 
              ...item.interaction, 
              hasLiked: !item.interaction.hasLiked,
              likes: item.interaction.hasLiked 
                ? item.interaction.likes - 1 
                : item.interaction.likes + 1
            }
          }
        : item
    ));
  };

  const getTemplateByType = (type: FeedItemType) => {
    switch(type) {
      case 'flash_sale':
        return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'kfar_announcement':
        return 'bg-gradient-to-r from-green-600 to-green-700';
      case 'vendor_special':
        return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case 'new_arrival':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'limited_stock':
        return 'bg-gradient-to-r from-yellow-600 to-red-600';
      case 'bundle_deal':
        return 'bg-gradient-to-r from-indigo-600 to-purple-600';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTimeLeft = (endTime: Date) => {
    // Return placeholder during SSR to avoid hydration mismatch
    if (!isClient) {
      return 'Loading...';
    }
    
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Don't render until client-side initialization to avoid hydration issues
  if (feedItems.length === 0) {
    return (
      <section className="relative py-8 overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-sun-gold rounded-full animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-leaf-green rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full mb-4"
          >
            <span className="animate-pulse">🔥</span>
            <span className="font-semibold">{t('Live Marketplace Feed')}</span>
            <span className="animate-pulse">🔥</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
            {t("Today's Special Deals")}
          </h2>
          <p className="text-gray-600">{t('Fresh promotions from our vendors • Updated every hour')}</p>
        </div>

        {/* Main Feed Display */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={feedItems[activeIndex].id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Product Image Side */}
                <div className="relative h-96 md:h-auto">
                  <Image
                    src={feedItems[activeIndex].product.image}
                    alt={feedItems[activeIndex].product.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {feedItems[activeIndex].promotion.badge && (
                      <span className={`inline-block px-4 py-2 text-white font-bold rounded-full text-sm ${getTemplateByType(feedItems[activeIndex].type)}`}>
                        {feedItems[activeIndex].promotion.badge}
                      </span>
                    )}
                    {feedItems[activeIndex].product.discount && (
                      <span className="block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{feedItems[activeIndex].product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Stock/Urgency Indicator */}
                  {feedItems[activeIndex].promotion.urgency && (
                    <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg">
                      <p className="text-sm font-semibold animate-pulse">
                        {feedItems[activeIndex].promotion.urgency}
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Side */}
                <div className="p-8 flex flex-col">
                  {/* Vendor Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={feedItems[activeIndex].vendor.logo}
                        alt={feedItems[activeIndex].vendor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#3a3a1d' }}>
                        {feedItems[activeIndex].vendor.name}
                      </p>
                      {feedItems[activeIndex].promotion.endTime && (
                        <p className="text-sm text-gray-600">
                          {t('Ends in')} {formatTimeLeft(feedItems[activeIndex].promotion.endTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promotion Title */}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#478c0b' }}>
                    {feedItems[activeIndex].promotion.title}
                  </h3>

                  {/* Product Name */}
                  <h4 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                    {feedItems[activeIndex].product.name}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 flex-grow">
                    {feedItems[activeIndex].promotion.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {feedItems[activeIndex].product.salePrice ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold" style={{ color: '#c23c09' }}>
                          ₪{feedItems[activeIndex].product.salePrice}
                        </span>
                        <span className="text-xl text-gray-400 line-through">
                          ₪{feedItems[activeIndex].product.originalPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold" style={{ color: '#478c0b' }}>
                        ₪{feedItems[activeIndex].product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => handleQuickAdd(feedItems[activeIndex])}
                      className="flex-1 px-6 py-3 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      style={{ backgroundColor: '#478c0b' }}
                    >
                      {t('Quick Add to Cart')}
                    </button>
                    <Link
                      href={`/product/${feedItems[activeIndex].product.id}`}
                      className="px-6 py-3 border-2 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                      style={{ borderColor: '#478c0b', color: '#478c0b' }}
                    >
                      {t('View Details')}
                    </Link>
                  </div>

                  {/* Social Interactions */}
                  <div className="flex items-center gap-6 text-sm">
                    <button
                      onClick={() => handleLike(feedItems[activeIndex].id)}
                      className="flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <i className={`${feedItems[activeIndex].interaction.hasLiked ? 'fas' : 'far'} fa-heart text-red-500`} />
                      <span>{feedItems[activeIndex].interaction.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:scale-105 transition-transform">
                      <i className="far fa-share-square text-blue-500" />
                      <span>{feedItems[activeIndex].interaction.shares}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:scale-105 transition-transform">
                      <i className="far fa-bookmark text-gray-500" />
                      <span>{t('Save')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {feedItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex 
                    ? 'w-8 bg-leaf-green' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={index === activeIndex ? { backgroundColor: '#478c0b' } : {}}
              />
            ))}
          </div>

          {/* Side Navigation */}
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + feedItems.length) % feedItems.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            <i className="fas fa-chevron-left" style={{ color: '#478c0b' }} />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % feedItems.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            <i className="fas fa-chevron-right" style={{ color: '#478c0b' }} />
          </button>
        </div>

        {/* Quick Feed Thumbnails */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {feedItems.slice(0, 4).map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => setActiveIndex(feedItems.indexOf(item))}
            >
              <div className="relative h-32">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
                {item.product.discount && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    -{item.product.discount}%
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold truncate" style={{ color: '#3a3a1d' }}>
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-600">{item.vendor.name}</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#c23c09' }}>
                  ₪{item.product.salePrice || item.product.originalPrice}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* See All Deals Button */}
        <div className="text-center mt-8">
          <Link
            href="/marketplace/deals"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            <span>{t('View All Special Deals')}</span>
            <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}