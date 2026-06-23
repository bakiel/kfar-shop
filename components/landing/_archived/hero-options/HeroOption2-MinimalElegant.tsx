'use client';

/**
 * HERO OPTION 2: MINIMAL ELEGANT
 *
 * Design Direction:
 * - Clean white/cream background with generous white space
 * - Sophisticated, refined typography
 * - Subtle animations and micro-interactions
 * - Split layout with elegant imagery
 * - Premium, high-end marketplace feel
 *
 * Best for: Upscale positioning, trust-building, clarity
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ShoppingBag, Star, Leaf, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getFeaturedProducts, getVendors, TOTAL_PRODUCTS, VENDOR_COUNT } from '../archived-data';

const HeroOption2MinimalElegant = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const featuredProducts = getFeaturedProducts(4);
  const vendors = getVendors();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F8F6F1 100%)' }}
    >
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col justify-center py-24">

          {/* Header Badge */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-sun-gold text-sun-gold" />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {language === 'he' ? 'מהימן על ידי 500+ משפחות' : 'Trusted by 500+ families'}
              </span>
            </div>
          </motion.div>

          {/* Main Headline - Centered, Elegant */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-center max-w-4xl mx-auto mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-tight tracking-tight">
              {language === 'he' ? (
                <>
                  איכות שאפשר
                  <br />
                  <span className="font-semibold text-leaf-green">לטעום</span>
                </>
              ) : (
                <>
                  Quality You Can
                  <br />
                  <span className="font-semibold text-leaf-green">Taste</span>
                </>
              )}
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {language === 'he'
              ? 'מוצרים טבעוניים מובחרים מהקהילה שלנו בדימונה. איכות, טריות, מסורת.'
              : 'Premium vegan products from our community in Dimona. Quality, freshness, tradition.'}
          </motion.p>

          {/* CTA Buttons - Centered */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Link href="/shop">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02, boxShadow: '0 20px 40px -10px rgba(71, 140, 11, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 bg-leaf-green text-white rounded-full font-medium text-lg flex items-center gap-3 cursor-pointer shadow-lg shadow-leaf-green/20"
              >
                <ShoppingBag className="w-5 h-5" />
                {language === 'he' ? 'גלו את החנות' : 'Explore Shop'}
                <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
            </Link>

            <Link href="/about">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-gray-700 rounded-full font-medium text-lg flex items-center gap-2 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {language === 'he' ? 'הסיפור שלנו' : 'Our Story'}
                <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Product Showcase - Elegant Grid */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={shouldReduceMotion ? {} : { y: -8 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate group-hover:text-leaf-green transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-leaf-green font-semibold">₪{product.price}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-sun-gold text-sun-gold" />
                            <span className="text-xs text-gray-400">5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View all link */}
            <div className="text-center mt-8">
              <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-leaf-green transition-colors group">
                <span className="text-sm">
                  {language === 'he' ? `צפו בכל ${TOTAL_PRODUCTS} המוצרים` : `View all ${TOTAL_PRODUCTS} products`}
                </span>
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </motion.div>

          {/* Bottom Info Row */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20 pt-10 border-t border-gray-200"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Vendor Logos */}
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-400">
                  {language === 'he' ? 'הספקים שלנו:' : 'Our vendors:'}
                </span>
                <div className="flex -space-x-2">
                  {vendors.slice(0, 5).map((vendor) => (
                    <div
                      key={vendor.id}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
                    >
                      <Image src={vendor.logo} alt={vendor.name} width={40} height={40} className="object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-leaf-green/10 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-leaf-green">+{VENDOR_COUNT - 5}</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="flex items-center gap-8">
                {[
                  { icon: Leaf, text: language === 'he' ? '100% טבעוני' : '100% Vegan' },
                  { text: language === 'he' ? 'משלוח חינם מעל ₪150' : 'Free shipping over ₪150' },
                  { text: language === 'he' ? '50+ שנות מסורת' : '50+ years of tradition' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-gray-500">
                    {item.icon && <item.icon className="w-4 h-4 text-leaf-green" />}
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(71, 140, 11, 0.1) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(246, 175, 13, 0.1) 0%, transparent 70%)' }}
      />
    </section>
  );
};

export default HeroOption2MinimalElegant;
