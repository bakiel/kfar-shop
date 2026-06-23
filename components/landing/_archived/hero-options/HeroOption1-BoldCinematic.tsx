'use client';

/**
 * HERO OPTION 1: BOLD CINEMATIC
 *
 * Design Direction:
 * - Full-bleed dramatic imagery with cinematic overlays
 * - Large, impactful typography that commands attention
 * - Floating product elements with parallax effect
 * - Video-style autoplay background (images as fallback)
 * - Strong contrast and bold color accents
 *
 * Best for: Making a powerful first impression, luxury feel
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ShoppingBag, Star, Play, ChevronDown,
  Leaf, Shield, Truck, Clock
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getFeaturedProducts, TOTAL_PRODUCTS, VENDOR_COUNT } from '../archived-data';

const heroImages = [
  '/images/hero/13.jpg',
  '/images/hero/14.jpg',
  '/images/hero/15.jpg',
  '/images/hero/16.jpg',
  '/images/hero/17.jpg',
];

const HeroOption1BoldCinematic = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const featuredProducts = getFeaturedProducts(3);

  useEffect(() => {
    setIsLoaded(true);
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <section className="relative h-screen min-h-[800px] overflow-hidden bg-black" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' as const }}
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

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

        {/* Film grain effect */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            {/* Left Content - 7 columns */}
            <div className="lg:col-span-7">
              {/* Eyebrow */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="h-px w-12 bg-sun-gold" />
                <span className="text-sun-gold font-semibold tracking-[0.3em] uppercase text-sm">
                  {language === 'he' ? 'כפר השלום' : 'Village of Peace'}
                </span>
              </motion.div>

              {/* Main Headline - Cinematic Typography */}
              <motion.h1
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 50 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tight"
              >
                {language === 'he' ? (
                  <>
                    <span className="block">טעם</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sun-gold via-amber-400 to-orange-500">
                      האמיתי
                    </span>
                    <span className="block text-white/60 text-4xl sm:text-5xl md:text-6xl font-light mt-4">
                      של טבעונות
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">THE TRUE</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sun-gold via-amber-400 to-orange-500">
                      TASTE
                    </span>
                    <span className="block text-white/60 text-4xl sm:text-5xl md:text-6xl font-light mt-4">
                      of Vegan Living
                    </span>
                  </>
                )}
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl text-white/70 max-w-lg mb-10 leading-relaxed"
              >
                {language === 'he'
                  ? 'חווית קולינרית ייחודית מלב הקהילה. מוצרים מקומיים, איכותיים, בריאים.'
                  : 'A unique culinary experience from the heart of our community. Local, quality, healthy products.'}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link href="/shop">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-10 py-5 bg-sun-gold text-black font-bold text-lg rounded-none hover:bg-white transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {language === 'he' ? 'לחנות' : 'SHOP NOW'}
                    <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  className="flex items-center gap-3 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-sun-gold hover:bg-sun-gold/10 transition-all">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                  <span className="font-medium">
                    {language === 'he' ? 'צפו בסיפור שלנו' : 'Watch Our Story'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={isLoaded ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-8 mt-16 pt-8 border-t border-white/10"
              >
                {[
                  { value: `${TOTAL_PRODUCTS}+`, label: language === 'he' ? 'מוצרים' : 'Products' },
                  { value: `${VENDOR_COUNT}`, label: language === 'he' ? 'ספקים' : 'Vendors' },
                  { value: '50+', label: language === 'he' ? 'שנות מסורת' : 'Years' },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Floating Products */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative h-[500px]">
                {featuredProducts.map((product, index) => {
                  const positions = [
                    { top: '0%', right: '10%', rotate: -8, scale: 1.1 },
                    { top: '35%', right: '30%', rotate: 5, scale: 1 },
                    { top: '60%', right: '5%', rotate: -3, scale: 0.9 },
                  ];
                  const pos = positions[index];

                  return (
                    <motion.div
                      key={product.id}
                      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8, rotate: pos.rotate * 2 }}
                      animate={isLoaded ? { opacity: 1, scale: pos.scale, rotate: pos.rotate } : {}}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.15 }}
                      whileHover={shouldReduceMotion ? {} : { scale: pos.scale * 1.1, rotate: 0, zIndex: 10 }}
                      className="absolute w-48 h-48 cursor-pointer"
                      style={{ top: pos.top, right: pos.right }}
                    >
                      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white font-bold text-sm truncate">{product.name}</p>
                          <p className="text-sun-gold font-bold">₪{product.price}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Decorative element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-sun-gold/30 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Bar */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 50 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/10"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center md:justify-between items-center py-5 gap-8 overflow-x-auto">
            {[
              { icon: Truck, text: language === 'he' ? 'משלוח באותו יום' : 'Same-Day Delivery' },
              { icon: Shield, text: language === 'he' ? 'תשלום מאובטח' : 'Secure Payment' },
              { icon: Leaf, text: language === 'he' ? '100% טבעוני' : '100% Vegan' },
              { icon: Clock, text: language === 'he' ? 'תמיכה 24/7' : '24/7 Support' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 text-white/70 whitespace-nowrap">
                  <Icon className="w-5 h-5 text-sun-gold" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs uppercase tracking-widest">
          {language === 'he' ? 'גללו למטה' : 'Scroll'}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroOption1BoldCinematic;
