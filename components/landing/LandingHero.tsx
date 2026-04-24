'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useSpring,
  useInView,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Users,
  Package,
  Store,
  Clock,
  Truck,
  MapPin,
  Gift,
  Leaf,
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
/*  Rotating hero images                                                       */
/* -------------------------------------------------------------------------- */

const heroImages = [
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_03.jpg',
    alt: 'Community members at the Village of Peace market',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_02.jpg',
    alt: 'Young dancers in vibrant red and black at the Village of Peace',
  },
  {
    src: '/images/community/food/1.jpg',
    alt: 'Fresh plant-based food from KFAR vendors',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_65.jpg',
    alt: 'Happy children of the Village of Peace community',
  },
  {
    src: '/images/community/agriculture/1.jpg',
    alt: 'Organic farming at the Village of Peace',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_66.jpg',
    alt: 'Women dancing joyfully at a Village of Peace celebration',
  },
];

function RotatingHeroImage({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-strong hero-image-breathe">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[current].src}
            alt={heroImages[current].alt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={65}
            className="object-cover"
            priority={current === 0}
          />
          {/* Subtle gradient overlay for polish */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Image dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === current
                ? 'bg-white w-5'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`View image ${i + 1}`}
          />
        ))}
      </div>
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
  stats,
}: LandingHeroProps) {
  const { language, t, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>('delivery');

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
      className="relative bg-kfar-warm-white overflow-hidden hero-grain"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center">
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

            {/* Headline */}
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
              className="text-base sm:text-lg text-gray-700 max-w-lg leading-relaxed"
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
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-full bg-kfar-gold-premium text-soil-brown font-semibold hover:bg-kfar-gold transition-colors cursor-pointer text-sm sm:text-base shadow-sm"
                >
                  <Store className="w-5 h-5 stroke-[1.5]" />
                  {t('Explore Vendors')}
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ------ RIGHT column: Rotating hero image ------ */}
          <motion.div
            className="order-2 lg:order-2 min-w-0"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative h-[280px] sm:h-[360px] lg:h-[420px]">
              <RotatingHeroImage shouldReduceMotion={shouldReduceMotion} />
            </div>
          </motion.div>
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
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
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
      </div>
    </section>
  );
}
