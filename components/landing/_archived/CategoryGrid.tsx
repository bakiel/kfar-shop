'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTopCategories, getProductsByCategory, EnhancedProduct } from './archived-data';

// Category card with product images and enhanced animations
const CategoryCard = ({
  category,
  index,
  isLarge = false,
  language,
  isRTL,
  shouldReduceMotion
}: {
  category: any;
  index: number;
  isLarge?: boolean;
  language: string;
  isRTL: boolean;
  shouldReduceMotion: boolean | null;
}) => {
  const products = useMemo((): EnhancedProduct[] => {
    try {
      return getProductsByCategory(category.id).slice(0, isLarge ? 4 : 3);
    } catch {
      return [];
    }
  }, [category.id, isLarge]);

  // Premium gradient backgrounds
  const gradients = [
    'from-emerald-900 to-emerald-700',
    'from-amber-800 to-amber-600',
    'from-rose-900 to-rose-700',
    'from-slate-800 to-slate-600',
    'from-violet-900 to-violet-700',
    'from-teal-800 to-teal-600',
    'from-orange-800 to-orange-600',
    'from-indigo-900 to-indigo-700',
  ];

  const gradient = gradients[index % gradients.length];

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
    <Link href={`/marketplace?category=${category.id}`} className="block h-full group cursor-pointer">
      <motion.div
        className={`relative h-full rounded-2xl md:rounded-3xl overflow-hidden ${
          isLarge ? 'min-h-[320px] md:min-h-[400px]' : 'min-h-[200px] md:min-h-[240px]'
        }`}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        whileHover={shouldReduceMotion ? {} : {
          y: -6,
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)'
        }}
        transition={{ duration: 0.2, ease: 'easeOut' as const }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Product images - floating grid */}
        <div className="absolute inset-0 overflow-hidden">
          {products.length > 0 && (
            <div className={`absolute ${isLarge ? 'right-[-20px] top-4' : 'right-[-10px] top-2'} transform rotate-12`}>
              <div className={`grid ${isLarge ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-1'}`}>
                {products.slice(0, isLarge ? 4 : 2).map((product, i) => (
                  <motion.div
                    key={product.id}
                    className={`relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 ${
                      isLarge ? 'w-24 h-24 md:w-32 md:h-32' : 'w-16 h-16 md:w-20 md:h-20'
                    }`}
                    initial={shouldReduceMotion ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -12 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : 0.3 + i * 0.1,
                      duration: shouldReduceMotion ? 0 : 0.4,
                      ease: 'easeOut' as const
                    }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 3 }}
                    style={{
                      transform: `rotate(${-12 + i * 3}deg)`,
                    }}
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
          )}
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative h-full p-4 md:p-6 flex flex-col justify-end">
          {/* Category name */}
          <h3 className={`font-bold text-white font-display mb-1 tracking-tight ${
            isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
          }`}>
            {language === 'he' ? category.nameHe : category.name}
          </h3>

          {/* Product count */}
          <p className="text-white/70 text-sm mb-3 font-body">
            {category.count} {language === 'he' ? 'מוצרים' : 'items'}
          </p>

          {/* Shop now link */}
          <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
            <span className="text-sm font-medium font-accent">
              {language === 'he' ? 'קנה עכשיו' : 'Shop Now'}
            </span>
            <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
      </motion.div>
    </Link>
  );
};

const CategoryGrid = () => {
  const { language, isRTL } = useLanguage();
  const categories = getTopCategories(6);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: '#fafafa' }}
    >
      {/* Subtle background accents */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(71, 140, 11, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(246, 175, 13, 0.08) 0%, transparent 70%)',
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
              {language === 'he' ? 'גלו את המגוון' : 'Explore Our Selection'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-display tracking-tight">
              {language === 'he' ? 'קנו לפי קטגוריה' : 'Shop by Category'}
            </h2>
          </div>

          <Link href="/marketplace" className="group cursor-pointer">
            <motion.span
              className="inline-flex items-center gap-2 text-leaf-green font-semibold hover:text-leaf-green/80 transition-colors"
              whileHover={shouldReduceMotion ? {} : { x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {language === 'he' ? 'כל הקטגוריות' : 'View All'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </motion.span>
          </Link>
        </motion.div>

        {/* Category Grid - Asymmetric layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {/* First row - 1 large + 2 small on desktop */}
          {categories.slice(0, 3).map((category, index) => (
            <div
              key={category.id}
              className={index === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}
            >
              <CategoryCard
                category={category}
                index={index}
                isLarge={index === 0}
                language={language}
                isRTL={isRTL}
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          ))}

          {/* Second row - remaining categories */}
          {categories.slice(3, 6).map((category, index) => (
            <div key={category.id}>
              <CategoryCard
                category={category}
                index={index + 3}
                language={language}
                isRTL={isRTL}
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          ))}
        </div>

        {/* Mobile: View All Button */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' as const }}
          className="text-center mt-8 md:hidden"
        >
          <Link href="/marketplace">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-leaf-green text-white rounded-full font-semibold text-sm hover:bg-leaf-green/90 transition-colors cursor-pointer font-accent"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, boxShadow: '0 10px 30px -10px rgba(71, 140, 11, 0.4)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {language === 'he' ? 'כל הקטגוריות' : 'View All Categories'}
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

export default CategoryGrid;
