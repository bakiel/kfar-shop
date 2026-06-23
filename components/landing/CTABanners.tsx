'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ShoppingBag, Store, ArrowRight, Users, Leaf, Heart, Truck, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CTABanners() {
  const { language, isRTL } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' as const },
    },
  };

  const floatVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.6 },
    },
  };

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <motion.div
        className="max-w-7xl mx-auto text-center mb-10 sm:mb-14"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[#3a3a1d]">
          {language === 'he' ? 'הצטרפו לקהילה' : 'Join the Community'}
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#3a3a1d]/70 max-w-2xl mx-auto">
          {language === 'he'
            ? 'בין אם אתם קונים, מוכרים, או מבצעים משלוחים - כפר מרקט מחבר אתכם לקהילה'
            : 'Whether you shop, sell, or deliver -- KFAR Marketplace connects you to the Village'}
        </p>
      </motion.div>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* 1. Customer CTA - Shop the Village */}
        <motion.div variants={cardVariants} className="group">
          <Link href="/marketplace" className="block cursor-pointer">
            <motion.div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-[300px] sm:h-[380px] lg:h-[420px]"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
            >
              <Image
                src="/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_03.jpg"
                alt="Community member shopping for fresh produce at the Village of Peace market"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={60}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

              {/* Floating Badge */}
              <motion.div
                variants={floatVariants}
                className={`absolute top-4 sm:top-5 ${isRTL ? 'left-4 sm:left-5' : 'right-4 sm:right-5'} bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#478c0b]/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3a3a1d]/60 font-medium">
                      {language === 'he' ? 'משפחות פעילות' : 'Active Families'}
                    </p>
                    <p className="text-sm font-bold text-[#3a3a1d]">500+</p>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { icon: Leaf, label: language === 'he' ? '100% טבעוני' : '100% Vegan' },
                    { icon: Heart, label: language === 'he' ? 'מהקהילה' : 'Community Made' },
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20"
                    >
                      <tag.icon className="w-3 h-3 stroke-[1.5]" />
                      {tag.label}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2">
                  {language === 'he' ? 'קנו מהכפר' : 'Shop the Village'}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-sm">
                  {language === 'he'
                    ? 'מוצרים טבעוניים טריים, ביגוד קהילתי ומוצרי בית -- ישירות מהשכנים שלכם'
                    : 'Fresh vegan products, community apparel & home goods -- straight from your neighbours'}
                </p>

                <div>
                  <span className="inline-flex items-center gap-2 bg-white text-[#478c0b] font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:bg-[#478c0b] group-hover:text-white cursor-pointer">
                    <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    {language === 'he' ? 'התחילו לקנות' : 'Start Shopping'}
                    <ArrowRight
                      className={`w-4 h-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''
                      }`}
                    />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 2. Vendor CTA - Grow Your Business */}
        <motion.div variants={cardVariants} className="group">
          <Link href="/become-a-vendor" className="block cursor-pointer">
            <motion.div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-[300px] sm:h-[380px] lg:h-[420px]"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
            >
              <Image
                src="/images/community/agriculture/1.jpg"
                alt="Community farmer tending to organic kale at the Village of Peace farm"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={60}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D5A27]/90 via-[#2D5A27]/40 to-black/10" />

              {/* Floating Badge */}
              <motion.div
                variants={floatVariants}
                className={`absolute top-4 sm:top-5 ${isRTL ? 'left-4 sm:left-5' : 'right-4 sm:right-5'} bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C4A265]/10 flex items-center justify-center">
                    <Store className="w-4 h-4 text-[#C4A265] stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3a3a1d]/60 font-medium">
                      {language === 'he' ? 'חנויות פעילות' : 'Active Vendors'}
                    </p>
                    <p className="text-sm font-bold text-[#3a3a1d]">6</p>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: language === 'he' ? 'אפס עמלות' : 'Zero Fees' },
                    { label: language === 'he' ? 'ניהול קל' : 'Easy Dashboard' },
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2">
                  {language === 'he' ? 'הצמיחו את העסק' : 'Grow Your Business'}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-sm">
                  {language === 'he'
                    ? 'הצטרפו למרקטפלייס הקהילתי -- הגיעו ל-500+ משפחות ללא עמלות'
                    : 'Join our community marketplace -- reach 500+ local families with zero commission fees'}
                </p>

                <div>
                  <span className="inline-flex items-center gap-2 bg-[#C4A265] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:bg-white group-hover:text-[#2D5A27] cursor-pointer">
                    <Store className="w-4 h-4 stroke-[1.5]" />
                    {language === 'he' ? 'הצטרפו כמוכרים' : 'Become a Vendor'}
                    <ArrowRight
                      className={`w-4 h-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''
                      }`}
                    />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 3. Driver CTA - Deliver for KFAR */}
        <motion.div variants={cardVariants} className="group md:col-span-2 lg:col-span-1">
          <Link href="/become-a-driver" className="block cursor-pointer">
            <motion.div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-[300px] sm:h-[380px] lg:h-[420px]"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
            >
              <Image
                src="/images/community/delivery_driver_1.jpg"
                alt="KFAR delivery driver cycling through the Village of Peace with fresh produce"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={60}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/90 via-[#1a3a5c]/40 to-black/10" />

              {/* Floating Badge */}
              <motion.div
                variants={floatVariants}
                className={`absolute top-4 sm:top-5 ${isRTL ? 'left-4 sm:left-5' : 'right-4 sm:right-5'} bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#478c0b]/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3a3a1d]/60 font-medium">
                      {language === 'he' ? 'משלוחים יומיים' : 'Daily Deliveries'}
                    </p>
                    <p className="text-sm font-bold text-[#3a3a1d]">50+</p>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { icon: Clock, label: language === 'he' ? 'שעות גמישות' : 'Flexible Hours' },
                    { icon: MapPin, label: language === 'he' ? 'משלוח מקומי' : 'Local Routes' },
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20"
                    >
                      <tag.icon className="w-3 h-3 stroke-[1.5]" />
                      {tag.label}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2">
                  {language === 'he' ? 'הפכו לשליח' : 'Deliver for KFAR'}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-sm">
                  {language === 'he'
                    ? 'הרוויחו תוך כדי שירות הקהילה שלכם. שעות גמישות, מסלולים מקומיים, תמיכה מלאה'
                    : 'Earn while serving your community. Flexible hours, local routes, and full support from day one'}
                </p>

                <div>
                  <span className="inline-flex items-center gap-2 bg-white text-[#1a3a5c] font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:bg-[#478c0b] group-hover:text-white cursor-pointer">
                    <Truck className="w-4 h-4 stroke-[1.5]" />
                    {language === 'he' ? 'הצטרפו כשליח' : 'Become a Driver'}
                    <ArrowRight
                      className={`w-4 h-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1 ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''
                      }`}
                    />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
