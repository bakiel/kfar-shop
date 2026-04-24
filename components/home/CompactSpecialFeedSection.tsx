'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { toast } from '@/components/ui/use-toast';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { ChevronLeft, ChevronRight, Clock, ShoppingCart, X, Tag } from 'lucide-react';

// Same types as SpecialFeedSection
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

/**
 * Transform landing API data into feed items.
 */
function transformLandingData(data: any): FeedItem[] {
  const items: FeedItem[] = [];

  // Transform flash deals
  if (data.flashDeals && Array.isArray(data.flashDeals)) {
    data.flashDeals.forEach((deal: any, idx: number) => {
      items.push({
        id: `flash-${deal.id}`,
        type: 'flash_sale',
        vendor: {
          id: deal.vendorId || '',
          name: deal.vendorName || 'KFAR Vendor',
          logo: '/images/default_logo.svg',
        },
        product: {
          id: deal.productId,
          name: deal.productName,
          image: deal.productImage || '/images/default_logo.svg',
          originalPrice: deal.originalPrice,
          salePrice: deal.dealPrice,
          discount: deal.savingsPercent,
          stock: deal.stockRemaining,
        },
        promotion: {
          title: `${deal.savingsPercent}% OFF`,
          description: `Save on ${deal.productName}`,
          endTime: deal.endsAt ? new Date(deal.endsAt) : undefined,
          urgency: deal.stockRemaining <= 5 ? `Only ${deal.stockRemaining} left!` : undefined,
          badge: 'FLASH',
        },
        interaction: { likes: 0, shares: 0, hasLiked: false },
        adminApproved: true,
        priority: idx,
      });
    });
  }

  // Transform featured products with sale prices
  if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
    data.featuredProducts
      .filter((p: any) => p.originalPrice && p.originalPrice > p.price)
      .slice(0, 4)
      .forEach((product: any, idx: number) => {
        const discount = Math.round((1 - product.price / product.originalPrice) * 100);
        items.push({
          id: `product-${product.id}`,
          type: 'vendor_special',
          vendor: {
            id: product.vendorId,
            name: product.vendorName,
            logo: product.vendorLogo || '/images/default_logo.svg',
          },
          product: {
            id: product.id,
            name: product.name,
            image: product.image || '/images/default_logo.svg',
            originalPrice: product.originalPrice,
            salePrice: product.price,
            discount,
          },
          promotion: {
            title: `${discount}% OFF`,
            description: product.description || `Special from ${product.vendorName}`,
            badge: 'DEAL',
          },
          interaction: { likes: 0, shares: 0, hasLiked: false },
          adminApproved: true,
          priority: items.length + idx,
        });
      });
  }

  return items;
}

export default function CompactSpecialFeedSection() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullBanner, setShowFullBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isMobile, isTablet } = useMobileDetect();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real data from landing API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/landing');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const items = transformLandingData(data);
        setFeedItems(items);
      } catch (err) {
        console.error('Error fetching compact feed data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll for desktop only
  useEffect(() => {
    if (!isMobile && !isTablet && !showFullBanner && feedItems.length > 1) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % feedItems.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [isMobile, isTablet, showFullBanner, feedItems.length]);

  const handleQuickAdd = (item: FeedItem) => {
    if (item.product.originalPrice === 0) return;

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
      description: `${item.product.name}`,
    });
  };

  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isDismissed) return null;

  // Loading state
  if (loading) {
    return (
      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex gap-3">
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-40 bg-gray-200 rounded-lg flex-1 hidden md:block"></div>
            <div className="h-40 bg-gray-200 rounded-lg flex-1 hidden md:block"></div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state -- no deals available, hide the section
  if (feedItems.length === 0) {
    return null;
  }

  // Mobile View - Horizontal Scroll
  if (isMobile) {
    return (
      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 stroke-[1.5] text-red-500" />
              <h3 className="font-semibold text-gray-800">Today&apos;s Deals</h3>
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
          >
            {feedItems.map((item) => (
              <motion.div
                key={item.id}
                className="flex-shrink-0 w-72 snap-start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="relative h-32">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    {item.promotion.badge && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {item.promotion.badge}
                      </span>
                    )}
                    {item.product.discount && (
                      <span className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        -{item.product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={item.vendor.logo}
                        alt={item.vendor.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="text-xs text-gray-600">{item.vendor.name}</span>
                    </div>

                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.product.name}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">{item.promotion.description}</p>

                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {item.product.salePrice ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-red-600">&#8362;{item.product.salePrice}</span>
                            <span className="text-xs text-gray-400 line-through">&#8362;{item.product.originalPrice}</span>
                          </div>
                        ) : item.product.originalPrice > 0 ? (
                          <span className="text-lg font-bold text-green-600">&#8362;{item.product.originalPrice}</span>
                        ) : null}
                      </div>
                      {item.promotion.endTime && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeLeft(item.promotion.endTime)}
                        </span>
                      )}
                    </div>

                    {item.product.originalPrice > 0 && (
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="w-full bg-[#478c0b] text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center mt-3">
            <Link href="/marketplace/deals" className="text-sm text-[#478c0b] font-medium">
              View all deals
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Desktop/Tablet View - Compact Banner
  return (
    <section className="py-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {!showFullBanner ? (
            // Compact Banner View
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="flex items-center">
                {/* Image */}
                <div className="relative w-48 h-32 flex-shrink-0">
                  <Image
                    src={feedItems[activeIndex].product.image}
                    alt={feedItems[activeIndex].product.name}
                    fill
                    className="object-cover"
                  />
                  {feedItems[activeIndex].promotion.badge && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {feedItems[activeIndex].promotion.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Image
                          src={feedItems[activeIndex].vendor.logo}
                          alt={feedItems[activeIndex].vendor.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="text-sm text-gray-600">{feedItems[activeIndex].vendor.name}</span>
                        {feedItems[activeIndex].promotion.endTime && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeLeft(feedItems[activeIndex].promotion.endTime)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{feedItems[activeIndex].promotion.title}</h3>
                      <p className="text-sm text-gray-600">{feedItems[activeIndex].product.name} - {feedItems[activeIndex].promotion.description}</p>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center gap-4 ml-4">
                      {feedItems[activeIndex].product.originalPrice > 0 && (
                        <div className="text-right">
                          {feedItems[activeIndex].product.salePrice ? (
                            <>
                              <span className="text-2xl font-bold text-red-600">&#8362;{feedItems[activeIndex].product.salePrice}</span>
                              <span className="text-sm text-gray-400 line-through block">&#8362;{feedItems[activeIndex].product.originalPrice}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-green-600">&#8362;{feedItems[activeIndex].product.originalPrice}</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {feedItems[activeIndex].product.originalPrice > 0 && (
                          <button
                            onClick={() => handleQuickAdd(feedItems[activeIndex])}
                            className="bg-[#478c0b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3a7009] transition-colors cursor-pointer"
                          >
                            Quick Add
                          </button>
                        )}
                        <button
                          onClick={() => setShowFullBanner(true)}
                          className="border border-[#478c0b] text-[#478c0b] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                {feedItems.length > 1 && (
                  <div className="flex items-center gap-2 px-4">
                    <button
                      onClick={() => setActiveIndex((prev) => (prev - 1 + feedItems.length) % feedItems.length)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setActiveIndex((prev) => (prev + 1) % feedItems.length)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}

                {/* Dismiss */}
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-2 mr-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Dots */}
              {feedItems.length > 1 && (
                <div className="flex justify-center gap-1 pb-2">
                  {feedItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        index === activeIndex ? 'w-4 bg-[#478c0b]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // Full Banner View (on demand)
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="relative">
                <button
                  onClick={() => setShowFullBanner(false)}
                  className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid md:grid-cols-2">
                  <div className="relative h-80">
                    <Image
                      src={feedItems[activeIndex].product.image}
                      alt={feedItems[activeIndex].product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={feedItems[activeIndex].vendor.logo}
                        alt={feedItems[activeIndex].vendor.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{feedItems[activeIndex].vendor.name}</p>
                        {feedItems[activeIndex].promotion.endTime && (
                          <p className="text-sm text-gray-600">
                            Ends in {formatTimeLeft(feedItems[activeIndex].promotion.endTime)}
                          </p>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2 text-[#478c0b]">
                      {feedItems[activeIndex].promotion.title}
                    </h3>
                    <h4 className="text-xl font-semibold mb-4">
                      {feedItems[activeIndex].product.name}
                    </h4>
                    <p className="text-gray-600 mb-6">
                      {feedItems[activeIndex].promotion.description}
                    </p>

                    {feedItems[activeIndex].product.originalPrice > 0 && (
                      <div className="mb-6">
                        {feedItems[activeIndex].product.salePrice ? (
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-red-600">
                              &#8362;{feedItems[activeIndex].product.salePrice}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                              &#8362;{feedItems[activeIndex].product.originalPrice}
                            </span>
                            {feedItems[activeIndex].product.discount && (
                              <span className="text-sm text-green-600 font-medium">
                                Save {feedItems[activeIndex].product.discount}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-3xl font-bold text-green-600">
                            &#8362;{feedItems[activeIndex].product.originalPrice}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      {feedItems[activeIndex].product.originalPrice > 0 && (
                        <button
                          onClick={() => handleQuickAdd(feedItems[activeIndex])}
                          className="flex-1 bg-[#478c0b] text-white py-3 rounded-lg font-semibold hover:bg-[#3a7009] transition-colors cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      )}
                      <Link
                        href={feedItems[activeIndex].type === 'kfar_announcement' ? '/marketplace' : `/product/${feedItems[activeIndex].product.id}`}
                        className="flex-1 text-center border-2 border-[#478c0b] text-[#478c0b] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnail Strip - Desktop Only */}
        {!isMobile && !showFullBanner && feedItems.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {feedItems.slice(0, 4).map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                whileHover={{ scale: 1.05 }}
                className={`bg-white rounded-lg p-2 shadow-sm border-2 transition-all cursor-pointer ${
                  index === activeIndex ? 'border-[#478c0b]' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                  <div className="text-left flex-1">
                    <p className="text-xs font-semibold line-clamp-1">{item.product.name}</p>
                    {item.product.originalPrice > 0 && (
                      <p className="text-xs text-red-600 font-bold">
                        &#8362;{item.product.salePrice || item.product.originalPrice}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
