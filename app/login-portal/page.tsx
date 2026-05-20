'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Handshake, Home, KeyRound, ShieldCheck, ShoppingBag, Store, UserPlus } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

const roleCards = [
  {
    id: 'customer',
    titleEn: 'Customer',
    titleHe: 'לקוחות',
    descriptionEn: 'Shop the marketplace, track orders, save favorites, and manage rewards.',
    descriptionHe: 'קניות בשוק, מעקב הזמנות, שמירת מועדפים וניהול הטבות.',
    href: '/customer/login?role=customer',
    ctaEn: 'Customer Login',
    ctaHe: 'כניסת לקוחות',
    secondaryHref: '/customer/onboarding',
    secondaryEn: 'Customer Sign Up',
    secondaryHe: 'הרשמת לקוחות',
    accent: '#478c0b',
    icon: ShoppingBag,
    secondaryIcon: UserPlus,
  },
  {
    id: 'vendor',
    titleEn: 'Vendor',
    titleHe: 'ספקים',
    descriptionEn: 'Manage products, orders, store details, bundles, and customer activity.',
    descriptionHe: 'ניהול מוצרים, הזמנות, פרטי חנות, חבילות ופעילות לקוחות.',
    href: '/vendor/login',
    ctaEn: 'Vendor Portal',
    ctaHe: 'פורטל ספקים',
    secondaryHref: '/vendor/onboarding',
    secondaryEn: 'Become a Vendor',
    secondaryHe: 'הצטרפות כספק',
    accent: '#f6af0d',
    icon: Store,
    secondaryIcon: Handshake,
  },
  {
    id: 'admin',
    titleEn: 'Admin',
    titleHe: 'ניהול',
    descriptionEn: 'Authorized access for marketplace operations and account support.',
    descriptionHe: 'כניסה מורשית לניהול השוק ותמיכה בחשבונות.',
    href: '/admin/login',
    ctaEn: 'Admin Access',
    ctaHe: 'כניסת מנהלים',
    secondaryHref: '/support',
    secondaryEn: 'Need help?',
    secondaryHe: 'צריך עזרה?',
    accent: '#c23c09',
    icon: ShieldCheck,
    secondaryIcon: KeyRound,
  },
];

export default function LoginPortal() {
  const { language, isRTL } = useLanguage();

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#fef9ef] text-[#3a3a1d]"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center cursor-pointer">
            <Image
              src="/images/logos/kfar_logo_primary_horizontal.png"
              alt="KFAR Marketplace"
              width={168}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-lg border border-[#478c0b]/20 bg-white px-3 py-2 text-sm font-semibold text-[#478c0b] shadow-sm transition-colors hover:bg-[#478c0b]/5"
          >
            <Home className="h-4 w-4 stroke-[1.5]" />
            {language === 'he' ? 'חזרה לשוק' : 'Back to Marketplace'}
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10 sm:py-14">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#f6af0d]/30 bg-white px-3 py-2 text-sm font-semibold text-[#3a3a1d] shadow-sm">
              <KeyRound className="h-4 w-4 text-[#478c0b] stroke-[1.5]" />
              {language === 'he' ? 'גישה מאובטחת לחשבון' : 'Secure Account Access'}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-[#3a3a1d] sm:text-5xl">
              {language === 'he' ? 'בחרו איך להיכנס ל-KFAR' : 'Choose Your KFAR Account'}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-gray-600">
              {language === 'he'
                ? 'כניסה אחת ברורה ללקוחות, ספקים וצוות הניהול של השוק.'
                : 'One clear access point for customers, store owners, and marketplace administrators.'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roleCards.map((card) => {
              const Icon = card.icon;
              const SecondaryIcon = card.secondaryIcon;
              const isAdmin = card.id === 'admin';

              return (
                <article
                  key={card.id}
                  className={`flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm ${
                    isAdmin ? 'border-[#c23c09]/20' : 'border-gray-100'
                  }`}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${card.accent}14`, color: card.accent }}
                  >
                    <Icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#3a3a1d]">
                    {language === 'he' ? card.titleHe : card.titleEn}
                  </h2>
                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-gray-600">
                    {language === 'he' ? card.descriptionHe : card.descriptionEn}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href={card.href}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                      style={{ backgroundColor: card.accent }}
                    >
                      {language === 'he' ? card.ctaHe : card.ctaEn}
                      <ArrowRight className={`h-4 w-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                    <Link
                      href={card.secondaryHref}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#478c0b]/30 hover:text-[#478c0b]"
                    >
                      <SecondaryIcon className="h-4 w-4 stroke-[1.5]" />
                      {language === 'he' ? card.secondaryHe : card.secondaryEn}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
