'use client';

// PromotedBundleCard
//
// Marketplace package showcase. Uses the active bundle list, with the promoted
// bundle first when one is configured.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';

interface PromotedProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  vendorName?: string;
}

interface PromotedBundle {
  id: string;
  name: string;
  nameHe?: string;
  description?: string;
  price: number;
  bundlePrice?: number;
  originalPrice: number;
  image?: string;
  products: PromotedProduct[];
  discount: number;
  savingsPercent?: number;
  loyaltyPointsBonus?: number;
}

function formatShekel(value: number): string {
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
}

function formatPercent(value: number): string {
  return formatShekel(value).replace(/\.?0+$/, '');
}

export default function PromotedBundleCard({ isRTL = false }: { isRTL?: boolean }) {
  const [bundles, setBundles] = useState<PromotedBundle[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/bundles/promoted')
      .then((r) => (r.ok ? r.json() : { bundle: null }))
      .then((data) => {
        if (cancelled) return;
        const nextBundles = Array.isArray(data?.bundles) && data.bundles.length > 0
          ? data.bundles
          : data?.bundle
            ? [data.bundle]
            : [];
        setBundles(nextBundles);
        setActiveIndex(0);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bundles.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % bundles.length);
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [bundles.length]);

  if (!loaded || bundles.length === 0) return null;

  const bundle = bundles[activeIndex % bundles.length];
  const price = bundle.bundlePrice ?? bundle.price;
  const discount = bundle.savingsPercent ?? bundle.discount;
  const savings = bundle.originalPrice - price;
  const displayName = isRTL && bundle.nameHe ? bundle.nameHe : bundle.name;
  const goToPrevious = () => setActiveIndex((index) => (index - 1 + bundles.length) % bundles.length);
  const goToNext = () => setActiveIndex((index) => (index + 1) % bundles.length);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="relative overflow-hidden bg-[#FDFBF7] border-y border-[#e8ddca] my-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-[#c23c09] stroke-[1.7]" />
              <span className="text-xs uppercase tracking-[0.18em] text-[#c23c09] font-bold">
                {isRTL ? 'חבילות קהילתיות' : 'Package Offers'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] leading-tight">
              {isRTL ? 'חבילות מוכנות לחיסכון' : 'Bundle & Save'}
            </h2>
          </div>

          {bundles.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevious}
                className="w-10 h-10 rounded-full border border-[#d8c8aa] bg-white text-[#2D5A27] flex items-center justify-center hover:bg-[#f7f4ee] transition-colors"
                aria-label={isRTL ? 'חבילה קודמת' : 'Previous package'}
              >
                <ChevronLeft className={`w-4 h-4 stroke-[2] ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-sm font-semibold text-[#6b6458] min-w-12 text-center">
                {activeIndex + 1}/{bundles.length}
              </span>
              <button
                type="button"
                onClick={goToNext}
                className="w-10 h-10 rounded-full border border-[#d8c8aa] bg-white text-[#2D5A27] flex items-center justify-center hover:bg-[#f7f4ee] transition-colors"
                aria-label={isRTL ? 'חבילה הבאה' : 'Next package'}
              >
                <ChevronRight className={`w-4 h-4 stroke-[2] ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D5A27] to-[#1E3D1A] shadow-lg min-h-[420px]">
            {bundle.image ? (
              <Image
                src={bundle.image}
                alt={displayName}
                fill
                className="object-cover opacity-85"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#C4A265]/50">
                <Sparkles className="w-12 h-12 stroke-[1.25]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
            <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end text-white max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {discount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8B84D] text-[#1E3D1A] rounded-full text-xs font-bold uppercase tracking-wider shadow">
                    -{formatPercent(discount)}%
                  </span>
                )}
                {bundle.loyaltyPointsBonus ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 text-white rounded-full text-xs font-bold">
                    +{bundle.loyaltyPointsBonus} {isRTL ? 'נק׳' : 'pts'}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 text-white rounded-full text-xs font-bold">
                  {bundle.products.length} {isRTL ? 'פריטים' : 'items'}
                </span>
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                {displayName}
              </h3>

              {bundle.description && (
                <p className="text-base md:text-lg text-white/75 mb-5 line-clamp-2 max-w-xl">
                  {bundle.description}
                </p>
              )}

              <div className="flex flex-wrap items-end gap-4 mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/55 mb-1">
                    {isRTL ? 'מחיר חבילה' : 'Package price'}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#E8B84D]">₪{formatShekel(price)}</span>
                    {bundle.originalPrice > price && (
                      <span className="text-base text-white/45 line-through">₪{formatShekel(bundle.originalPrice)}</span>
                    )}
                  </div>
                </div>
                {savings > 0 && (
                  <div className="pb-1 text-sm text-white/70">
                    {isRTL ? `חיסכון ₪${formatShekel(savings)}` : `Save ₪${formatShekel(savings)}`}
                  </div>
                )}
              </div>

              <Link
                href={`/bundles/${bundle.id}`}
                className="inline-flex items-center gap-2 self-start px-5 py-3 bg-[#E8B84D] text-[#1E3D1A] rounded-lg text-sm font-bold hover:bg-[#f3cd68] transition-colors"
              >
                {isRTL ? 'צפה בחבילה' : 'View package'}
                <ArrowRight className={`w-4 h-4 stroke-[2] ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {bundles.slice(0, 6).map((item, index) => {
              const itemPrice = item.bundlePrice ?? item.price;
              const itemName = isRTL && item.nameHe ? item.nameHe : item.name;
              const selected = index === activeIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`text-start rounded-xl border p-3 bg-white transition-all hover:border-[#C4A265] ${
                    selected ? 'border-[#478c0b] shadow-md' : 'border-[#eadfce]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#f7f4ee] flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={itemName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C4A265]">
                          <Package className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#3a3a1d] line-clamp-1">{itemName}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {item.products.slice(0, 2).map((product) => product.name).join(' + ')}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-bold text-[#478c0b]">₪{formatShekel(itemPrice)}</span>
                        {item.originalPrice > itemPrice && (
                          <span className="text-xs text-gray-400 line-through">₪{formatShekel(item.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {bundles.length > 6 && (
              <Link
                href="/bundles"
                className="rounded-xl border border-[#eadfce] p-4 bg-white text-sm font-bold text-[#478c0b] hover:border-[#478c0b] transition-colors inline-flex items-center justify-center gap-2"
              >
                {isRTL ? 'כל החבילות' : 'View all packages'}
                <ArrowRight className={`w-4 h-4 stroke-[2] ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
