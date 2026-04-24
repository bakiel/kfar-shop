'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { useUserRole, useVendorOrderCount } from '@/hooks/useUserRole';
import { useLanguage } from '@/lib/context/LanguageContext';
import NotificationBell from '@/components/customer/NotificationBell';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Globe,
  Menu,
  X,
  User,
  Store,
  ShieldCheck,
  ChevronRight,
  Home,
  ShoppingBag,
  Compass,
  Users,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Package,
  Heart,
  HelpCircle
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { href: '/', labelEn: 'Home', labelHe: 'בית', icon: Home },
  { href: '/marketplace', labelEn: 'Marketplace', labelHe: 'השוק', icon: ShoppingBag },
  { href: '/services', labelEn: 'Services', labelHe: 'שירותים', icon: Compass },
  { href: '/about', labelEn: 'About', labelHe: 'אודות', icon: Users },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SimplifiedHeader = () => {
  const { getCartCount } = useCart();
  const { role, userId } = useUserRole();
  const orderCount = useVendorOrderCount();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll progress for home page progress bar
  const { scrollYProgress } = useScroll();
  const isHomePage = pathname === '/';
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cartCount = getCartCount();

  // ---- Detect mobile ----
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ---- Scroll handler ----
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- Lock body scroll when menu open ----
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // ---- Focus search input when opened ----
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // ---- Close search/menu on Escape ----
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const getDashboardLink = useCallback(() => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'vendor': return '/vendor/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/login-portal';
    }
  }, [role]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // ---- Animation config ----
  const motionConfig = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' as const };

  return (
    <>
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-lg border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ---------- Logo ---------- */}
            <Link
              href="/"
              className="flex items-center flex-shrink-0 cursor-pointer group"
            >
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                transition={motionConfig}
              >
                <Image
                  src="/images/logos/kfar_logo_primary_horizontal.png"
                  alt="KFAR Marketplace"
                  width={isMobile ? 72 : 88}
                  height={isMobile ? 22 : 26}
                  className="h-auto"
                  priority
                />
              </motion.div>
            </Link>

            {/* ---------- Desktop Navigation ---------- */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-1 mx-6">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        active
                          ? 'text-[#478c0b]'
                          : 'text-gray-600 hover:text-[#3a3a1d] hover:bg-gray-50'
                      }`}
                    >
                      {language === 'he' ? item.labelHe : item.labelEn}
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                          style={{ backgroundColor: '#478c0b' }}
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* ---------- Desktop Search Bar ---------- */}
            {!isMobile && (
              <div className="hidden md:flex flex-1 max-w-sm mx-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'he'
                        ? 'חפש מוצרים, ספקים...'
                        : 'Search products, vendors...'
                    }
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#478c0b] focus:bg-white focus:ring-1 focus:ring-[#478c0b]/20 transition-all duration-200"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#478c0b] transition-colors duration-200 stroke-[1.5]" />
                </form>
              </div>
            )}

            {/* ---------- Right Action Buttons ---------- */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Mobile Search Toggle */}
              {isMobile && (
                <motion.button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Toggle search"
                >
                  <Search className="w-5 h-5 text-gray-600 stroke-[1.5]" />
                </motion.button>
              )}

              {/* Language Toggle */}
              <motion.button
                onClick={() => {
                  toggleLanguage();
                  window.dispatchEvent(new Event('languagechange'));
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4 text-gray-500 stroke-[1.5]" />
                <span className="text-xs font-semibold text-gray-600 hidden sm:inline">
                  {language === 'he' ? 'EN' : 'עב'}
                </span>
              </motion.button>

              {/* Notifications */}
              {role !== 'guest' && (
                <div className="relative">
                  <NotificationBell customerId={userId} />
                  {role === 'vendor' && orderCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                      {orderCount}
                    </span>
                  )}
                </div>
              )}

              {/* User / Dashboard */}
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <Link
                  href={getDashboardLink()}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center"
                  aria-label="User account"
                >
                  {role === 'admin' ? (
                    <ShieldCheck className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                  ) : role === 'vendor' ? (
                    <Store className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                  ) : role === 'customer' ? (
                    <User className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500 stroke-[1.5]" />
                  )}
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <Link
                  href="/cart"
                  className="relative p-2 rounded-xl hover:bg-[#f6af0d]/10 transition-colors cursor-pointer flex items-center"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-600 stroke-[1.5]" />
                  <AnimatePresence mode="wait">
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={shouldReduceMotion ? {} : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={shouldReduceMotion ? {} : { scale: 0, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 15,
                        }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#f6af0d] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white px-1"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* Hamburger / Menu */}
              <motion.button
                onClick={() => setIsMenuOpen(true)}
                whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                className="p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer md:ml-1"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-gray-700 stroke-[1.5]" />
              </motion.button>
            </div>
          </div>

          {/* ---------- Mobile Search Expandable ---------- */}
          <AnimatePresence>
            {isMobile && isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSearchSubmit} className="pb-3">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === 'he'
                          ? 'חפש מוצרים, ספקים...'
                          : 'Search products, vendors...'
                      }
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#478c0b] focus:bg-white focus:ring-1 focus:ring-[#478c0b]/20 transition-all duration-200"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      aria-label="Close search"
                    >
                      <X className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll progress bar — home page only */}
        {isHomePage && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-leaf-green origin-left"
            style={{ scaleX: progressScaleX }}
          />
        )}
      </header>

      {/* ================================================================= */}
      {/* MOBILE SLIDE-OUT DRAWER                                           */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} w-[85vw] max-w-sm h-full bg-white z-[70] shadow-2xl flex flex-col`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <Image
                  src="/images/logos/kfar_logo_primary_horizontal.png"
                  alt="KFAR"
                  width={80}
                  height={24}
                  className="h-auto"
                />
                <motion.button
                  onClick={() => setIsMenuOpen(false)}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600 stroke-[1.5]" />
                </motion.button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Main Navigation */}
                <div className="px-4 mb-6">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {language === 'he' ? 'ניווט' : 'Navigate'}
                  </p>
                  {NAV_ITEMS.map((item, index) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 transition-all duration-200 cursor-pointer ${
                            active
                              ? 'bg-[#478c0b]/10 text-[#478c0b]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 stroke-[1.5] ${active ? 'text-[#478c0b]' : 'text-gray-400'}`} />
                          <span className="font-medium text-sm">
                            {language === 'he' ? item.labelHe : item.labelEn}
                          </span>
                          {active && (
                            <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} w-1.5 h-1.5 rounded-full bg-[#478c0b]`} />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Account Section */}
                <div className="px-4 mb-6">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {language === 'he' ? 'חשבון' : 'Account'}
                  </p>

                  {role === 'guest' ? (
                    <>
                      <Link
                        href="/login-portal"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <LogIn className="w-5 h-5 text-gray-400 stroke-[1.5]" />
                        <span className="font-medium text-sm">
                          {language === 'he' ? 'התחבר' : 'Sign In'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                      </Link>
                      <Link
                        href="/customer/onboarding"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <UserPlus className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                        <span className="font-medium text-sm">
                          {language === 'he' ? 'הרשמה כלקוח' : 'Customer Sign Up'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                      </Link>
                      <Link
                        href="/vendor/onboarding"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <Store className="w-5 h-5 text-[#f6af0d] stroke-[1.5]" />
                        <span className="font-medium text-sm">
                          {language === 'he' ? 'הצטרף כספק' : 'Become a Vendor'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <LayoutDashboard className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                        <span className="font-medium text-sm">
                          {language === 'he' ? 'לוח בקרה' : 'Dashboard'}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                      </Link>
                      {role === 'vendor' && (
                        <Link
                          href="/vendor/orders"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <Package className="w-5 h-5 text-[#f6af0d] stroke-[1.5]" />
                          <span className="font-medium text-sm">
                            {language === 'he' ? 'הזמנות' : 'Orders'}
                          </span>
                          {orderCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {orderCount}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                        </Link>
                      )}
                      {role === 'customer' && (
                        <>
                          <Link
                            href="/customer/orders"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            <Package className="w-5 h-5 text-[#f6af0d] stroke-[1.5]" />
                            <span className="font-medium text-sm">
                              {language === 'he' ? 'ההזמנות שלי' : 'My Orders'}
                            </span>
                            <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                          </Link>
                          <Link
                            href="/customer/wishlist"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            <Heart className="w-5 h-5 text-[#c23c09] stroke-[1.5]" />
                            <span className="font-medium text-sm">
                              {language === 'he' ? 'מועדפים' : 'Wishlist'}
                            </span>
                            <ChevronRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'} stroke-[1.5]`} />
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Links */}
                <div className="px-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {language === 'he' ? 'קישורים' : 'Quick Links'}
                  </p>
                  <Link
                    href="/vendors"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Store className="w-5 h-5 text-gray-400 stroke-[1.5]" />
                    <span className="font-medium text-sm">
                      {language === 'he' ? 'הספקים שלנו' : 'Our Vendors'}
                    </span>
                  </Link>
                  <Link
                    href="/help"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-400 stroke-[1.5]" />
                    <span className="font-medium text-sm">
                      {language === 'he' ? 'עזרה' : 'Help Center'}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100">
                {/* Language Toggle */}
                <button
                  onClick={() => {
                    toggleLanguage();
                    window.dispatchEvent(new Event('languagechange'));
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer mb-3"
                >
                  <Globe className="w-4 h-4 text-gray-500 stroke-[1.5]" />
                  <span className="text-sm font-medium text-gray-600">
                    {language === 'he' ? 'Switch to English' : 'עבור לעברית'}
                  </span>
                </button>
                {/* Cart summary */}
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all cursor-pointer"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                  <span>
                    {language === 'he' ? 'עגלת קניות' : 'View Cart'}
                    {cartCount > 0 && ` (${cartCount})`}
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SimplifiedHeader;
