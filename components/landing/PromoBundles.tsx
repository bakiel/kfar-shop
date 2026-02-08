'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingCart,
  Package,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Gift,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useCart } from '@/lib/context/CartContext';
import type { Bundle, LandingProduct } from '@/lib/types/landing';

interface PromoBundlesProps {
  bundles: Bundle[];
  featuredProducts?: LandingProduct[];
}

// KFAR brand
const BRAND = {
  green: '#478c0b',
  greenDeep: '#2D5A27',
  gold: '#f6af0d',
  flame: '#c23c09',
  cream: '#fef9ef',
  soil: '#3a3a1d',
};

export default function PromoBundles({ bundles, featuredProducts }: PromoBundlesProps) {
  const { t, language, isRTL } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const hasBundles = bundles && bundles.length > 0;
  const showFeatured = !hasBundles && featuredProducts && featuredProducts.length > 0;

  // Show max 3 bundles on landing page
  const displayBundles = hasBundles ? bundles.slice(0, 3) : [];

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#f7f4ee' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: `${BRAND.flame}15`, color: BRAND.flame }}
          >
            <Gift className="w-4 h-4 stroke-[1.5]" />
            <span>{hasBundles ? t('Bundle & Save') : t('Popular This Week')}</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: BRAND.soil }}>
            {hasBundles
              ? (language === 'he' ? 'חבילות חיסכון' : 'Bundle & Save')
              : t('Popular This Week')
            }
          </h2>
          {hasBundles && (
            <p className="text-base text-gray-500 max-w-lg mx-auto">
              {language === 'he'
                ? 'קנו ביחד, חסכו יותר. חבילות מיוחדות מהקהילה שלנו'
                : 'Buy together, save more. Curated bundles from our community vendors'
              }
            </p>
          )}
        </motion.div>

        {/* Bundle Cards - Premium Grid */}
        {hasBundles && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {displayBundles.map((bundle, i) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                index={i}
                language={language}
                isRTL={isRTL}
                t={t}
              />
            ))}
          </motion.div>
        )}

        {/* "See All Bundles" link */}
        {hasBundles && bundles.length > 3 && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/bundles"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer hover:opacity-80"
              style={{ color: BRAND.green }}
            >
              {language === 'he' ? 'ראה את כל החבילות' : 'View all bundles'}
              <ChevronRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        )}

        {/* Featured Products Fallback */}
        {showFeatured && (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="sm:hidden -mx-4 px-4">
              <motion.div
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              >
                {featuredProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[65vw] max-w-[240px] snap-start">
                    <FeaturedProductCard
                      product={product}
                      language={language}
                      isRTL={isRTL}
                      t={t}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
            {/* Desktop: grid */}
            <motion.div
              className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {featuredProducts.slice(0, 4).map((product) => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  isRTL={isRTL}
                  t={t}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Bundle Card - Premium Design                                       */
/* ------------------------------------------------------------------ */

interface BundleCardProps {
  bundle: Bundle;
  index: number;
  language: 'en' | 'he';
  isRTL: boolean;
  t: (text: string) => string;
}

function BundleCard({ bundle, index, language, isRTL, t }: BundleCardProps) {
  const displayName = language === 'he' && bundle.nameHe ? bundle.nameHe : bundle.name;
  const displayDesc =
    language === 'he' && bundle.descriptionHe ? bundle.descriptionHe : bundle.description;

  const cart = useCart();
  const [added, setAdded] = useState(false);

  // Gradient themes per card position
  const themes = [
    { bg: 'from-emerald-600 to-green-800', accent: BRAND.green },
    { bg: 'from-amber-500 to-orange-700', accent: BRAND.flame },
    { bg: 'from-violet-600 to-purple-800', accent: '#7c3aed' },
  ];
  const theme = themes[index % themes.length];

  const handleAddBundle = () => {
    // Add all products in the bundle to cart
    bundle.products.forEach((product) => {
      cart.addToCart({
        id: product.id,
        name: product.name,
        vendorId: '',
        vendorName: '',
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group flex flex-col"
    >
      {/* Header with gradient + overlaid product thumbnails — links to detail page */}
      <Link href={`/bundles/${bundle.id}`} className="cursor-pointer">
        <div className={`relative h-52 bg-gradient-to-br ${theme.bg} overflow-hidden`}>
          {/* Background image with overlay */}
          <Image
            src={bundle.image}
            alt={displayName}
            fill
            className="object-cover opacity-30 mix-blend-luminosity transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
            {/* Top row: savings badge */}
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                <TrendingUp className="w-3 h-3 stroke-[2]" />
                {language === 'he' ? `חסכו ${bundle.savingsPercent}%` : `Save ${bundle.savingsPercent}%`}
              </span>

              {bundle.loyaltyPointsBonus > 0 && (
                <span className="inline-flex items-center gap-1 bg-yellow-400/90 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full">
                  <Star className="w-2.5 h-2.5 stroke-[2] fill-current" />
                  +{bundle.loyaltyPointsBonus}
                </span>
              )}
            </div>

            {/* Bottom: product thumbnails stacked */}
            <div className="flex items-end justify-between">
              {/* Stacked circular thumbnails */}
              <div className="flex items-center -space-x-3">
                {bundle.products.slice(0, 5).map((product, i) => (
                  <div
                    key={product.id}
                    className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg"
                    style={{ zIndex: 5 - i }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ))}
                {bundle.products.length > 5 && (
                  <div
                    className="relative w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-white text-xs font-bold">+{bundle.products.length - 5}</span>
                  </div>
                )}
              </div>

              {/* Item count */}
              <span className="text-white/80 text-xs font-medium">
                {bundle.products.length} {language === 'he' ? 'פריטים' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Name & Description */}
        <Link href={`/bundles/${bundle.id}`} className="cursor-pointer">
          <h3 className="text-lg font-bold leading-snug line-clamp-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.soil }}>
            {displayName}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{displayDesc}</p>
        </Link>

        {/* Price Row */}
        <div className="flex items-end gap-3 mt-auto pt-2">
          <span className="text-2xl font-bold" style={{ color: theme.accent }}>
            {'\u20AA'}{bundle.bundlePrice.toFixed(0)}
          </span>
          <span className="text-sm text-gray-400 line-through mb-0.5">
            {'\u20AA'}{bundle.originalPrice.toFixed(0)}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
            style={{
              backgroundColor: `${BRAND.flame}15`,
              color: BRAND.flame,
            }}
          >
            -{bundle.savingsPercent}%
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/bundles/${bundle.id}`}
            className="flex-1 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm py-3.5 rounded-xl transition-all duration-200 cursor-pointer border-2 hover:shadow-md"
            style={{
              borderColor: theme.accent,
              color: theme.accent,
            }}
          >
            <ChevronRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
            {language === 'he' ? 'צפו בחבילה' : 'View Bundle'}
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddBundle}
            disabled={added}
            className="flex-1 flex items-center justify-center gap-2 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            style={{
              backgroundColor: added ? '#22c55e' : theme.accent,
            }}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2]" />
                  {language === 'he' ? 'נוסף!' : 'Added!'}
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                  {language === 'he' ? 'הוסף לסל' : 'Add to Cart'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured Product Card (fallback when no bundles)                   */
/* ------------------------------------------------------------------ */

interface FeaturedProductCardProps {
  product: LandingProduct;
  language: 'en' | 'he';
  isRTL: boolean;
  t: (text: string) => string;
}

function FeaturedProductCard({ product, language, isRTL, t }: FeaturedProductCardProps) {
  const displayName = language === 'he' && product.nameHe ? product.nameHe : product.name;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/product/${product.id}`}
        className="block group cursor-pointer"
      >
        <motion.div
          whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
        >
          {/* Product Image */}
          <div className="relative h-44 w-full overflow-hidden bg-gray-50">
            <Image
              src={product.image}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {product.badge && (
              <div className="absolute top-3 left-3">
                <span
                  className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                  style={{ backgroundColor: BRAND.gold }}
                >
                  {t(product.badge)}
                </span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-4 flex flex-col gap-2">
            {/* Vendor */}
            <div className="flex items-center gap-2">
              {product.vendorLogo && (
                <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={product.vendorLogo}
                    alt={product.vendorName}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
              )}
              <span className="text-xs text-gray-400 truncate">
                {product.vendorName}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: BRAND.soil }}>
              {displayName}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 stroke-[1.5]" style={{ color: BRAND.gold, fill: BRAND.gold }} />
                <span className="text-xs font-medium text-gray-500">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-2 mt-1">
              <span className="text-lg font-bold" style={{ color: BRAND.green }}>
                {'\u20AA'}{product.price.toFixed(0)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through mb-0.5">
                  {'\u20AA'}{product.originalPrice.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
