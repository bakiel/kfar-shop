'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  ShoppingBag,
  UserPlus,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  MapPin,
  Leaf,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { MarketplaceStats, LandingVendor } from '@/lib/types/landing';

interface LandingFooterProps {
  stats: MarketplaceStats;
  vendors: LandingVendor[];
}

export default function LandingFooter({ stats, vendors }: LandingFooterProps) {
  const { t, language, isRTL } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [email, setEmail] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const quickLinks = [
    { label: t('Home'), href: '/' },
    { label: t('Marketplace'), href: '/shop' },
    { label: t('Explore Vendors'), href: '/vendors' },
    { label: t('About'), href: '/about' },
  ];

  const supportLinks = [
    { label: t('Contact Us'), href: '/contact' },
    { label: language === 'he' ? 'שאלות נפוצות' : 'FAQ', href: '/faq' },
    { label: t('Shipping'), href: '/shipping' },
    {
      label: language === 'he' ? 'החזרות' : 'Returns',
      href: '/returns',
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: MessageCircle, href: '#', label: 'WhatsApp' },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic would go here
    setEmail('');
  };

  return (
    <footer
      ref={ref}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative overflow-hidden bg-kfar-green-deep"
    >
      {/* Subtle radial accents */}
      <div
        className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #f6af0d 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #478c0b 0%, transparent 70%)',
        }}
      />

      {/* -------- Top CTA Card -------- */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sun-gold via-kfar-gold to-kfar-gold-dark p-8 sm:p-10 text-center"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-soil-brown font-display leading-tight">
              {language === 'he' ? 'מוכנים לקנות?' : 'Ready to shop?'}
            </h2>
            <p className="mt-2 text-soil-brown/80 text-base sm:text-lg max-w-lg mx-auto">
              {language === 'he'
                ? `הצטרפו ל-${stats.totalCustomers}+ משפחות שכבר קונות בכפר`
                : `Join ${stats.totalCustomers}+ families already shopping on KFAR`}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-soil-brown text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  {language === 'he' ? 'התחילו לקנות' : 'Start Shopping'}
                  <ArrowRight
                    className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`}
                  />
                </motion.button>
              </Link>
              <Link href="/customer/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/90 text-soil-brown font-bold rounded-xl shadow cursor-pointer"
                >
                  <UserPlus className="w-5 h-5 stroke-[1.5]" />
                  {t('Create Account')}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* -------- Middle Section: 4-Column Grid -------- */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Col 1: Brand */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sun-gold/20">
                <Leaf className="w-5 h-5 text-sun-gold stroke-[1.5]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight font-display">
                KFAR
              </span>
            </div>

            <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-[240px]">
              {language === 'he'
                ? 'השוק הקהילתי של כפר השלום, דימונה. מוצרים טבעוניים איכותיים מספקים מקומיים.'
                : 'The community marketplace of the Village of Peace, Dimona. Quality vegan products from local vendors.'}
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link key={social.label} href={social.href} aria-label={social.label}>
                    <motion.div
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 cursor-pointer transition-colors"
                    >
                      <Icon className="w-4 h-4 text-white stroke-[1.5]" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Col 2: Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              {t('Quick Links')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-sun-gold transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3: Customer Service */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              {t('Customer Service')}
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-sun-gold transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4: Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              {t('Newsletter')}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              {t('Get updates on deals and new products')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Enter your email')}
                required
                className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-white/40 text-sm border border-white/10 focus:outline-none focus:border-sun-gold/50 transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-sun-gold text-soil-brown cursor-pointer flex-shrink-0"
                aria-label={t('Subscribe')}
              >
                <Send className="w-4 h-4 stroke-[1.5]" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>

      {/* -------- Bottom Section -------- */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-start">
            {/* Payment info */}
            <p className="text-white/50 text-xs sm:text-sm">
              {language === 'he'
                ? 'אנחנו מקבלים: כרטיסי אשראי, ברייש\u05D9ט, העברה בנקאית'
                : 'We accept: Credit Cards, Braysheet, Bank Transfer'}
            </p>

            {/* Copyright + location */}
            <div className="flex items-center gap-1.5 text-white/50 text-xs sm:text-sm">
              <MapPin className="w-3.5 h-3.5 stroke-[1.5] flex-shrink-0" />
              <span>
                {language === 'he'
                  ? '\u00A9 2025 שוק כפר. כפר השלום, דימונה.'
                  : '\u00A9 2025 KFAR Marketplace. Village of Peace, Dimona.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
