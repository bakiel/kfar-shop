'use client';

/**
 * HERO OPTION 3: PRODUCT SHOWCASE
 *
 * Design Direction:
 * - Products as the hero - magazine-style editorial layout
 * - Masonry/bento grid with featured product cards
 * - High-quality product photography takes center stage
 * - Subtle animations on product hover
 * - Shopping-focused with clear "Add to Cart" CTAs
 *
 * Best for: Direct conversion, product discovery, catalog feel
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ShoppingCart, Star, Heart, Eye, Plus,
  Sparkles, TrendingUp, Clock, Leaf
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getFeaturedProducts, getVendors, TOTAL_PRODUCTS, VENDOR_COUNT } from '../archived-data';

const HeroOption3ProductShowcase = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const featuredProducts = getFeaturedProducts(6);
  const vendors = getVendors();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Bento grid positions for products
  const gridPositions = [
    'col-span-2 row-span-2', // Large featured
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-2', // Tall
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
  ];

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-gray-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Top Bar - Category Pills */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-white border-b border-gray-100"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { label: language === 'he' ? 'חדש' : 'New', icon: Sparkles, active: true },
                  { label: language === 'he' ? 'פופולרי' : 'Trending', icon: TrendingUp },
                  { label: language === 'he' ? 'מבצעים' : 'Sale', icon: Clock },
                  { label: language === 'he' ? 'טבעוני' : 'Vegan', icon: Leaf },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      cat.active
                        ? 'bg-leaf-green text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                <span>{TOTAL_PRODUCTS}+ {language === 'he' ? 'מוצרים' : 'products'}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{VENDOR_COUNT} {language === 'he' ? 'ספקים' : 'vendors'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Area */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6">

            {/* Left Side - Hero Text */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -30 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="col-span-12 lg:col-span-3"
            >
              <div className="sticky top-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sun-gold/10 rounded-full mb-4">
                  <Star className="w-4 h-4 fill-sun-gold text-sun-gold" />
                  <span className="text-sm font-medium text-sun-gold">
                    {language === 'he' ? 'מומלץ' : 'Featured'}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {language === 'he' ? (
                    <>
                      טעמו את
                      <br />
                      <span className="text-leaf-green">האיכות</span>
                    </>
                  ) : (
                    <>
                      Taste the
                      <br />
                      <span className="text-leaf-green">Quality</span>
                    </>
                  )}
                </h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                  {language === 'he'
                    ? 'מוצרים טבעוניים מובחרים, נבחרו בקפידה מהספקים הטובים ביותר בקהילה.'
                    : 'Premium vegan products, carefully curated from the finest community vendors.'}
                </p>

                <Link href="/shop">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-leaf-green text-white rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-leaf-green/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {language === 'he' ? 'לכל המוצרים' : 'Shop All Products'}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </Link>

                {/* Vendor Avatars */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-400 mb-3">
                    {language === 'he' ? 'הספקים שלנו' : 'Our Vendors'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vendors.slice(0, 6).map((vendor) => (
                      <div
                        key={vendor.id}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
                      >
                        <Image src={vendor.logo} alt={vendor.name} width={40} height={40} className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Product Grid */}
            <div className="col-span-12 lg:col-span-9">
              <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] gap-4">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                    animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                    className={`${gridPositions[index]} relative group cursor-pointer`}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                        {/* Product Image */}
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Tags */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          {product.badge && (
                            <span className="px-2 py-1 bg-sun-gold text-white text-xs font-medium rounded-full">
                              {product.badge}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                            {product.vendorId}
                          </span>
                        </div>

                        {/* Wishlist Button */}
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={hoveredProduct === product.id ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-white transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                        </motion.button>

                        {/* Product Info - Shows on Hover */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={hoveredProduct === product.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          className="absolute bottom-0 left-0 right-0 p-4"
                        >
                          <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sun-gold font-bold text-xl">₪{product.price}</span>
                            <div className="flex items-center gap-1 text-white/80">
                              <Star className="w-4 h-4 fill-sun-gold text-sun-gold" />
                              <span className="text-sm">5.0</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Quick Add Button */}
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={hoveredProduct === product.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                          transition={{ delay: 0.1 }}
                          className="absolute bottom-4 right-4 w-10 h-10 bg-leaf-green text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-leaf-green/90 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>

                        {/* Always Visible - Minimal Info on Non-Hover */}
                        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${hoveredProduct === product.id ? 'opacity-0' : 'opacity-100'}`}>
                          <p className="text-white font-medium truncate">{product.name}</p>
                          <p className="text-sun-gold font-bold">₪{product.price}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* View All Link */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={isLoaded ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="flex justify-center mt-8"
              >
                <Link
                  href="/shop"
                  className="group flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-700 font-medium"
                >
                  <Eye className="w-5 h-5" />
                  {language === 'he' ? `צפו בכל ${TOTAL_PRODUCTS} המוצרים` : `View all ${TOTAL_PRODUCTS} products`}
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white border-t border-gray-100 py-6"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
              {[
                { icon: Leaf, text: language === 'he' ? '100% טבעוני' : '100% Vegan' },
                { icon: TrendingUp, text: language === 'he' ? 'מותגים מקומיים' : 'Local Brands' },
                { icon: ShoppingCart, text: language === 'he' ? 'משלוח חינם מעל ₪150' : 'Free Shipping 150₪+' },
                { icon: Star, text: language === 'he' ? '500+ לקוחות מרוצים' : '500+ Happy Customers' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-gray-600">
                  <item.icon className="w-5 h-5 text-leaf-green" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroOption3ProductShowcase;
