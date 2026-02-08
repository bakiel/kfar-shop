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
  Clock
} from 'lucide-react';

// Custom social media icons (Lucide deprecated brand icons)
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

import { useLanguage } from '@/lib/context/LanguageContext';

// SVG Payment Icons
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

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { language, isRTL } = useLanguage();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Newsletter signup:', email);
    setEmail('');
    setIsSubmitting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' as const }
    }
  };

  const footerLinks = {
    shop: [
      { href: '/categories', label: language === 'he' ? 'כל הקטגוריות' : 'All Categories' },
      { href: '/store/featured', label: language === 'he' ? 'מוצרים מומלצים' : 'Featured Products' },
      { href: '/store/new', label: language === 'he' ? 'חדש באתר' : 'New Arrivals' },
      { href: '/store/deals', label: language === 'he' ? 'מבצעים' : 'Special Offers' },
      { href: '/vendors', label: language === 'he' ? 'הספקים שלנו' : 'Our Vendors' }
    ],
    support: [
      { href: '/help', label: language === 'he' ? 'מרכז עזרה' : 'Help Center' },
      { href: '/faq', label: language === 'he' ? 'שאלות נפוצות' : 'FAQs' },
      { href: '/contact', label: language === 'he' ? 'צור קשר' : 'Contact Us' },
      { href: '/info/qr-nfc', label: language === 'he' ? 'מדריך QR & NFC' : 'QR & NFC Guide' },
      { href: '/shipping', label: language === 'he' ? 'מידע על משלוחים' : 'Shipping Info' }
    ],
    policies: [
      { href: '/policies/privacy', label: language === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy' },
      { href: '/policies/terms', label: language === 'he' ? 'תנאי שימוש' : 'Terms of Service' },
      { href: '/policies/returns', label: language === 'he' ? 'מדיניות החזרות' : 'Return Policy' },
      { href: '/policies/shipping', label: language === 'he' ? 'מדיניות משלוחים' : 'Shipping Policy' },
      { href: '/policies/cookies', label: language === 'he' ? 'מדיניות עוגיות' : 'Cookie Policy' }
    ],
    vendors: [
      { href: '/vendor/join', label: language === 'he' ? 'הצטרף כספק' : 'Become a Vendor' },
      { href: '/vendor/dashboard', label: language === 'he' ? 'לוח בקרה' : 'Vendor Dashboard' },
      { href: '/vendor/resources', label: language === 'he' ? 'משאבים' : 'Resources' },
      { href: '/vendor/commission', label: language === 'he' ? 'עמלות' : 'Commission Rates' },
      { href: '/vendor/success', label: language === 'he' ? 'סיפורי הצלחה' : 'Success Stories' }
    ]
  };

  return (
    <footer className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Newsletter Section */}
      <section className="py-10 md:py-14 relative overflow-hidden" style={{ backgroundColor: '#fef9ef' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-leaf-green/5 via-transparent to-sun-gold/5" />

        <motion.div
          className="container mx-auto px-4 sm:px-6 relative z-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-leaf-green/10 mb-5">
              <Mail className="w-7 h-7 text-leaf-green" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 font-display">
              {language === 'he' ? 'הצטרפו לקהילה שלנו' : 'Join Our Community'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
              {language === 'he'
                ? 'קבלו עדכונים בלעדיים על ספקים חדשים, הצעות מיוחדות ואירועי קהילה'
                : 'Get exclusive updates on new vendors, special offers, and community events'
              }
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'he' ? 'הזינו את האימייל שלכם' : 'Enter your email'}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-leaf-green/30 focus:border-leaf-green focus:outline-none focus:ring-2 focus:ring-leaf-green/20 transition-all text-sm sm:text-base bg-white"
                required
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                className="px-6 py-3 bg-leaf-green text-white rounded-xl font-semibold hover:bg-leaf-green/90 transition-all duration-200 whitespace-nowrap text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {language === 'he' ? 'הרשמה' : 'Subscribe'}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Footer */}
      <div className="bg-gray-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Top Section */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-10 md:mb-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {/* Brand Section - Full width on mobile, 2 cols on larger */}
            <motion.div variants={itemVariants} className="col-span-2 md:col-span-3 lg:col-span-2">
              <div className="mb-5">
                <Image
                  src="/images/logos/kfar_logo_africa_heritage.png"
                  alt="KFAR Marketplace"
                  width={140}
                  height={50}
                  className="h-12 sm:h-14 w-auto"
                />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 font-display">KFAR Marketplace</h4>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed max-w-xs">
                {language === 'he'
                  ? 'משרתים את קהילת כפר השלום בדימונה עם מוצרים ושירותים טבעוניים מאז 1969.'
                  : 'Serving the Village of Peace community in Dimona with authentic vegan products since 1969.'
                }
              </p>

              {/* Contact Info - Mobile friendly */}
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-leaf-green flex-shrink-0" />
                  <span>{language === 'he' ? 'דימונה, ישראל' : 'Dimona, Israel'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4 text-sun-gold flex-shrink-0" />
                  <span>{language === 'he' ? 'א-ה: 8:00-20:00' : 'Sun-Thu: 8AM-8PM'}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                <motion.a
                  href="#"
                  aria-label="Facebook"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer text-white"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <FacebookIcon />
                </motion.a>
                <motion.a
                  href="#"
                  aria-label="Instagram"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer text-white"
                  style={{ backgroundColor: '#f6af0d' }}
                >
                  <InstagramIcon />
                </motion.a>
                <motion.a
                  href="#"
                  aria-label="YouTube"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer text-white"
                  style={{ backgroundColor: '#c23c09' }}
                >
                  <YoutubeIcon />
                </motion.a>
              </div>
            </motion.div>

            {/* Shop Links */}
            <motion.div variants={itemVariants}>
              <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-sun-gold" />
                {language === 'he' ? 'חנות' : 'Shop'}
              </h5>
              <ul className="space-y-2 text-sm">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-sun-gold transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div variants={itemVariants}>
              <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-leaf-green" />
                {language === 'he' ? 'תמיכה' : 'Support'}
              </h5>
              <ul className="space-y-2 text-sm">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-leaf-green transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Policies Links */}
            <motion.div variants={itemVariants}>
              <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-earth-flame" />
                {language === 'he' ? 'מדיניות' : 'Policies'}
              </h5>
              <ul className="space-y-2 text-sm">
                {footerLinks.policies.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-earth-flame transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Vendor Links */}
            <motion.div variants={itemVariants}>
              <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-sun-gold" />
                {language === 'he' ? 'ספקים' : 'Vendors'}
              </h5>
              <ul className="space-y-2 text-sm">
                {footerLinks.vendors.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-sun-gold transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Trust Badges & Payment Methods */}
          <motion.div
            className="border-t border-gray-800 pt-8 mb-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Trust Badges */}
              <motion.div variants={itemVariants}>
                <h6 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'מאומת ומאובטח' : 'Certified & Secure'}
                </h6>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { icon: Leaf, label: language === 'he' ? '100% טבעוני' : '100% Vegan', color: 'text-green-400' },
                    { icon: Lock, label: language === 'he' ? 'קניות מאובטחות' : 'Secure Shopping', color: 'text-yellow-400' },
                    { icon: Star, label: language === 'he' ? 'מאז 1969' : 'Since 1969', color: 'text-orange-400' }
                  ].map((badge) => (
                    <div key={badge.label} className="bg-white/10 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2">
                      <badge.icon className={`w-4 h-4 ${badge.color}`} />
                      <span className="text-xs sm:text-sm text-white">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Methods */}
              <motion.div variants={itemVariants} className="lg:text-right">
                <h6 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                  {language === 'he' ? 'אמצעי תשלום' : 'Payment Methods'}
                </h6>
                <div className="flex flex-wrap gap-2 sm:gap-3 lg:justify-end">
                  {Object.entries(PaymentIcons).map(([name, icon]) => (
                    <div key={name} className="bg-white/10 rounded-lg p-2 sm:p-2.5 flex items-center justify-center">
                      {icon}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} KFAR Marketplace. {language === 'he' ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
                  <span className="hidden sm:inline"> | </span>
                  <br className="sm:hidden" />
                  <Link href="/policies/accessibility" className="text-gray-500 hover:text-white transition-colors mx-1 sm:mx-2">
                    {language === 'he' ? 'נגישות' : 'Accessibility'}
                  </Link>
                  <span className="text-gray-700">|</span>
                  <Link href="/sitemap" className="text-gray-500 hover:text-white transition-colors mx-1 sm:mx-2">
                    {language === 'he' ? 'מפת אתר' : 'Sitemap'}
                  </Link>
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span>{language === 'he' ? 'נוצר עם' : 'Made with'}</span>
                <Sun className="w-4 h-4 text-sun-gold" />
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
