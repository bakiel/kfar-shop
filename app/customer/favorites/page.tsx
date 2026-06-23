'use client';

import Link from 'next/link';
import { Bell, Heart, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CustomerFavoritesPage() {
  const { language, isRTL } = useLanguage();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'he' ? 'מועדפים' : 'Favorites'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {language === 'he'
              ? 'מוצרים וחנויות שתשמרו יופיעו כאן לגישה מהירה.'
              : 'Saved products and stores will appear here for quick access.'}
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#478c0b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a7209]"
        >
          <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
          {language === 'he' ? 'המשך לקניות' : 'Browse Marketplace'}
        </Link>
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#c23c09]/10 text-[#c23c09]">
          <Heart className="h-7 w-7 stroke-[1.5]" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          {language === 'he' ? 'אין מועדפים עדיין' : 'No favorites yet'}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          {language === 'he'
            ? 'לחצו על סמל הלב בדפי מוצרים כדי לשמור פריטים שאתם רוצים למצוא שוב.'
            : 'Use the heart button on product pages to save items you want to find again.'}
        </p>
      </section>

      <section className="rounded-lg border border-[#f6af0d]/20 bg-[#fef9ef] p-5">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#f6af0d] stroke-[1.5]" />
          <div>
            <h3 className="text-sm font-semibold text-[#3a3a1d]">
              {language === 'he' ? 'התראות על מועדפים' : 'Favorite alerts'}
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {language === 'he'
                ? 'אפשר לנהל התראות על מבצעים והעדפות בעמוד ההעדפות.'
                : 'Manage sale alerts and preference settings from your preferences page.'}
            </p>
            <Link
              href="/customer/preferences"
              className="mt-3 inline-flex text-sm font-semibold text-[#478c0b] hover:underline"
            >
              {language === 'he' ? 'ניהול העדפות' : 'Manage preferences'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
