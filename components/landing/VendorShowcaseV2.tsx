'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Landmark,
  Leaf,
  Truck,
  Star,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { LandingVendor } from '@/lib/types/landing';

/* ─────────────────────────────────────────────
   Value Card Data
   ───────────────────────────────────────────── */
interface ValueItem {
  icon: React.ElementType;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  bgClass: string;
  iconColor: string;
}

const values: ValueItem[] = [
  {
    icon: Landmark,
    titleEn: '50+ Years Heritage',
    titleHe: '50+ שנות מורשת',
    descEn:
      'Rooted in the Village of Peace, founded in 1973. Over five decades of community, culture, and conscious living.',
    descHe:
      'מושרשים בכפר השלום, שנוסד ב-1973. למעלה מחמישה עשורים של קהילה, תרבות וחיים מודעים.',
    bgClass: 'bg-kfar-gold/10',
    iconColor: 'text-kfar-gold-dark',
  },
  {
    icon: Leaf,
    titleEn: '100% Plant-Based',
    titleHe: '100% צמחי',
    descEn:
      'Every product on our marketplace is fully vegan. Pioneering plant-based living since before it was mainstream.',
    descHe:
      'כל מוצר בשוק שלנו הוא טבעוני לחלוטין. חלוצים בחיים מבוססי צמחים עוד לפני שזה הפך למיינסטרים.',
    bgClass: 'bg-leaf-green/10',
    iconColor: 'text-leaf-green',
  },
  {
    icon: Truck,
    titleEn: 'Same-Day Delivery',
    titleHe: 'משלוח באותו יום',
    descEn:
      'Order before 2 PM and receive your goods the same day. Local delivery by community members you know and trust.',
    descHe:
      'הזמינו לפני 14:00 וקבלו את המוצרים באותו יום. משלוח מקומי על ידי חברי קהילה שאתם מכירים וסומכים עליהם.',
    bgClass: 'bg-sun-gold/10',
    iconColor: 'text-sun-gold-dark',
  },
];

/* ─────────────────────────────────────────────
   Value Card Component
   ───────────────────────────────────────────── */
function ValueCard({
  item,
  index,
  shouldReduceMotion,
}: {
  item: ValueItem;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const { language } = useLanguage();
  const Icon = item.icon;

  return (
    <motion.div
      className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.12,
        ease: 'easeOut',
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -4, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.1)' }
      }
    >
      {/* Icon Circle */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${item.bgClass}`}
      >
        <Icon className={`w-5 h-5 stroke-[1.5] ${item.iconColor}`} />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <h3 className="text-base font-bold text-soil-brown leading-tight">
          {language === 'he' ? item.titleHe : item.titleEn}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-3">
          {language === 'he' ? item.descHe : item.descEn}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Vendor Card Component
   ───────────────────────────────────────────── */
function VendorCard({
  vendor,
  index,
  shouldReduceMotion,
}: {
  vendor: LandingVendor;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const { t, isRTL } = useLanguage();

  const rating = vendor.rating ?? 5.0;
  const top3 = vendor.topProducts.slice(0, 3);

  return (
    <motion.div
      className="relative bg-white rounded-2xl overflow-hidden border border-gray-100"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        delay: shouldReduceMotion ? 0 : 0.15 + index * 0.1,
        ease: 'easeOut',
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : { y: -6, boxShadow: '0 20px 48px -12px rgba(0,0,0,0.12)' }
      }
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Vendor header */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
            <Image
              src={vendor.logo}
              alt={vendor.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-soil-brown truncate leading-tight">
              {vendor.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-sun-gold text-sun-gold stroke-[1.5]" />
                <span className="text-xs font-semibold text-gray-700">
                  {rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Package className="w-3 h-3 stroke-[1.5]" />
                {vendor.productCount} {t('products')}
              </span>
            </div>
          </div>
        </div>

        {/* Top product thumbnails */}
        {top3.length > 0 && (
          <div className="flex items-center gap-2">
            {top3.map((prod) => (
              <div
                key={prod.id}
                className="relative w-10 h-10 rounded-lg overflow-hidden bg-kfar-cream border border-gray-100 flex-shrink-0"
              >
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ))}
            {vendor.productCount > 3 && (
              <span className="text-[11px] text-gray-400 font-medium ml-1">
                +{vendor.productCount - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link href={`/vendor/${vendor.slug}`} className="block">
          <motion.button
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-leaf-green/10 py-2.5 text-sm font-bold text-leaf-green cursor-pointer transition-colors hover:bg-leaf-green hover:text-white"
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {t('Visit Store')}
            <ArrowRight
              className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`}
            />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   VendorShowcaseV2 Section
   ───────────────────────────────────────────── */
export default function VendorShowcaseV2({
  vendors,
}: {
  vendors: LandingVendor[];
}) {
  const { language, t, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const sectionTitle =
    language === 'he' ? 'הספקים והערכים שלנו' : 'Our Vendors & Values';
  const sectionSubtitle =
    language === 'he'
      ? 'גלו את העסקים והערכים שהופכים את כפר השלום ליחודי'
      : 'Discover the businesses and values that make Village of Peace unique';

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-20 relative overflow-hidden bg-kfar-cream"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Subtle decorative bg */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(71,140,11,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
        >
          <span className="inline-block text-leaf-green text-sm font-semibold uppercase tracking-wider mb-2">
            {language === 'he' ? 'הקהילה שלנו' : 'Our Community'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-soil-brown tracking-tight">
            {sectionTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Two-column layout: values + vendors */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left Column — Value Cards */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 space-y-4">
            {values.map((item, i) => (
              <ValueCard
                key={item.titleEn}
                item={item}
                index={i}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>

          {/* Right Column — Vendor Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {vendors.map((vendor, i) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  index={i}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: shouldReduceMotion ? 0 : 0.3,
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: 'easeOut',
          }}
        >
          <Link href="/vendors">
            <motion.button
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-leaf-green text-white font-bold text-sm cursor-pointer transition-colors hover:bg-leaf-green-dark"
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.02,
                      boxShadow: '0 12px 32px -8px rgba(71,140,11,0.4)',
                    }
              }
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {t('Explore Vendors')}
              <ArrowRight
                className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`}
              />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
