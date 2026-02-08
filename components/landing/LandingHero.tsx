'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useSpring,
  useInView,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Users,
  Package,
  Store,
  Clock,
  Truck,
  MapPin,
  Gift,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import type {
  LandingProduct,
  LandingVendor,
  MarketplaceStats,
} from '@/lib/types/landing';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface LandingHeroProps {
  featuredProducts: LandingProduct[];
  vendors: LandingVendor[];
  stats: MarketplaceStats;
}

/* -------------------------------------------------------------------------- */
/*  Animated counter — uses Framer Motion spring                              */
/* -------------------------------------------------------------------------- */

function AnimatedCounter({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const springVal = useSpring(0, { stiffness: 40, damping: 25 });

  useEffect(() => {
    if (isInView) springVal.set(target);
  }, [isInView, springVal, target]);

  /* Subscribe to motion value and write to DOM imperatively for performance */
  useEffect(() => {
    const unsub = springVal.on('change', (v: number) => {
      if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
    });
    return unsub;
  }, [springVal, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Delivery / Pickup toggle                                                  */
/* -------------------------------------------------------------------------- */

type FulfillmentMode = 'delivery' | 'pickup';

function FulfillmentToggle({
  mode,
  onChange,
  t,
}: {
  mode: FulfillmentMode;
  onChange: (m: FulfillmentMode) => void;
  t: (text: string) => string;
}) {
  return (
    <div className="inline-flex rounded-full bg-kfar-cream border border-kfar-gold/30 p-1">
      {(['delivery', 'pickup'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`
            relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
            transition-colors duration-200 cursor-pointer select-none
            ${
              mode === m
                ? 'bg-kfar-mint text-white shadow-md'
                : 'text-soil-brown hover:text-kfar-mint'
            }
          `}
        >
          {m === 'delivery' ? (
            <Truck className="w-4 h-4 stroke-[1.5]" />
          ) : (
            <MapPin className="w-4 h-4 stroke-[1.5]" />
          )}
          {t(m === 'delivery' ? 'Delivery' : 'Pickup')}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bento product card (for the right-side grid)                              */
/* -------------------------------------------------------------------------- */

function BentoProductCard({
  product,
  index,
  shouldReduceMotion,
  isRTL,
}: {
  product: LandingProduct;
  index: number;
  shouldReduceMotion: boolean | null;
  isRTL: boolean;
}) {
  const { t, language } = useLanguage();
  const displayName =
    language === 'he' && product.nameHe ? product.nameHe : product.name;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.6 + index * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)' }
      }
      className="group cursor-pointer"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-shadow duration-300 border border-kfar-cream">
          {/* Image */}
          <div className="relative h-36 sm:h-44 overflow-hidden bg-kfar-cream">
            <Image
              src={product.image}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Badge */}
            {product.badge && (
              <span className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-earth-flame text-white text-[11px] font-bold tracking-wide">
                {product.badge}
              </span>
            )}
            {/* Quick add */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-2 end-2 w-9 h-9 bg-kfar-mint rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
              aria-label={t('Add to Cart')}
            >
              <ShoppingBag className="w-4 h-4 text-white stroke-[1.5]" />
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-[11px] text-gray-400 font-medium mb-0.5 truncate">
              {product.vendorName}
            </p>
            <h4 className="font-bold text-soil-brown text-sm leading-tight line-clamp-1 group-hover:text-kfar-mint transition-colors">
              {displayName}
            </h4>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-kfar-mint font-bold text-base">
                  {'\u20AA'}{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-gray-400 line-through text-xs">
                    {'\u20AA'}{product.originalPrice}
                  </span>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-sun-gold text-sun-gold stroke-[1.5]" />
                  <span className="text-xs text-gray-500 font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Vendor logo ticker (auto-scrolling)                                       */
/* -------------------------------------------------------------------------- */

function VendorLogoTicker({
  vendors,
  isRTL,
}: {
  vendors: LandingVendor[];
  isRTL: boolean;
}) {
  /* Duplicate the list so the scroll loops seamlessly */
  const doubled = [...vendors, ...vendors];

  return (
    <div className="relative overflow-hidden py-4">
      {/* Fade edges */}
      <div
        className="absolute inset-y-0 start-0 w-16 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(${isRTL ? 'to left' : 'to right'}, #FDFBF7, transparent)`,
        }}
      />
      <div
        className="absolute inset-y-0 end-0 w-16 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(${isRTL ? 'to right' : 'to left'}, #FDFBF7, transparent)`,
        }}
      />

      <motion.div
        className="flex gap-8 items-center"
        animate={{
          x: isRTL ? ['0%', '50%'] : ['0%', '-50%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {doubled.map((vendor, i) => (
          <Link
            key={`${vendor.id}-${i}`}
            href={`/vendor/${vendor.slug}`}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-kfar-cream hover:border-kfar-gold/40 transition-colors">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-kfar-cream flex-shrink-0">
                <Image
                  src={vendor.logo}
                  alt={vendor.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-semibold text-soil-brown whitespace-nowrap group-hover:text-kfar-mint transition-colors">
                {vendor.name}
              </span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stagger animation variants                                                */
/* -------------------------------------------------------------------------- */

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function LandingHero({
  featuredProducts,
  vendors,
  stats,
}: LandingHeroProps) {
  const { language, t, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>('delivery');

  /* Pick up to 6 featured products for bento */
  const bentoProducts = featuredProducts.slice(0, 6);

  /* Stat tiles */
  const statTiles = [
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: t('families'),
      color: 'text-kfar-mint',
      bg: 'bg-kfar-mint/10',
    },
    {
      icon: Package,
      value: stats.totalProducts,
      suffix: '+',
      label: t('products'),
      color: 'text-sun-gold',
      bg: 'bg-sun-gold/10',
    },
    {
      icon: Store,
      value: stats.totalVendors,
      suffix: '+',
      label: t('vendors'),
      color: 'text-earth-flame',
      bg: 'bg-earth-flame/10',
    },
    {
      icon: Clock,
      value: stats.yearsInBusiness,
      suffix: '+',
      label: t('years'),
      color: 'text-kfar-gold-premium',
      bg: 'bg-kfar-gold-premium/10',
    },
  ];

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative bg-kfar-warm-white overflow-hidden"
    >
      {/* ---- Welcome gift banner ---- */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-kfar-gold via-sun-gold to-kfar-gold-dark"
      >
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-white">
          <Gift className="w-4 h-4 stroke-[1.5] flex-shrink-0" />
          <p className="text-sm font-bold tracking-wide">
            {t('First 100 members get a welcome gift')}
          </p>
          <Link
            href="/customer/login"
            className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors cursor-pointer"
          >
            {t('Join KFAR')}
            <ArrowRight className="w-3 h-3 stroke-[1.5]" />
          </Link>
        </div>
      </motion.div>

      {/* ---- Main hero content ---- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* ------ LEFT column: text + stats ------ */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="order-2 lg:order-1 flex flex-col gap-6"
          >
            {/* Heritage badges */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kfar-mint/10 text-kfar-mint text-xs font-semibold border border-kfar-mint/20">
                <Leaf className="w-3.5 h-3.5 stroke-[1.5]" />
                {t('100% Plant-Based')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kfar-gold/10 text-kfar-gold-dark text-xs font-semibold border border-kfar-gold/20">
                <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                {t('50+ Years Heritage')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-display font-bold leading-[1.12] text-soil-brown tracking-tight"
            >
              {t('Your Community Marketplace')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={staggerItem}
              className="text-base sm:text-lg text-gray-600 max-w-lg leading-relaxed"
            >
              {language === 'he'
                ? 'חמישה מסעדות, שוק שישי, ויותר מ-50 שנות מורשת קהילתית -- הכל בפלטפורמה דיגיטלית אחת.'
                : 'Five restaurants, Shishi market, and 50+ years of community heritage -- all on one digital platform.'}
            </motion.p>

            {/* Fulfillment toggle */}
            <motion.div variants={staggerItem}>
              <FulfillmentToggle
                mode={fulfillment}
                onChange={setFulfillment}
                t={t}
              />
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
              <Link href="/marketplace">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-kfar-mint text-white font-semibold shadow-glow-green hover:bg-kfar-mint-dark transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  {t('Shop Now')}
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </motion.span>
              </Link>

              <Link href="/vendors">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-kfar-gold text-kfar-gold-dark font-semibold hover:bg-kfar-gold/10 transition-colors cursor-pointer"
                >
                  <Store className="w-5 h-5 stroke-[1.5]" />
                  {t('Explore Vendors')}
                </motion.span>
              </Link>
            </motion.div>

            {/* Stat counters */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2"
            >
              {statTiles.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={`flex flex-col items-center gap-1 rounded-xl ${s.bg} border border-white/60 py-3 px-2`}
                  >
                    <Icon className={`w-5 h-5 ${s.color} stroke-[1.5]`} />
                    <span className={`text-2xl font-bold ${s.color}`}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 text-center leading-tight">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* ------ RIGHT column: Bento product grid ------ */}
          <div className="order-1 lg:order-2">
            {/* Desktop: 2-col bento grid */}
            <div className="hidden sm:grid grid-cols-2 gap-3">
              {bentoProducts.map((product, i) => (
                <BentoProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  shouldReduceMotion={shouldReduceMotion}
                  isRTL={isRTL}
                />
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="sm:hidden -mx-4 px-4">
              <div
                className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {bentoProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[70vw] max-w-[260px] snap-start"
                  >
                    <BentoProductCard
                      product={product}
                      index={i}
                      shouldReduceMotion={shouldReduceMotion}
                      isRTL={isRTL}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Vendor logo ticker ---- */}
        <div className="mt-10 border-t border-kfar-cream pt-2">
          <VendorLogoTicker vendors={vendors} isRTL={isRTL} />
        </div>
      </div>
    </section>
  );
}
