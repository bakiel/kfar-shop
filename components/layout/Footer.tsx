'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShoppingBag,
  Headphones,
  Shield,
  Store,
  Leaf,
  Lock,
  Star,
  Sun,
  Mail,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

// ---------------------------------------------------------------------------
// Custom social media SVG icons (Lucide does not include brand icons)
// ---------------------------------------------------------------------------
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/>
  </svg>
);

// ---------------------------------------------------------------------------
// SVG Payment Icons
// ---------------------------------------------------------------------------
const PaymentIcons = {
  visa: (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71"/>
      <path d="M19.5 21.5l-1.8-8.5h-2.9l2.8 11h3l4.4-11h-2.9l-2.6 8.5z" fill="#fff"/>
      <path d="M28 13l-4.5 11h2.8l.8-2h3.8l.4 2h2.7L31 13h-3zm.4 6.5l1.3-4 .9 4h-2.2z" fill="#fff"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#000"/>
      <circle cx="18" cy="16" r="8" fill="#EB001B"/>
      <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
      <path d="M24 10.3a8 8 0 010 11.4 8 8 0 000-11.4z" fill="#FF5F00"/>
    </svg>
  ),
  paypal: (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#003087"/>
      <path d="M20 9h5c3 0 5 1.5 4.5 5-.5 4-3 6-6 6h-2l-1 5h-3l2.5-16z" fill="#fff"/>
      <path d="M17 13h5c3 0 5 1.5 4.5 5-.5 4-3 6-6 6h-2l-1 5h-3l2.5-16z" fill="#009cde"/>
    </svg>
  ),
  applePay: (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#000"/>
      <path d="M16 11.5c-.8 1-1.3 2.2-1.2 3.5 1.1.1 2.3-.6 3-1.5.7-.9 1.2-2.1 1.1-3.4-1.1.1-2.2.6-2.9 1.4z" fill="#fff"/>
      <path d="M17.8 15c-1.5-.1-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.2 0 2-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-1.4-.5-2.4-2-2.4-3.8 0-1.5.8-2.8 1.9-3.6-.7-1-1.9-1.4-3.4-1.4z" fill="#fff"/>
      <text x="24" y="21" fill="#fff" fontSize="10" fontFamily="system-ui" fontWeight="600">Pay</text>
    </svg>
  ),
  googlePay: (
    <svg viewBox="0 0 48 32" className="w-10 h-7" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb"/>
      <path d="M24.5 16.4v3.1h-1v-7.7h2.6c.6 0 1.2.2 1.7.6.5.4.7 1 .7 1.6 0 .7-.2 1.2-.7 1.6-.5.4-1 .6-1.7.6h-1.6zm0-3.6v2.7h1.7c.4 0 .7-.1 1-.4.3-.3.4-.6.4-1 0-.3-.1-.7-.4-1-.3-.3-.6-.4-1-.4h-1.7z" fill="#5F6368"/>
      <path d="M32.6 14.4c.7 0 1.3.2 1.7.6.4.4.6 1 .6 1.7v3.8h-1v-.9c-.3.7-1 1-1.8 1-.6 0-1.1-.2-1.4-.5-.4-.3-.5-.8-.5-1.3 0-.6.2-1 .6-1.3.4-.3 1-.5 1.7-.5.6 0 1.1.1 1.4.4v-.3c0-.4-.1-.7-.4-.9-.2-.2-.6-.4-1-.4-.6 0-1.1.3-1.3.8l-.9-.4c.4-.8 1.1-1.2 2.3-1.2zm-1.2 4.7c0 .2.1.4.3.6.2.2.5.2.8.2.4 0 .8-.2 1.1-.5.3-.3.5-.6.5-1-.3-.3-.7-.4-1.3-.4-.4 0-.8.1-1 .3-.3.2-.4.4-.4.8z" fill="#5F6368"/>
      <path d="M40.5 14.4l-2.8 6.5h-1l1-2.2-1.8-4.3h1.1l1.2 3.2 1.2-3.2h1.1z" fill="#5F6368"/>
      <path d="M15.8 16.1c0-.3 0-.6-.1-.9h-4.2v1.7h2.4c-.1.5-.4 1-.8 1.3v1.1h1.3c.8-.7 1.4-1.8 1.4-3.2z" fill="#4285F4"/>
      <path d="M11.5 20.4c1.1 0 2-.4 2.7-1l-1.3-1c-.4.2-.8.4-1.4.4-.6 0-1.1-.2-1.5-.5-.4-.3-.7-.8-.8-1.4H8.6v1.1c.7 1.4 2 2.4 2.9 2.4z" fill="#34A853"/>
      <path d="M9.2 16.9c-.1-.3-.1-.5-.1-.8s0-.6.1-.8v-1.1H7.9c-.2.5-.4 1-.4 1.6 0 .6.1 1.1.4 1.6l1.3-1z" fill="#FBBC04"/>
      <path d="M11.5 13.5c.3 0 .6.1.9.3l1-1c-.6-.5-1.3-.8-2-.8-1.6 0-3 .9-3.6 2.3l1.3 1c.3-.9 1.2-1.5 2.4-1.5z" fill="#EA4335"/>
    </svg>
  )
};

// ---------------------------------------------------------------------------
// Footer Link Hover Component
// ---------------------------------------------------------------------------
const FooterLink = ({ href, children, hoverColor = 'hover:text-white' }: { href: string; children: React.ReactNode; hoverColor?: string }) => (
  <li>
    <Link
      href={href}
      className={`group flex items-center gap-1 text-gray-400 ${hoverColor} transition-colors duration-200 text-sm cursor-pointer`}
    >
      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 stroke-[1.5]" />
      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{children}</span>
    </Link>
  </li>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { language, isRTL } = useLanguage();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEmail('');
    setIsSubmitting(false);
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' as const }
    }
  };

  const footerLinks = {
    shop: [
      { href: '/marketplace', label: language === 'he' ? 'כל המוצרים' : 'All Products' },
      { href: '/categories', label: language === 'he' ? 'קטגוריות' : 'Categories' },
      { href: '/store/featured', label: language === 'he' ? 'מוצרים מומלצים' : 'Featured' },
      { href: '/store/new', label: language === 'he' ? 'חדש באתר' : 'New Arrivals' },
      { href: '/store/deals', label: language === 'he' ? 'מבצעים' : 'Special Offers' },
    ],
    support: [
      { href: '/help', label: language === 'he' ? 'מרכז עזרה' : 'Help Center' },
      { href: '/faq', label: language === 'he' ? 'שאלות נפוצות' : 'FAQs' },
      { href: '/contact', label: language === 'he' ? 'צור קשר' : 'Contact Us' },
      { href: '/shipping', label: language === 'he' ? 'משלוחים' : 'Shipping Info' },
      { href: '/policies/returns', label: language === 'he' ? 'החזרות' : 'Returns' },
    ],
    vendors: [
      { href: '/vendors', label: language === 'he' ? 'הספקים שלנו' : 'Our Vendors' },
      { href: '/vendor/join', label: language === 'he' ? 'הצטרף כספק' : 'Become a Vendor' },
      { href: '/vendor/dashboard', label: language === 'he' ? 'לוח בקרה' : 'Vendor Dashboard' },
      { href: '/vendor/resources', label: language === 'he' ? 'משאבים' : 'Resources' },
    ],
    legal: [
      { href: '/policies/privacy', label: language === 'he' ? 'פרטיות' : 'Privacy Policy' },
      { href: '/policies/terms', label: language === 'he' ? 'תנאי שימוש' : 'Terms of Service' },
      { href: '/policies/cookies', label: language === 'he' ? 'עוגיות' : 'Cookie Policy' },
      { href: '/policies/accessibility', label: language === 'he' ? 'נגישות' : 'Accessibility' },
    ],
  };

  return (
    <footer className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ================================================================= */}
      {/* NEWSLETTER BANNER                                                 */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2e0a 0%, #2D5A27 50%, #1a3a12 100%)' }}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <motion.div
          className="container mx-auto px-4 sm:px-6 py-10 md:py-14 relative z-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(196, 162, 101, 0.15)' }}>
              <Mail className="w-6 h-6 stroke-[1.5]" style={{ color: '#C4A265' }} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
              {language === 'he' ? 'הצטרפו לקהילה שלנו' : 'Join Our Community'}
            </h3>
            <p className="text-white/60 mb-6 text-sm sm:text-base px-4 leading-relaxed">
              {language === 'he'
                ? 'קבלו עדכונים בלעדיים על ספקים חדשים, הצעות מיוחדות ואירועי קהילה'
                : 'Get exclusive updates on new vendors, special offers, and community events'
              }
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4 sm:px-0">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'he' ? 'הזינו את האימייל שלכם' : 'Enter your email'}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C4A265] focus:ring-1 focus:ring-[#C4A265]/30 transition-all text-sm sm:text-base"
                  required
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer transition-all duration-200 text-[#1a2e0a]"
                style={{ backgroundColor: '#C4A265' }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#1a2e0a]/30 border-t-[#1a2e0a] rounded-full animate-spin" />
                ) : isSubscribed ? (
                  <span>{language === 'he' ? 'נרשמת!' : 'Subscribed!'}</span>
                ) : (
                  <>
                    {language === 'he' ? 'הרשמה' : 'Subscribe'}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''} stroke-[1.5]`} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* MAIN FOOTER                                                       */}
      {/* ================================================================= */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #0f1a0a 0%, #111810 40%, #0d120a 100%)' }}>
        {/* Top separator accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C4A265, transparent)' }} />

        <div className="container mx-auto px-4 sm:px-6 pt-14 md:pt-16 pb-8">
          {/* ---- Links Grid ---- */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 md:gap-10 mb-12 md:mb-14"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={containerVariants}
          >
            {/* Brand Column */}
            <motion.div variants={itemVariants} className="col-span-2 md:col-span-3 lg:col-span-4">
              <div className="mb-5">
                <Image
                  src="/images/logos/kfar_logo_africa_heritage.png"
                  alt="KFAR Marketplace"
                  width={140}
                  height={50}
                  className="h-12 sm:h-14 w-auto brightness-110"
                />
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs">
                {language === 'he'
                  ? 'משרתים את קהילת כפר השלום בדימונה עם מוצרים ושירותים טבעוניים מאז 1969.'
                  : 'Serving the Village of Peace community in Dimona with authentic vegan products since 1969.'
                }
              </p>

              {/* Contact Info */}
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span>{language === 'he' ? 'כפר השלום, דימונה, ישראל' : 'Village of Peace, Dimona, Israel'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <Clock className="w-4 h-4 flex-shrink-0 stroke-[1.5]" style={{ color: '#C4A265' }} />
                  <span>{language === 'he' ? 'א-ה: 8:00-20:00' : 'Sun-Thu: 8AM-8PM'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                  <span dir="ltr">+972 50-799-0372</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2.5">
                {[
                  { icon: FacebookIcon, label: 'Facebook', bg: '#478c0b' },
                  { icon: InstagramIcon, label: 'Instagram', bg: '#C4A265' },
                  { icon: YoutubeIcon, label: 'YouTube', bg: '#c23c09' },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer text-white"
                    style={{ backgroundColor: social.bg }}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Shop Links */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h5 className="font-semibold text-sm mb-4 flex items-center gap-2 text-white/90 uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                {language === 'he' ? 'חנות' : 'Shop'}
              </h5>
              <ul className="space-y-2.5">
                {footerLinks.shop.map((link) => (
                  <FooterLink key={link.href} href={link.href} hoverColor="hover:text-[#f6af0d]">
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h5 className="font-semibold text-sm mb-4 flex items-center gap-2 text-white/90 uppercase tracking-wider">
                <Headphones className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                {language === 'he' ? 'תמיכה' : 'Support'}
              </h5>
              <ul className="space-y-2.5">
                {footerLinks.support.map((link) => (
                  <FooterLink key={link.href} href={link.href} hoverColor="hover:text-[#478c0b]">
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </motion.div>

            {/* Vendors Links */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h5 className="font-semibold text-sm mb-4 flex items-center gap-2 text-white/90 uppercase tracking-wider">
                <Store className="w-4 h-4 stroke-[1.5]" style={{ color: '#C4A265' }} />
                {language === 'he' ? 'ספקים' : 'Vendors'}
              </h5>
              <ul className="space-y-2.5">
                {footerLinks.vendors.map((link) => (
                  <FooterLink key={link.href} href={link.href} hoverColor="hover:text-[#C4A265]">
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h5 className="font-semibold text-sm mb-4 flex items-center gap-2 text-white/90 uppercase tracking-wider">
                <Shield className="w-4 h-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
                {language === 'he' ? 'משפטי' : 'Legal'}
              </h5>
              <ul className="space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <FooterLink key={link.href} href={link.href} hoverColor="hover:text-white">
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* ---- Trust Badges & Payment ---- */}
          <motion.div
            className="border-t border-white/[0.06] pt-8 mb-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Trust Badges */}
              <motion.div variants={itemVariants}>
                <h6 className="font-semibold mb-3 sm:mb-4 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
                  {language === 'he' ? 'מאומת ומאובטח' : 'Certified & Secure'}
                </h6>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { icon: Leaf, label: language === 'he' ? '100% טבעוני' : '100% Vegan', color: '#478c0b' },
                    { icon: Lock, label: language === 'he' ? 'קניות מאובטחות' : 'Secure Shopping', color: '#C4A265' },
                    { icon: Star, label: language === 'he' ? 'מאז 1969' : 'Since 1969', color: '#f6af0d' }
                  ].map((badge) => (
                    <div key={badge.label} className="bg-white/[0.06] rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 border border-white/[0.04]">
                      <badge.icon className="w-4 h-4 stroke-[1.5]" style={{ color: badge.color }} />
                      <span className="text-xs sm:text-sm text-gray-300">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Methods */}
              <motion.div variants={itemVariants} className="lg:text-right">
                <h6 className="font-semibold mb-3 sm:mb-4 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
                  {language === 'he' ? 'אמצעי תשלום' : 'Payment Methods'}
                </h6>
                <div className="flex flex-wrap gap-2 sm:gap-3 lg:justify-end">
                  {Object.entries(PaymentIcons).map(([name, icon]) => (
                    <div key={name} className="bg-white/[0.06] rounded-lg p-2 sm:p-2.5 flex items-center justify-center border border-white/[0.04]">
                      {icon}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ---- Bottom Bar ---- */}
          <div className="border-t border-white/[0.06] pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                &copy; {new Date().getFullYear()} KFAR Marketplace.{' '}
                {language === 'he' ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
                <span className="hidden sm:inline mx-2 text-gray-700">|</span>
                <br className="sm:hidden" />
                <Link href="/sitemap" className="text-gray-500 hover:text-white transition-colors cursor-pointer mx-1 sm:mx-0">
                  {language === 'he' ? 'מפת אתר' : 'Sitemap'}
                </Link>
              </p>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span>{language === 'he' ? 'נוצר עם' : 'Made with'}</span>
                <Sun className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                <span>{language === 'he' ? 'בדימונה, ישראל' : 'in Dimona, Israel'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
