'use client';

// PromotedBundleCard
//
// Marketplace home-page slot rendering the single bundle currently marked
// `is_promoted = true` by an admin. Silent no-op when no bundle is promoted
// or the fetch fails. Language 1 design: forest green + gold accent, warm
// white surface, rounded card, subtle shadow.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

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
  originalPrice: number;
  image?: string;
  products: PromotedProduct[];
  discount: number;
}

export default function PromotedBundleCard({ isRTL = false }: { isRTL?: boolean }) {
  const [bundle, setBundle] = useState<PromotedBundle | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/bundles/promoted')
      .then((r) => (r.ok ? r.json() : { bundle: null }))
      .then((data) => {
        if (cancelled) return;
        setBundle(data?.bundle || null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || !bundle) return null;

  const savings = bundle.originalPrice - bundle.price;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D5A27] to-[#1E3D1A] shadow-lg my-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Amber accent strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E8B84D] to-transparent" />

      <div className="grid md:grid-cols-2 gap-0">
        {/* Image side */}
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] bg-[#1E3D1A]">
          {bundle.image ? (
            <Image
              src={bundle.image}
              alt={bundle.name}
              fill
              className="object-cover opacity-95"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#C4A265]/50">
              <Sparkles className="w-12 h-12 stroke-[1.25]" />
            </div>
          )}
          {/* Saving pill */}
          {bundle.discount > 0 && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8B84D] text-[#1E3D1A] rounded-full text-xs font-bold uppercase tracking-wider shadow">
              <span>-{bundle.discount}%</span>
            </div>
          )}
        </div>

        {/* Copy side */}
        <div className="p-6 md:p-10 flex flex-col justify-center text-white">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-px w-6 bg-[#C4A265]" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#C4A265] font-semibold">
              {isRTL ? 'מיוחד השבוע' : 'Bundle of the week'}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            {isRTL && bundle.nameHe ? bundle.nameHe : bundle.name}
          </h3>

          {bundle.description && (
            <p className="text-sm text-white/70 mb-5 line-clamp-2">
              {bundle.description}
            </p>
          )}

          {/* Included products (first 3) */}
          {bundle.products?.length > 0 && (
            <ul className="mb-6 space-y-1.5">
              {bundle.products.slice(0, 3).map((p) => (
                <li key={p.id} className="text-sm text-white/80 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#E8B84D]" />
                  {p.name}
                </li>
              ))}
              {bundle.products.length > 3 && (
                <li className="text-xs text-white/50 ps-3">
                  + {bundle.products.length - 3} {isRTL ? 'נוספים' : 'more'}
                </li>
              )}
            </ul>
          )}

          <div className="flex items-end gap-4 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                {isRTL ? 'מחיר חבילה' : 'Bundle price'}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#E8B84D]">₪{bundle.price}</span>
                {bundle.originalPrice > bundle.price && (
                  <span className="text-sm text-white/40 line-through">₪{bundle.originalPrice}</span>
                )}
              </div>
            </div>
            {savings > 0 && (
              <div className="pb-1 text-xs text-white/60">
                {isRTL ? `חיסכון ₪${savings}` : `Save ₪${savings}`}
              </div>
            )}
          </div>

          <Link
            href={`/bundles/${bundle.id}`}
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 bg-[#E8B84D] text-[#1E3D1A] rounded-lg text-sm font-semibold hover:bg-[#f3cd68] transition-colors"
          >
            {isRTL ? 'צפה בחבילה' : 'See the bundle'}
            <ArrowRight className={`w-4 h-4 stroke-[2] ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
