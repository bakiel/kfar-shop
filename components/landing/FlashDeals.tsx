'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { FlashDeal } from '@/lib/types/landing';

/* ─────────────────────────────────────────────
   Countdown Hook
   ───────────────────────────────────────────── */
function useCountdown(endsAt: string) {
  const getRemaining = useCallback(() => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      hours: Math.floor(diff / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
      expired: false,
    };
  }, [endsAt]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1_000);
    return () => clearInterval(id);
  }, [getRemaining]);

  return remaining;
}

/* ─────────────────────────────────────────────
   Countdown Display
   ───────────────────────────────────────────── */
function CountdownDisplay({ endsAt }: { endsAt: string }) {
  const { t } = useLanguage();
  const { hours, minutes, seconds, expired } = useCountdown(endsAt);

  if (expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-kfar-gold-dark stroke-[1.5]" />
      <span className="text-xs font-medium text-soil-brown/70">{t('Ends in')}</span>
      <div className="flex items-center gap-0.5">
        {[pad(hours), pad(minutes), pad(seconds)].map((val, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-xs font-bold text-soil-brown/40">:</span>}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-kfar-cream text-xs font-bold text-soil-brown tabular-nums">
              {val}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stock Bar
   ───────────────────────────────────────────── */
function StockBar({
  remaining,
  limit,
}: {
  remaining: number;
  limit: number;
}) {
  const { t } = useLanguage();
  const pct = Math.max(0, Math.min(100, (remaining / limit) * 100));
  const isLow = pct < 30;

  return (
    <div className="space-y-1">
      <div className="relative h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isLow ? 'bg-orange-500' : 'bg-leaf-green'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
        />
      </div>
      <p
        className={`text-xs font-medium ${
          isLow ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        {isLow
          ? t('Stock running low')
          : `${remaining} ${t('left')}`}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Deal Card
   ───────────────────────────────────────────── */
function DealCard({
  deal,
  index,
  shouldReduceMotion,
}: {
  deal: FlashDeal;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const { language, t, isRTL } = useLanguage();
  const isLow = deal.stockRemaining / deal.stockLimit < 0.3;

  const name =
    language === 'he' && deal.productNameHe
      ? deal.productNameHe
      : deal.productName;

  return (
    <motion.div
      className={`
        relative flex-shrink-0 w-[220px] sm:w-[240px] md:w-auto md:flex-shrink
        snap-center bg-white rounded-2xl overflow-hidden
        border ${isLow ? 'border-orange-200' : 'border-gray-100'}
      `}
      initial={
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 24 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.45,
        delay: shouldReduceMotion ? 0 : index * 0.08, ease: 'easeOut' as const,
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -6, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12)' }
      }
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      {/* Savings Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
          -{deal.savingsPercent}%
        </span>
      </div>

      {/* Urgency pulse on low stock */}
      {isLow && (
        <div className="absolute inset-0 rounded-2xl border-2 border-orange-300 animate-pulse pointer-events-none z-0" />
      )}

      {/* Product Image */}
      <div className="relative w-full aspect-square bg-kfar-cream">
        <Image
          src={deal.productImage}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 220px, 240px"
          quality={60}
        />
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2.5">
        {/* Countdown */}
        <CountdownDisplay endsAt={deal.endsAt} />

        {/* Name */}
        <h3 className="text-sm font-bold text-soil-brown leading-tight line-clamp-2">
          {name}
        </h3>

        {/* Vendor */}
        <p className="text-[11px] text-gray-400 font-medium">
          {deal.vendorName}
        </p>

        {/* Price Row */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-leaf-green">
            {deal.dealPrice.toFixed(0)}&nbsp;
            <span className="text-xs font-bold">{language === 'he' ? '\u20AA' : 'ILS'}</span>
          </span>
          <span className="text-xs text-gray-400 line-through">
            {deal.originalPrice.toFixed(0)}
          </span>
        </div>

        {/* Stock */}
        <StockBar remaining={deal.stockRemaining} limit={deal.stockLimit} />

        {/* CTA */}
        <Link href={`/product/${deal.productId}`} className="block">
          <motion.button
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-kfar-gold py-2.5 text-sm font-bold text-white cursor-pointer transition-colors hover:bg-kfar-gold-dark"
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {t('Buy Now')}
            <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FlashDeals Section
   ───────────────────────────────────────────── */
export default function FlashDeals({ deals }: { deals: FlashDeal[] }) {
  const { t, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Filter to active, non-expired deals
  const activeDeals = useMemo(
    () =>
      deals.filter(
        (d) => d.isActive && new Date(d.endsAt).getTime() > Date.now()
      ),
    [deals]
  );

  // Conditionally render nothing when no active deals
  if (activeDeals.length === 0) return null;

  return (
    <section
      className="py-12 md:py-16 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background:
          'linear-gradient(180deg, #FDFBF7 0%, #fef9ef 40%, #FDFBF7 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(246,175,13,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute bottom-0 -left-16 w-64 h-64 rounded-full pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(71,140,11,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: 'easeOut' as const }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-kfar-gold/15">
              <Zap className="w-5 h-5 text-kfar-gold-dark stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-soil-brown tracking-tight">
                {t('Flash Deals')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                {t('Fresh promotions from our vendors \u2022 Updated every hour')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Deals — horizontal scroll on mobile, grid on md+ */}
        <div className="md:hidden -mx-4 px-4">
          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {activeDeals.map((deal, i) => (
              <DealCard
                key={deal.id}
                deal={deal}
                index={i}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activeDeals.map((deal, i) => (
            <DealCard
              key={deal.id}
              deal={deal}
              index={i}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
