'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  TrendingUp,
  Star,
  ChevronRight,
  Gift,
  Check,
  ArrowLeft,
  Leaf,
  Package,
  Heart,
  Flame,
  Sun,
  Crown,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useCart } from '@/lib/context/CartContext';
import { createBundleCartItem } from '@/lib/utils/bundle-cart';
import type { Bundle } from '@/lib/types/landing';

interface BundlesShowcaseProps {
  bundles: Bundle[];
}

const BRAND = {
  green: '#478c0b',
  greenDeep: '#2D5A27',
  gold: '#f6af0d',
  goldPremium: '#C4A265',
  flame: '#c23c09',
  cream: '#fef9ef',
  soil: '#3a3a1d',
  warmWhite: '#FDFBF7',
};

// Each bundle gets a unique visual theme
const bundleThemes = [
  {
    gradient: 'from-emerald-600 via-green-700 to-emerald-900',
    accent: BRAND.green,
    icon: Leaf,
    pattern: 'radial-gradient(circle at 20% 80%, rgba(71,140,11,0.15) 0%, transparent 50%)',
  },
  {
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    accent: BRAND.flame,
    icon: Flame,
    pattern: 'radial-gradient(circle at 80% 20%, rgba(246,175,13,0.15) 0%, transparent 50%)',
  },
  {
    gradient: 'from-violet-600 via-purple-700 to-indigo-900',
    accent: '#7c3aed',
    icon: Crown,
    pattern: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 50%)',
  },
  {
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-700',
    accent: '#e11d48',
    icon: Heart,
    pattern: 'radial-gradient(circle at 30% 70%, rgba(225,29,72,0.1) 0%, transparent 50%)',
  },
  {
    gradient: 'from-teal-500 via-cyan-600 to-blue-700',
    accent: '#0891b2',
    icon: Sun,
    pattern: 'radial-gradient(circle at 70% 30%, rgba(8,145,178,0.1) 0%, transparent 50%)',
  },
  {
    gradient: 'from-yellow-500 via-amber-600 to-orange-700',
    accent: BRAND.gold,
    icon: Package,
    pattern: 'radial-gradient(circle at 60% 60%, rgba(246,175,13,0.15) 0%, transparent 50%)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function BundlesShowcase({ bundles }: BundlesShowcaseProps) {
  const { t, language, isRTL } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Banner */}
      <section
        ref={heroRef}
        className="relative overflow-hidden py-20 sm:py-28"
        style={{
          background: `linear-gradient(135deg, ${BRAND.greenDeep} 0%, #1a3d18 40%, ${BRAND.soil} 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: BRAND.gold }}
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl"
            style={{ background: BRAND.green }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
              {language === 'he' ? 'חזרה לדף הבית' : 'Back to Home'}
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              className="max-w-xl"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
                style={{ backgroundColor: 'rgba(246,175,13,0.15)', color: BRAND.gold }}
              >
                <Gift className="w-4 h-4 stroke-[1.5]" />
                <span>{language === 'he' ? 'מבצעים מיוחדים' : 'Special Offers'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {language === 'he' ? (
                  <>
                    חבילות{' '}
                    <span style={{ color: BRAND.gold }}>חיסכון</span>
                  </>
                ) : (
                  <>
                    Bundle{' '}
                    <span style={{ color: BRAND.gold }}>&amp; Save</span>
                  </>
                )}
              </h1>

              <p className="text-lg text-white/60 leading-relaxed">
                {language === 'he'
                  ? 'חבילות מיוחדות שנבחרו בקפידה מהספקים של כפר השלום. קנו ביחד, חסכו יותר, ותמכו בקהילה.'
                  : 'Curated bundles from Village of Peace vendors. Buy together, save more, and support the community.'}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4 sm:gap-8"
            >
              {[
                { value: bundles.length, label: language === 'he' ? 'חבילות' : 'Bundles' },
                {
                  value: `${Math.max(...bundles.map((b) => b.savingsPercent), 0)}%`,
                  label: language === 'he' ? 'חיסכון מקסימלי' : 'Max Savings',
                },
                {
                  value: Math.max(...bundles.map((b) => b.loyaltyPointsBonus), 0),
                  label: language === 'he' ? 'נקודות בונוס' : 'Bonus Points',
                },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold" style={{ color: BRAND.gold }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bundle Grid */}
      <section
        ref={gridRef}
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: BRAND.warmWhite }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section subtitle */}
          <motion.p
            className="text-center text-gray-500 text-sm mb-10"
            initial={{ opacity: 0 }}
            animate={gridInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            {language === 'he'
              ? `${bundles.length} חבילות זמינות  -  לחצו על חבילה לפרטים נוספים`
              : `${bundles.length} bundles available  -  Click any bundle for details`}
          </motion.p>

          {/* Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={gridInView ? 'visible' : 'hidden'}
          >
            {bundles.map((bundle, i) => (
              <BundleDetailCard
                key={bundle.id}
                bundle={bundle}
                theme={bundleThemes[i % bundleThemes.length]}
                language={language}
                isRTL={isRTL}
                t={t}
              />
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-gray-500 text-sm mb-4">
              {language === 'he'
                ? 'רוצים לעיין בכל המוצרים?'
                : 'Want to browse all products?'}
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{ backgroundColor: BRAND.green }}
            >
              {language === 'he' ? 'לחנות' : 'Visit Marketplace'}
              <ChevronRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ================================================================ */
/*  Bundle Detail Card - Premium expanded design                     */
/* ================================================================ */

interface BundleDetailCardProps {
  bundle: Bundle;
  theme: (typeof bundleThemes)[number];
  language: 'en' | 'he';
  isRTL: boolean;
  t: (text: string) => string;
}

function BundleDetailCard({ bundle, theme, language, isRTL, t }: BundleDetailCardProps) {
  const displayName = language === 'he' && bundle.nameHe ? bundle.nameHe : bundle.name;
  const displayDesc =
    language === 'he' && bundle.descriptionHe ? bundle.descriptionHe : bundle.description;
  const ThemeIcon = theme.icon;

  const cart = useCart();
  const [added, setAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-40px' });

  const handleAddBundle = () => {
    cart.addToCart(createBundleCartItem(bundle));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const savings = bundle.originalPrice - bundle.bundlePrice;

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      whileHover={{ y: -6, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100/80 group flex flex-col"
    >
      {/* Header: gradient + hero image — links to detail page */}
      <Link href={`/bundles/${bundle.id}`} className="cursor-pointer">
        <div className={`relative h-56 sm:h-64 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
          {/* Background image */}
          <Image
            src={bundle.image}
            alt={displayName}
            fill
            className="object-cover opacity-25 mix-blend-luminosity transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Pattern overlay */}
          <div className="absolute inset-0" style={{ background: theme.pattern }} />

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
            {/* Top: badges */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2]" />
                  {language === 'he' ? `חסכו ${bundle.savingsPercent}%` : `Save ${bundle.savingsPercent}%`}
                </span>
                {bundle.loyaltyPointsBonus > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400/90 text-yellow-900 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 stroke-[2] fill-current" />
                    +{bundle.loyaltyPointsBonus} {language === 'he' ? 'נק׳' : 'pts'}
                  </span>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <ThemeIcon className="w-5 h-5 text-white stroke-[1.5]" />
              </div>
            </div>

            {/* Bottom: title + price */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-1 drop-shadow-sm">
                {displayName}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{displayDesc}</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Product list */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            {language === 'he'
              ? `${bundle.products.length} פריטים בחבילה`
              : `${bundle.products.length} Items Included`}
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {bundle.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-100/80"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">
                    {'\u20AA'}{product.price.toFixed(0)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Check className="w-4 h-4 text-green-500 stroke-[2]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
            <span>{language === 'he' ? 'מחיר רגיל' : 'Regular price'}</span>
            <span className="line-through">{'\u20AA'}{bundle.originalPrice.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-1" style={{ color: BRAND.flame }}>
            <span className="font-medium">{language === 'he' ? 'חיסכון' : 'You save'}</span>
            <span className="font-bold">-{'\u20AA'}{savings.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold" style={{ color: BRAND.soil }}>
              {language === 'he' ? 'מחיר חבילה' : 'Bundle price'}
            </span>
            <span className="text-3xl font-bold" style={{ color: theme.accent }}>
              {'\u20AA'}{bundle.bundlePrice.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            href={`/bundles/${bundle.id}`}
            className="flex-1 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm py-4 rounded-xl transition-all duration-200 cursor-pointer border-2 hover:shadow-md"
            style={{
              borderColor: theme.accent,
              color: theme.accent,
            }}
          >
            <ChevronRight className="w-4 h-4 stroke-[1.5]" />
            {language === 'he' ? 'צפו בחבילה' : 'View Bundle'}
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddBundle}
            disabled={added}
            className="flex-1 flex items-center justify-center gap-2 text-white font-semibold text-xs sm:text-sm py-4 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
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
                  <Check className="w-5 h-5 stroke-[2]" />
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
                  <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
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
