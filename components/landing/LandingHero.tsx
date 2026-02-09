'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useSpring,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
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
/*  Hero spotlight card (first product, larger)                               */
/* -------------------------------------------------------------------------- */

function HeroSpotlightCard({
  product,
  shouldReduceMotion,
}: {
  product: LandingProduct;
  shouldReduceMotion: boolean | null;
}) {
  const { t, language } = useLanguage();
  const displayName =
    language === 'he' && product.nameHe ? product.nameHe : product.name;
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <motion.div
      ref={cardRef}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -8, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.15)' }
      }
      className="group cursor-pointer col-span-2"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-medium hover:shadow-strong transition-shadow duration-300 border border-kfar-cream">
          <div className="relative h-56 sm:h-64 overflow-hidden bg-kfar-cream">
            <motion.div className="absolute inset-0" style={{ y: imageY }}>
              <Image
                src={product.image}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
            </motion.div>
            {product.badge && (
              <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-earth-flame text-white text-xs font-bold tracking-wide z-10">
                {product.badge}
              </span>
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-3 end-3 w-10 h-10 bg-kfar-mint rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer z-10"
              aria-label={t('Add to Cart')}
            >
              <ShoppingBag className="w-5 h-5 text-white stroke-[1.5]" />
            </motion.div>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-400 font-medium mb-1 truncate">
              {product.vendorName}
            </p>
            <h4 className="font-bold text-soil-brown text-base leading-tight line-clamp-1 group-hover:text-kfar-mint transition-colors">
              {displayName}
            </h4>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-kfar-mint font-bold text-lg">
                  {'\u20AA'}{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-gray-400 line-through text-sm">
                    {'\u20AA'}{product.originalPrice}
                  </span>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-sun-gold text-sun-gold stroke-[1.5]" />
                  <span className="text-sm text-gray-500 font-medium">
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
/*  Bento product card (for the right-side grid)                              */
/* -------------------------------------------------------------------------- */

function BentoProductCard({
  product,
  index,
  shouldReduceMotion,
  isRTL,
  isPriority,
}: {
  product: LandingProduct;
  index: number;
  shouldReduceMotion: boolean | null;
  isRTL: boolean;
  isPriority?: boolean;
}) {
  const { t, language } = useLanguage();
  const displayName =
    language === 'he' && product.nameHe ? product.nameHe : product.name;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.7 + index * 0.1,
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
          <div className="relative h-36 sm:h-44 overflow-hidden bg-kfar-cream">
            <Image
              src={product.image}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={isPriority}
            />
            {product.badge && (
              <span className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-earth-flame text-white text-[11px] font-bold tracking-wide">
                {product.badge}
              </span>
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-2 end-2 w-9 h-9 bg-kfar-mint rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
              aria-label={t('Add to Cart')}
            >
              <ShoppingBag className="w-4 h-4 text-white stroke-[1.5]" />
            </motion.div>
          </div>
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
  const doubled = [...vendors, ...vendors];

  return (
    <div className="relative overflow-hidden py-4">
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
/*  Animated mesh gradient background                                         */
/* -------------------------------------------------------------------------- */

function MeshGradientBg({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const x1 = useMotionValue(30);
  const y1 = useMotionValue(20);
  const x2 = useMotionValue(70);
  const y2 = useMotionValue(80);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.003;
      x1.set(30 + Math.sin(t * 0.7) * 15);
      y1.set(20 + Math.cos(t * 0.5) * 15);
      x2.set(70 + Math.cos(t * 0.6) * 15);
      y2.set(80 + Math.sin(t * 0.8) * 15);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [shouldReduceMotion, x1, y1, x2, y2]);

  const bg = useMotionTemplate`
    radial-gradient(ellipse 60% 50% at ${x1}% ${y1}%, rgba(71,140,11,0.07) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at ${x2}% ${y2}%, rgba(196,162,101,0.06) 0%, transparent 70%)
  `;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: bg }}
    />
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
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
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

  /* First product is the spotlight; rest go to bento grid */
  const spotlightProduct = featuredProducts[0];
  const bentoProducts = featuredProducts.slice(1, 6);

  /* Stat tiles */
  const statTiles = [
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: t('families'),
      color: 'text-kfar-mint',
    },
    {
      icon: Package,
      value: stats.totalProducts,
      suffix: '+',
      label: t('products'),
      color: 'text-sun-gold',
    },
    {
      icon: Store,
      value: stats.totalVendors,
      suffix: '+',
      label: t('vendors'),
      color: 'text-earth-flame',
    },
    {
      icon: Clock,
      value: stats.yearsInBusiness,
      suffix: '+',
      label: t('years'),
      color: 'text-kfar-gold-premium',
    },
  ];

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative bg-kfar-warm-white overflow-hidden"
    >
      {/* Animated mesh gradient */}
      <MeshGradientBg shouldReduceMotion={shouldReduceMotion} />

      {/* ---- Welcome gift banner with shimmer ---- */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-kfar-gold via-sun-gold to-kfar-gold-dark overflow-hidden"
      >
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }}
        />
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-white relative z-10">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-14 items-start">
          {/* ------ LEFT column: text ------ */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="order-1 lg:order-1 flex flex-col gap-4 sm:gap-6 min-w-0"
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

            {/* Headline — bigger, split into two lines */}
            <motion.h1
              variants={staggerItem}
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.08] text-soil-brown"
              style={{ letterSpacing: '-0.03em' }}
            >
              {language === 'he' ? (
                <>
                  השוק הקהילתי
                  <br />
                  <span className="text-leaf-green">שלך</span>
                </>
              ) : (
                <>
                  Your Community
                  <br />
                  <span className="text-leaf-green">Marketplace</span>
                </>
              )}
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
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/marketplace">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-full bg-kfar-mint text-white font-semibold shadow-glow-green hover:bg-kfar-mint-dark transition-colors cursor-pointer text-sm sm:text-base"
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
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-full border-2 border-kfar-gold text-kfar-gold-dark font-semibold hover:bg-kfar-gold/10 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <Store className="w-5 h-5 stroke-[1.5]" />
                  {t('Explore Vendors')}
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ------ RIGHT column: Spotlight + Bento product grid ------ */}
          <div className="order-2 lg:order-2 min-w-0">
            {/* Desktop: spotlight + bento */}
            <div className="hidden sm:grid grid-cols-2 gap-3">
              {spotlightProduct && (
                <HeroSpotlightCard
                  product={spotlightProduct}
                  shouldReduceMotion={shouldReduceMotion}
                />
              )}
              {bentoProducts.map((product, i) => (
                <BentoProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  shouldReduceMotion={shouldReduceMotion}
                  isRTL={isRTL}
                  isPriority={i === 0}
                />
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="sm:hidden -mx-4 px-4">
              <div
                className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {featuredProducts.slice(0, 6).map((product, i) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[62vw] max-w-[240px] snap-start"
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
              {/* Scroll hint */}
              <div className="flex justify-center gap-1.5 mt-2">
                {featuredProducts.slice(0, 6).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-kfar-mint' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Glassmorphism stats strip ---- */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 sm:mt-10 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-soft px-4 sm:px-6 py-4 sm:py-5"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {statTiles.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 ${s.color} stroke-[1.5]`} />
                  </div>
                  <div>
                    <span className={`text-xl sm:text-2xl font-accent font-bold ${s.color}`}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </span>
                    <p className="text-[11px] font-medium text-gray-500 leading-tight">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ---- Vendor logo ticker ---- */}
        <div className="mt-6 border-t border-kfar-cream pt-2">
          <VendorLogoTicker vendors={vendors} isRTL={isRTL} />
        </div>
      </div>
    </section>
  );
}
