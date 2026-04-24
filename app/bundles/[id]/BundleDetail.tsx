'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Star,
  TrendingUp,
  Gift,
  ChevronRight,
  Package,
  Sparkles,
  Heart,
  Flame,
  Sun,
  Crown,
  Leaf,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useCart } from '@/lib/context/CartContext';
import type { EnrichedBundle, Bundle } from '@/lib/types/landing';

interface BundleDetailProps {
  bundle: EnrichedBundle;
  relatedBundles: Bundle[];
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

// Visual theme per bundle id
const bundleThemeMap: Record<string, { gradient: string; accent: string; icon: typeof Leaf }> = {
  'bundle-family-feast': { gradient: 'from-emerald-600 via-green-700 to-emerald-900', accent: BRAND.green, icon: Leaf },
  'bundle-shabbat': { gradient: 'from-amber-500 via-orange-600 to-red-700', accent: BRAND.flame, icon: Flame },
  'bundle-bbq': { gradient: 'from-violet-600 via-purple-700 to-indigo-900', accent: '#7c3aed', icon: Crown },
  'bundle-sweet-tooth': { gradient: 'from-rose-500 via-pink-600 to-fuchsia-700', accent: '#e11d48', icon: Heart },
  'bundle-healthy-start': { gradient: 'from-teal-500 via-cyan-600 to-blue-700', accent: '#0891b2', icon: Sun },
  'bundle-kfar-essentials': { gradient: 'from-yellow-500 via-amber-600 to-orange-700', accent: BRAND.gold, icon: Package },
};

const defaultTheme = { gradient: 'from-emerald-600 via-green-700 to-emerald-900', accent: BRAND.green, icon: Leaf };

export default function BundleDetail({ bundle, relatedBundles }: BundleDetailProps) {
  const { language, isRTL } = useLanguage();
  const cart = useCart();
  const [added, setAdded] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true });
  const productsInView = useInView(productsRef, { once: true, margin: '-60px' });
  const pricingInView = useInView(pricingRef, { once: true, margin: '-60px' });
  const relatedInView = useInView(relatedRef, { once: true, margin: '-60px' });

  const theme = bundleThemeMap[bundle.id] || defaultTheme;

  const displayName = language === 'he' && bundle.nameHe ? bundle.nameHe : bundle.name;
  const displayDesc = language === 'he' && bundle.descriptionHe ? bundle.descriptionHe : bundle.description;
  const savings = bundle.originalPrice - bundle.bundlePrice;

  const handleAddBundle = () => {
    bundle.products.forEach((product) => {
      cart.addToCart({
        id: product.id,
        name: product.name,
        vendorId: product.vendorId || '',
        vendorName: product.vendorName || '',
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ========== IMMERSIVE HERO ========== */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={bundle.image}
            alt={displayName}
            fill
            className="object-cover opacity-20 mix-blend-luminosity"
            sizes="100vw"
            priority
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        {/* Decorative blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20"
            style={{ background: BRAND.gold }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-40 h-40 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-15"
            style={{ background: theme.accent }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              href="/bundles"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
              {language === 'he' ? 'כל החבילות' : 'All Bundles'}
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            {/* Left: Title + description */}
            <motion.div
              className="flex-1 max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2]" />
                  {language === 'he' ? `חסכו ${bundle.savingsPercent}%` : `Save ${bundle.savingsPercent}%`}
                </span>
                {bundle.loyaltyPointsBonus > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400/90 text-yellow-900 text-[11px] font-bold px-2.5 py-1.5 rounded-full">
                    <Star className="w-3 h-3 stroke-[2] fill-current" />
                    +{bundle.loyaltyPointsBonus} {language === 'he' ? 'נקודות' : 'points'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white/80 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-white/10">
                  <Package className="w-3 h-3 stroke-[1.5]" />
                  {bundle.products.length} {language === 'he' ? 'פריטים' : 'items'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
                {displayName}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                {displayDesc}
              </p>
            </motion.div>

            {/* Right: Price card */}
            <motion.div
              className="w-full lg:w-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 sm:p-8">
                {/* Price comparison */}
                <div className="text-center mb-6">
                  <div className="text-sm text-white/50 mb-1">
                    {language === 'he' ? 'מחיר רגיל' : 'Regular Price'}
                  </div>
                  <div className="text-xl text-white/40 line-through font-medium">
                    {'\u20AA'}{bundle.originalPrice.toFixed(0)}
                  </div>

                  <div className="my-3 flex items-center gap-3 justify-center">
                    <div className="h-px flex-1 bg-white/20" />
                    <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">
                      {language === 'he' ? 'מחיר חבילה' : 'Bundle Price'}
                    </span>
                    <div className="h-px flex-1 bg-white/20" />
                  </div>

                  <AnimatedPrice price={bundle.bundlePrice} inView={heroInView} />
                </div>

                {/* Savings highlight */}
                <div
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 mb-6"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
                >
                  <Sparkles className="w-4 h-4 text-green-300 stroke-[1.5]" />
                  <span className="text-green-300 text-sm font-bold">
                    {language === 'he'
                      ? `חוסכים ₪${savings.toFixed(0)}`
                      : `You save ₪${savings.toFixed(0)}`}
                  </span>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddBundle}
                  disabled={added}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold text-base py-4 rounded-xl transition-all duration-200 cursor-pointer shadow-lg"
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
                        {language === 'he' ? 'נוסף לסל!' : 'Added to Cart!'}
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
                        {language === 'he' ? 'הוסף חבילה לסל' : 'Add Entire Bundle'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Product thumbnails strip */}
          <motion.div
            className="mt-10 flex items-center gap-3 overflow-x-auto pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {bundle.products.map((product, i) => (
              <motion.div
                key={product.id}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== PRODUCT SHOWCASE GRID ========== */}
      <section
        ref={productsRef}
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: BRAND.warmWhite }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={productsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
              style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
            >
              <Gift className="w-4 h-4 stroke-[1.5]" />
              <span>{language === 'he' ? 'מה בפנים' : "What's Inside"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: BRAND.soil }}>
              {language === 'he'
                ? `${bundle.products.length} מוצרים מדהימים`
                : `${bundle.products.length} Amazing Products`}
            </h2>
          </motion.div>

          {/* Product grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate={productsInView ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
          >
            {bundle.products.map((product) => {
              const productDisplayName = language === 'he' && product.nameHe ? product.nameHe : product.name;
              const productDesc = language === 'he' && product.descriptionHe ? product.descriptionHe : product.description;

              return (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                  }}
                  whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group flex flex-col"
                >
                  {/* Product image */}
                  <div className="relative h-52 overflow-hidden bg-gray-50">
                    <Image
                      src={product.image}
                      alt={productDisplayName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {/* "Included" badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Check className="w-3 h-3 stroke-[2]" />
                        {language === 'he' ? 'כלול' : 'Included'}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    {/* Vendor */}
                    {product.vendorName && (
                      <div className="flex items-center gap-2">
                        {product.vendorLogo && (
                          <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                            <Image
                              src={product.vendorLogo}
                              alt={product.vendorName}
                              fill
                              className="object-cover"
                              sizes="20px"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-400 truncate">{product.vendorName}</span>
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="text-base font-bold leading-snug line-clamp-2" style={{ color: BRAND.soil }}>
                      {productDisplayName}
                    </h3>

                    {/* Description */}
                    {productDesc && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{productDesc}</p>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <span className="text-lg font-bold" style={{ color: theme.accent }}>
                        {'\u20AA'}{product.price.toFixed(0)}
                      </span>
                      <Link
                        href={`/product/${product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer hover:opacity-80"
                        style={{ color: theme.accent }}
                      >
                        {language === 'he' ? 'פרטים' : 'Details'}
                        <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== VALUE BREAKDOWN ========== */}
      <section
        ref={pricingRef}
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: '#f7f4ee' }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ color: BRAND.soil }}>
              {language === 'he' ? 'פירוט החיסכון שלך' : 'Your Savings Breakdown'}
            </h2>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              {/* Itemized list */}
              <div className="divide-y divide-gray-50">
                {bundle.products.map((product, i) => {
                  const pName = language === 'he' && product.nameHe ? product.nameHe : product.name;
                  return (
                    <motion.div
                      key={product.id}
                      className="flex items-center gap-4 px-6 py-4"
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={pricingInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <Image
                          src={product.image}
                          alt={pName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-700 truncate">{pName}</span>
                      <span className="text-sm text-gray-400 font-medium flex-shrink-0">
                        {'\u20AA'}{product.price.toFixed(0)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t-2 border-gray-100 px-6 py-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{language === 'he' ? 'סה"כ לפני הנחה' : 'Subtotal'}</span>
                  <span className="line-through">{'\u20AA'}{bundle.originalPrice.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm" style={{ color: '#22c55e' }}>
                  <span className="font-medium">{language === 'he' ? 'הנחת חבילה' : 'Bundle Discount'}</span>
                  <span className="font-bold">-{'\u20AA'}{savings.toFixed(0)} ({bundle.savingsPercent}%)</span>
                </div>

                {/* Savings bar */}
                <div className="pt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#22c55e' }}
                      initial={{ width: 0 }}
                      animate={pricingInView ? { width: `${bundle.savingsPercent}%` } : {}}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold" style={{ color: BRAND.soil }}>
                    {language === 'he' ? 'סה"כ' : 'You Pay'}
                  </span>
                  <span className="text-3xl font-bold" style={{ color: theme.accent }}>
                    {'\u20AA'}{bundle.bundlePrice.toFixed(0)}
                  </span>
                </div>

                {/* Loyalty points */}
                {bundle.loyaltyPointsBonus > 0 && (
                  <div
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 mt-2"
                    style={{ backgroundColor: `${BRAND.gold}15` }}
                  >
                    <Star className="w-4 h-4 stroke-[1.5]" style={{ color: BRAND.gold, fill: BRAND.gold }} />
                    <span className="text-sm font-semibold" style={{ color: BRAND.gold }}>
                      {language === 'he'
                        ? `תרוויחו ${bundle.loyaltyPointsBonus} נקודות נאמנות`
                        : `Earn ${bundle.loyaltyPointsBonus} loyalty points`}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="px-6 pb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddBundle}
                  disabled={added}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold text-base py-4 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
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
                        {language === 'he' ? 'נוסף לסל!' : 'Added to Cart!'}
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
                        {language === 'he' ? 'הוסף חבילה לסל' : 'Add Entire Bundle to Cart'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== RELATED BUNDLES ========== */}
      {relatedBundles.length > 0 && (
        <section
          ref={relatedRef}
          className="py-16 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: BRAND.warmWhite }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={relatedInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: BRAND.soil }}>
                {language === 'he' ? 'חבילות נוספות' : 'More Bundles'}
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate={relatedInView ? 'visible' : 'hidden'}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 },
                },
              }}
            >
              {relatedBundles.map((rb) => {
                const rbTheme = bundleThemeMap[rb.id] || defaultTheme;
                const rbName = language === 'he' && rb.nameHe ? rb.nameHe : rb.name;

                return (
                  <motion.div
                    key={rb.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  >
                    <Link href={`/bundles/${rb.id}`} className="block cursor-pointer group">
                      <motion.div
                        whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)' }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                      >
                        {/* Header gradient */}
                        <div className={`relative h-40 bg-gradient-to-br ${rbTheme.gradient} overflow-hidden`}>
                          <Image
                            src={rb.image}
                            alt={rbName}
                            fill
                            className="object-cover opacity-25 mix-blend-luminosity transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, 33vw"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                            <span className="self-start inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20">
                              <TrendingUp className="w-3 h-3 stroke-[2]" />
                              {language === 'he' ? `חסכו ${rb.savingsPercent}%` : `Save ${rb.savingsPercent}%`}
                            </span>
                            <div className="flex items-center -space-x-2">
                              {rb.products.slice(0, 4).map((p, i) => (
                                <div
                                  key={p.id}
                                  className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow"
                                  style={{ zIndex: 4 - i }}
                                >
                                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="36px" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                          <h3 className="text-base font-bold line-clamp-1 mb-1" style={{ color: BRAND.soil }}>
                            {rbName}
                          </h3>
                          <div className="flex items-end gap-2">
                            <span className="text-xl font-bold" style={{ color: rbTheme.accent }}>
                              {'\u20AA'}{rb.bundlePrice.toFixed(0)}
                            </span>
                            <span className="text-sm text-gray-400 line-through mb-0.5">
                              {'\u20AA'}{rb.originalPrice.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: rbTheme.accent }}>
                            {language === 'he' ? 'צפו בחבילה' : 'View Bundle'}
                            <ChevronRight className={`w-3.5 h-3.5 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ========== MOBILE STICKY CTA ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 mx-auto">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400">{displayName}</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: theme.accent }}>
                  {'\u20AA'}{bundle.bundlePrice.toFixed(0)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {'\u20AA'}{bundle.originalPrice.toFixed(0)}
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddBundle}
              disabled={added}
              className="flex items-center gap-2 text-white font-bold text-sm px-6 py-3.5 rounded-xl cursor-pointer shadow-sm"
              style={{ backgroundColor: added ? '#22c55e' : theme.accent }}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[2]" />
                  {language === 'he' ? 'נוסף!' : 'Added!'}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                  {language === 'he' ? 'הוסף לסל' : 'Add to Cart'}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}

/* ================================================================ */
/*  Animated Price Counter                                           */
/* ================================================================ */

function AnimatedPrice({ price, inView }: { price: number; inView: boolean }) {
  const [displayPrice, setDisplayPrice] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const target = price;
    const duration = 800;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(Math.round(eased * target));

      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [inView, price]);

  return (
    <div className="text-4xl sm:text-5xl md:text-6xl font-bold" style={{ color: 'white' }}>
      <span className="text-3xl align-top">{'\u20AA'}</span>
      {displayPrice}
    </div>
  );
}
