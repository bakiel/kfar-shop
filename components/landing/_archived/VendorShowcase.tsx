'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package, Star } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getVendors, getProductsByVendor, VendorStore } from './archived-data';

// Simple vendor card with enhanced animations
const VendorCard = ({
  vendor,
  index,
  language,
  isRTL,
  shouldReduceMotion
}: {
  vendor: VendorStore;
  index: number;
  language: string;
  isRTL: boolean;
  shouldReduceMotion: boolean | null;
}) => {
  const products = useMemo(() => {
    return getProductsByVendor(vendor.id).slice(0, 3);
  }, [vendor.id]);

  const rating = vendor.analytics?.averageRating || 5.0;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: 'easeOut' as const
      }
    }
  };

  return (
    <Link href={`/vendor/${vendor.id}`} className="block group cursor-pointer">
      <motion.div
        className="relative bg-white rounded-2xl md:rounded-3xl overflow-hidden h-full"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        whileHover={shouldReduceMotion ? {} : {
          y: -8,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}
        transition={{ duration: 0.2, ease: 'easeOut' as const }}
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Top section with logo */}
        <div className="relative p-4 md:p-5 pb-0">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-100 flex-shrink-0 group-hover:border-leaf-green/30 transition-colors">
              <Image
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 font-display truncate group-hover:text-leaf-green transition-colors tracking-tight">
                {vendor.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-4 h-4 fill-sun-gold text-sun-gold" />
                <span className="text-sm font-semibold text-gray-700 font-accent">{rating}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1 font-body">
                  <Package className="w-3 h-3" />
                  {vendor.products.length} {language === 'he' ? 'מוצרים' : 'items'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 hidden md:block font-body leading-relaxed">
                {vendor.description}
              </p>
            </div>
          </div>
        </div>

        {/* Products preview */}
        <div className="p-4 md:p-5">
          <div className="flex gap-2">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="relative flex-1 aspect-square rounded-lg md:rounded-xl overflow-hidden bg-gray-100"
                initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.2 + i * 0.1,
                  duration: shouldReduceMotion ? 0 : 0.3,
                  ease: 'easeOut' as const
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              >
                <Image
                  src={product.image || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-5 pb-4 md:pb-5">
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm text-leaf-green font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all font-accent">
              {language === 'he' ? 'צפה בחנות' : 'Visit Store'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </span>
            <span className="text-xs text-gray-400 font-body">
              {language === 'he' ? 'כפר השלום' : 'Village of Peace'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const VendorShowcase = () => {
  const { language, isRTL } = useLanguage();
  const vendors = getVendors();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faf5 100%)' }}
    >
      {/* Subtle background accents */}
      <div className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(71, 140, 11, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="absolute bottom-20 left-0 w-[250px] h-[250px] rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(246, 175, 13, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' as const }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-14"
        >
          <div>
            <span className="text-leaf-green text-sm font-semibold uppercase tracking-wider mb-2 block font-accent">
              {language === 'he' ? 'הקהילה שלנו' : 'Our Community'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-display tracking-tight">
              {language === 'he' ? 'קנו מהספקים המובילים' : 'Shop from Top Vendors'}
            </h2>
          </div>

          <Link href="/vendors" className="group cursor-pointer">
            <motion.span
              className="inline-flex items-center gap-2 text-leaf-green font-semibold hover:text-leaf-green/80 transition-colors"
              whileHover={shouldReduceMotion ? {} : { x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {language === 'he' ? 'כל הספקים' : 'View All Vendors'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </motion.span>
          </Link>
        </motion.div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {vendors.slice(0, 6).map((vendor, index) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              index={index}
              language={language}
              isRTL={isRTL}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' as const }}
          className="text-center mt-12 md:mt-16"
        >
          <p className="text-gray-500 mb-4 text-sm md:text-base font-body">
            {language === 'he'
              ? 'רוצים להצטרף לקהילה שלנו?'
              : 'Want to join our community?'
            }
          </p>
          <Link href="/become-a-vendor">
            <motion.button
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 border-2 border-leaf-green text-leaf-green rounded-full font-semibold hover:bg-leaf-green hover:text-white transition-colors duration-300 cursor-pointer font-accent"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, boxShadow: '0 10px 30px -10px rgba(71, 140, 11, 0.4)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {language === 'he' ? 'הפכו לספק' : 'Become a Vendor'}
              <motion.span
                className={isRTL ? 'rotate-180' : ''}
                whileHover={shouldReduceMotion ? {} : { x: 4 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default VendorShowcase;
