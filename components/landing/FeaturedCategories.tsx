'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { LandingCategory } from '@/lib/types/landing';

/* -------------------------------------------------------------------------- */
/*  Category Card                                                              */
/* -------------------------------------------------------------------------- */

function CategoryCard({
  category,
  index,
  shouldReduceMotion,
  language,
  isPriority,
}: {
  category: LandingCategory;
  index: number;
  shouldReduceMotion: boolean | null;
  language: 'en' | 'he';
  isPriority?: boolean;
}) {
  const displayName =
    language === 'he' && category.nameHe ? category.nameHe : category.name;

  return (
    <Link
      href={`/marketplace?category=${category.slug}`}
      className="flex-shrink-0 snap-start cursor-pointer group"
    >
      <motion.div
        initial={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: 20, scale: 0.95 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.1 + index * 0.07,
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        whileHover={
          shouldReduceMotion
            ? {}
            : { y: -6, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.18)' }
        }
        whileTap={{ scale: 0.97 }}
        className="relative w-[180px] h-[220px] sm:w-[200px] sm:h-[240px] rounded-2xl overflow-hidden shadow-soft"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={category.image}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 180px, 200px"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            priority={isPriority}
          />
          {/* Gradient overlay -- strong bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300" />
        </div>

        {/* Product count badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-soil-brown text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {category.productCount} {language === 'he' ? 'מוצרים' : 'products'}
          </span>
        </div>

        {/* Bottom text content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <h3 className="text-white text-base sm:text-lg font-bold leading-tight drop-shadow-md">
            {displayName}
          </h3>
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-white/90 text-xs font-medium">
              {language === 'he' ? 'צפה בהכל' : 'Browse'}
            </span>
            <ArrowRight className={`w-3.5 h-3.5 text-white/90 stroke-[1.5] ${language === 'he' ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section heading                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  t,
  language,
  isRTL,
  shouldReduceMotion,
}: {
  t: (text: string) => string;
  language: 'en' | 'he';
  isRTL: boolean;
  shouldReduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-end justify-between mb-6"
    >
      <div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-soil-brown">
          {t('Shop by Category')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {language === 'he'
            ? 'מצאו את מה שאתם אוהבים'
            : 'Find what you love'}
        </p>
      </div>

      <Link
        href="/marketplace"
        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-green hover:text-leaf-green-dark transition-colors cursor-pointer group/link"
      >
        {t('Explore Marketplace')}
        <span className="inline-flex group-hover/link:translate-x-1 transition-transform duration-200">
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
          ) : (
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          )}
        </span>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function FeaturedCategories({
  categories,
}: {
  categories: LandingCategory[];
}) {
  const { language, t, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(true);

  /* --- Auto-scroll on desktop (pauses on hover) --- */
  const isHovering = useRef(false);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) return;
    autoScrollTimer.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el || isHovering.current) return;

      const increment = isRTL ? -1 : 1;
      el.scrollLeft += increment;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (!isRTL && el.scrollLeft >= maxScroll - 2) {
        el.scrollLeft = 0;
      } else if (isRTL && el.scrollLeft <= -(maxScroll - 2)) {
        el.scrollLeft = 0;
      }
    }, 30);
  }, [isRTL]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    if (mq.matches && !shouldReduceMotion) {
      startAutoScroll();
    }

    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && !shouldReduceMotion) startAutoScroll();
      else stopAutoScroll();
    };
    mq.addEventListener('change', handler);

    return () => {
      stopAutoScroll();
      mq.removeEventListener('change', handler);
    };
  }, [shouldReduceMotion, startAutoScroll, stopAutoScroll]);

  /* --- Scroll state for chevron buttons --- */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (isRTL) {
      setCanScrollStart(el.scrollLeft < -2);
      setCanScrollEnd(el.scrollLeft > -(maxScroll - 2));
    } else {
      setCanScrollStart(el.scrollLeft > 2);
      setCanScrollEnd(el.scrollLeft < maxScroll - 2);
    }
  }, [isRTL]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scrollByAmount = (direction: 'start' | 'end') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 220;
    const sign =
      (direction === 'end' ? 1 : -1) * (isRTL ? -1 : 1);
    el.scrollBy({ left: sign * amount, behavior: 'smooth' });
  };

  if (!categories.length) return null;

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-kfar-warm-white py-12 sm:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          t={t}
          language={language}
          isRTL={isRTL}
          shouldReduceMotion={shouldReduceMotion}
        />

        {/* Scroll container */}
        <div className="relative group/scroll">
          {/* Scroll chevron buttons */}
          {canScrollStart && (
            <button
              onClick={() => scrollByAmount('start')}
              aria-label="Scroll start"
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -left-3 z-20 w-10 h-10 items-center justify-center rounded-full bg-white shadow-medium border border-gray-100 hover:border-leaf-green/30 hover:shadow-strong transition-all cursor-pointer opacity-0 group-hover/scroll:opacity-100"
            >
              {isRTL ? (
                <ChevronRight className="w-5 h-5 text-soil-brown stroke-[1.5]" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-soil-brown stroke-[1.5]" />
              )}
            </button>
          )}
          {canScrollEnd && (
            <button
              onClick={() => scrollByAmount('end')}
              aria-label="Scroll end"
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-3 z-20 w-10 h-10 items-center justify-center rounded-full bg-white shadow-medium border border-gray-100 hover:border-leaf-green/30 hover:shadow-strong transition-all cursor-pointer opacity-0 group-hover/scroll:opacity-100"
            >
              {isRTL ? (
                <ChevronLeft className="w-5 h-5 text-soil-brown stroke-[1.5]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-soil-brown stroke-[1.5]" />
              )}
            </button>
          )}

          {/* Fade edges */}
          <div
            className="absolute inset-y-0 start-0 w-8 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(${isRTL ? 'to left' : 'to right'}, #FDFBF7, transparent)`,
            }}
          />
          <div
            className="absolute inset-y-0 end-0 w-8 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(${isRTL ? 'to right' : 'to left'}, #FDFBF7, transparent)`,
            }}
          />

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            onMouseEnter={() => {
              isHovering.current = true;
            }}
            onMouseLeave={() => {
              isHovering.current = false;
            }}
            className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-hide"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                index={i}
                shouldReduceMotion={shouldReduceMotion}
                language={language}
                isPriority={i < 3}
              />
            ))}
          </div>
        </div>

        {/* Mobile "Explore all" link */}
        <div className="sm:hidden flex justify-center mt-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-green hover:text-leaf-green-dark transition-colors cursor-pointer"
          >
            {t('Explore Marketplace')}
            {isRTL ? (
              <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <ChevronRight className="w-4 h-4 stroke-[1.5]" />
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
