'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart, Heart, Star, ArrowRight, Sparkles, Eye
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useCart } from '@/lib/context/CartContext';
import {
  getFeaturedProducts,
  getVendorStore,
  EnhancedProduct
} from '@/lib/data/wordpress-style-data-layer';

// Confetti particle for wishlist animation
const ConfettiParticle = ({ index, color }: { index: number; color: string }) => {
  const angle = (index / 8) * Math.PI * 2;
  const distance = 30 + Math.random() * 20;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale: [0, 1, 0.5],
        x: x,
        y: y,
        opacity: [1, 1, 0]
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
};

// Animated star component
const AnimatedStar = ({ filled, index }: { filled: boolean; index: number }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        delay: 0.3 + index * 0.08,
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
    >
      <Star
        className={`w-3.5 h-3.5 ${
          filled
            ? 'fill-sun-gold text-sun-gold'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    </motion.div>
  );
};

const FeaturedProducts = () => {
  const { language, isRTL } = useLanguage();
  const { addToCart } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState<string | null>(null);

  // Get featured products from data layer
  const featuredProducts = useMemo(() => {
    return getFeaturedProducts(8);
  }, []);

  // Confetti colors
  const confettiColors = ['#478c0b', '#f6af0d', '#c23c09', '#ff6b6b', '#4ecdc4'];

  // Toggle wishlist with confetti
  const toggleWishlist = useCallback((productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyWishlisted = wishlist.has(productId);

    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    // Trigger confetti only when adding to wishlist
    if (!isCurrentlyWishlisted) {
      setShowConfetti(productId);
      setTimeout(() => setShowConfetti(null), 700);
    }
  }, [wishlist]);

  // Add to cart handler
  const handleAddToCart = useCallback((product: EnhancedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const vendor = getVendorStore(product.vendorId);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendorId: product.vendorId,
      vendorName: vendor?.name || product.vendorId,
    });
  }, [addToCart]);

  // Animation variants - respects reduced motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: "easeOut" as const
      }
    }
  };

  // Get vendor info helper
  const getVendorInfo = (vendorId: string) => {
    const vendor = getVendorStore(vendorId);
    return vendor ? { name: vendor.name, logo: vendor.logo } : { name: vendorId, logo: '' };
  };

  // Badge color mapping
  const getBadgeStyle = (badge?: string) => {
    switch (badge?.toLowerCase()) {
      case 'best seller':
        return { bg: '#c23c09', shadow: 'rgba(194, 60, 9, 0.4)' };
      case 'new':
        return { bg: '#478c0b', shadow: 'rgba(71, 140, 11, 0.4)' };
      case 'featured':
        return { bg: '#f6af0d', shadow: 'rgba(246, 175, 13, 0.4)' };
      case 'popular':
        return { bg: '#6366f1', shadow: 'rgba(99, 102, 241, 0.4)' };
      default:
        return { bg: '#478c0b', shadow: 'rgba(71, 140, 11, 0.4)' };
    }
  };

  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(to bottom, #ffffff, #f8faf5)' }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #478c0b 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          {/* Animated badge */}
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-6"
            style={{ backgroundColor: 'rgba(246, 175, 13, 0.12)', color: '#e09b00' }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(246, 175, 13, 0.2)' }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span className="font-accent">
              {language === 'he' ? 'המוצרים הנבחרים שלנו' : 'Handpicked for You'}
            </span>
          </motion.span>

          {/* Title with underline animation */}
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-5 text-soil-brown">
              {language === 'he' ? 'מוצרים מובילים' : 'Featured Products'}
            </h2>
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full bg-gradient-to-r from-leaf-green via-sun-gold to-earth-flame"
              initial={{ width: 0 }}
              whileInView={{ width: '60%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mt-6 font-body text-gray-500">
            {language === 'he'
              ? 'מוצרים איכותיים שנבחרו בקפידה מהספקים המובילים שלנו'
              : 'Quality products carefully selected from our top vendors'
            }
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {featuredProducts.map((product, index) => {
            const vendorInfo = getVendorInfo(product.vendorId);
            const isHovered = hoveredProduct === product.id;
            const isWishlisted = wishlist.has(product.id);
            const badgeStyle = getBadgeStyle(product.badge);

            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link href={`/product/${product.id}`}>
                  <motion.div
                    className="group bg-white rounded-3xl overflow-hidden cursor-pointer border border-gray-100"
                    whileHover={{
                      y: -12,
                      boxShadow: "0 30px 60px -15px rgba(71, 140, 11, 0.15)"
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.08)' }}
                  >
                    {/* Product Image */}
                    <div className="relative h-56 lg:h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <motion.div
                        className="absolute inset-0"
                        animate={{ scale: isHovered ? 1.08 : 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <Image
                          src={product.image || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </motion.div>

                      {/* Gradient Overlay on Hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Badge with glow */}
                      {product.badge && (
                        <motion.span
                          className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-white text-xs font-bold font-accent"
                          style={{
                            backgroundColor: badgeStyle.bg,
                            boxShadow: `0 4px 15px ${badgeStyle.shadow}`
                          }}
                          initial={{ scale: 0.8, opacity: 0, x: -10 }}
                          animate={{ scale: 1, opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                        >
                          {product.badge}
                        </motion.span>
                      )}

                      {/* Wishlist Button with Confetti */}
                      <div className="absolute top-4 right-4">
                        <motion.button
                          className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                            isWishlisted
                              ? 'bg-red-500 text-white'
                              : 'bg-white/95 backdrop-blur-sm text-gray-500 hover:text-red-500'
                          }`}
                          onClick={(e) => toggleWishlist(product.id, e)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Heart
                            className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
                          />

                          {/* Confetti burst */}
                          <AnimatePresence>
                            {showConfetti === product.id && (
                              <>
                                {confettiColors.map((color, i) => (
                                  <ConfettiParticle key={i} index={i} color={color} />
                                ))}
                              </>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>

                      {/* Quick Add Button */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.button
                            className="absolute bottom-4 left-4 right-4 py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 font-accent"
                            style={{
                              backgroundColor: '#478c0b',
                              boxShadow: '0 10px 30px -5px rgba(71, 140, 11, 0.4)'
                            }}
                            onClick={(e) => handleAddToCart(product, e)}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            whileHover={{ backgroundColor: '#3a7209', scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {language === 'he' ? 'הוסף לסל' : 'Add to Cart'}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {/* Vendor */}
                      <div className="flex items-center gap-2 mb-2.5">
                        {vendorInfo.logo && (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-gray-100">
                            <Image
                              src={vendorInfo.logo}
                              alt={vendorInfo.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs font-medium font-body text-gray-400">
                          {vendorInfo.name}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-base mb-2.5 line-clamp-1 font-body text-soil-brown group-hover:text-leaf-green transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Animated Rating Stars */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <AnimatedStar
                            key={i}
                            filled={i < (product.rating || 5)}
                            index={i}
                          />
                        ))}
                        <span className="text-xs ml-1.5 font-accent text-gray-400">
                          ({product.rating || 5}.0)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold font-accent text-earth-flame">
                            ₪{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm line-through font-accent text-gray-300">
                              ₪{product.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Quick view icon */}
                        <motion.div
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-leaf-green/5"
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: 'rgba(71, 140, 11, 0.15)',
                            rotate: 5
                          }}
                        >
                          <Eye className="w-4 h-4 text-leaf-green" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-16"
        >
          <Link href="/shop">
            <motion.button
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-white font-accent shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #c23c09, #a82f07)',
                boxShadow: '0 15px 40px -10px rgba(194, 60, 9, 0.4)'
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 50px -10px rgba(194, 60, 9, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'he' ? 'צפו בכל המוצרים' : 'View All Products'}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </motion.div>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
