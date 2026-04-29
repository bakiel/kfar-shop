'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ShoppingBag, Star, Users, Truck, Shield,
  CheckCircle, Clock, Sparkles, ChevronRight, Heart
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getFeaturedProducts, getVendors, TOTAL_PRODUCTS } from './archived-data';

// Hero background images for slideshow
const heroImages = [
  '/images/hero/13.jpg',
  '/images/hero/14.jpg',
  '/images/hero/15.jpg',
  '/images/hero/16.jpg',
  '/images/hero/17.jpg',
];

// Animated counter component
const AnimatedCounter = ({
  value,
  suffix = '',
  duration = 2000
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
};

// Featured product card for hero
const HeroProductCard = ({
  product,
  index,
  shouldReduceMotion
}: {
  product: any;
  index: number;
  shouldReduceMotion: boolean | null;
}) => {
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
      whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
      className="group cursor-pointer"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
          {/* Product image */}
          <div className="relative h-32 sm:h-40 overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Badges */}
            {product.badge && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-earth-flame text-white text-xs font-bold rounded-full">
                {product.badge}
              </div>
            )}
            {/* Quick add */}
            <motion.div
              className="absolute bottom-2 right-2 w-10 h-10 bg-leaf-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          {/* Product info */}
          <div className="p-3">
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-leaf-green transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-leaf-green font-bold text-lg">₪{product.price}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-sun-gold text-sun-gold" />
                <span className="text-xs text-gray-500">5.0</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const HeroSection = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const featuredProducts = useMemo(() => getFeaturedProducts(4), []);
  const vendors = useMemo(() => getVendors(), []);

  // Background image slideshow
  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const stats = [
    { value: 500, suffix: '+', label: language === 'he' ? 'משפחות מרוצות' : 'Happy Families', icon: Users },
    { value: TOTAL_PRODUCTS, suffix: '+', label: language === 'he' ? 'מוצרים טבעוניים' : 'Vegan Products', icon: ShoppingBag },
    { value: 50, suffix: '+', label: language === 'he' ? 'שנות מסורת' : 'Years of Heritage', icon: Heart },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Image Slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentImageIndex]}
              alt="Village of Peace"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col justify-center py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left: Main Content */}
            <div className="order-2 lg:order-1">
              {/* Trust badge */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-leaf-green to-emerald-600 border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">
                  {language === 'he' ? 'בחירת 500+ משפחות' : 'Trusted by 500+ families'}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-sun-gold text-sun-gold" />
                  ))}
                </div>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 font-display"
              >
                {language === 'he' ? (
                  <>
                    <span className="block">מוצרים טבעוניים</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sun-gold via-amber-400 to-sun-gold">
                      טריים לפתח ביתך
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">Fresh Vegan</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sun-gold via-amber-400 to-sun-gold">
                      Delivered Daily
                    </span>
                  </>
                )}
              </motion.h1>

              {/* Subheadline with benefits */}
              <motion.p
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg leading-relaxed font-body"
              >
                {language === 'he'
                  ? 'מאות מוצרים טבעוניים איכותיים מ-6 ספקים מקומיים. משלוח באותו יום בדימונה.'
                  : 'Hundreds of premium vegan products from 6 local vendors. Same-day delivery in Dimona.'}
              </motion.p>

              {/* Urgency banner */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-earth-flame/20 to-sun-gold/20 border border-sun-gold/30 mb-8 max-w-md"
              >
                <div className="w-10 h-10 rounded-full bg-sun-gold/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-sun-gold" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {language === 'he' ? 'משלוח חינם מעל ₪150' : 'Free delivery over ₪150'}
                  </p>
                  <p className="text-white/60 text-xs">
                    {language === 'he' ? 'הזמינו היום - קבלו היום!' : 'Order today - get it today!'}
                  </p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <Link href="/shop">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03, boxShadow: '0 20px 40px rgba(71, 140, 11, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-8 py-4 bg-gradient-to-r from-leaf-green to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-3 cursor-pointer shadow-xl shadow-leaf-green/30 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {language === 'he' ? 'התחילו לקנות' : 'Start Shopping'}
                    <motion.span
                      animate={shouldReduceMotion ? {} : { x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </motion.span>
                  </motion.button>
                </Link>

                <Link href="/vendors">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-bold text-lg flex items-center gap-2 cursor-pointer hover:border-white/50 transition-all"
                  >
                    {language === 'he' ? 'הכירו את הספקים' : 'Meet Our Vendors'}
                    <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-3 gap-4 sm:gap-8"
              >
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <Icon className="w-4 h-4 text-sun-gold hidden sm:block" />
                        <span className="text-2xl sm:text-3xl font-bold text-white font-accent">
                          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        </span>
                      </div>
                      <span className="text-white/60 text-xs sm:text-sm font-body">{stat.label}</span>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Right: Product Cards */}
            <div className="order-1 lg:order-2">
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-br from-leaf-green/20 via-transparent to-sun-gold/20 rounded-3xl blur-3xl" />

                {/* Product grid */}
                <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                  {featuredProducts.map((product, index) => (
                    <HeroProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  ))}
                </div>

                {/* View all products link */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-6"
                >
                  <Link href="/shop" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
                    <Sparkles className="w-4 h-4 text-sun-gold" />
                    <span className="font-medium">
                      {language === 'he' ? `עוד ${TOTAL_PRODUCTS - 4}+ מוצרים` : `${TOTAL_PRODUCTS - 4}+ more products`}
                    </span>
                    <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Bottom: Trust badges */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 lg:mt-16"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              {[
                { icon: Truck, text: language === 'he' ? 'משלוח באותו יום' : 'Same-Day Delivery' },
                { icon: Shield, text: language === 'he' ? 'תשלום מאובטח' : 'Secure Payment' },
                { icon: CheckCircle, text: language === 'he' ? '100% טבעוני' : '100% Vegan' },
                { icon: Star, text: language === 'he' ? 'איכות מובטחת' : 'Quality Guaranteed' },
              ].map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-white/80">
                    <div className="w-8 h-8 rounded-full bg-leaf-green/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-leaf-green" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vendor logos ticker */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-6"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 overflow-hidden">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendor/${vendor.id}`}>
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 cursor-pointer hover:border-sun-gold/50 transition-colors"
                >
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
