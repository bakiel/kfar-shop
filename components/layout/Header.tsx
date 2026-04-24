'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown, ShoppingBag, UtensilsCrossed, Home, Sparkles, CalendarDays,
  Mountain, Wrench, BookOpen, Headphones, HelpCircle, Truck, Shield,
  Store, UserPlus, Info, ShoppingCart, Menu, X, FlaskConical, Users,
  MapPin, ConciergeBell, Mic
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import NotificationBell from '@/components/customer/NotificationBell';
import CustomerQuickAccess from './CustomerQuickAccess';
import UserAccountDropdown from './UserAccountDropdown';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { isMobile, isTablet, isDesktop } = useMobileDetect();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const { getCartCount } = useCart();

  // Load language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('kfar-language') as 'en' | 'he';
    if (savedLang) {
      setLanguage(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'he' ? 'rtl' : 'ltr';
    }
  }, []);

  // Handle language toggle
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    setLanguage(newLang);
    localStorage.setItem('kfar-language', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    // Reload page to apply translations
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const heroHeight = windowHeight * 0.8;

      setIsScrolled(scrollPosition > 50);

      // Only hide floating nav on mobile product pages (not marketplace)
      const isProductPage = pathname.startsWith('/product/');
      const shouldHideFloatingNav = isMobile && isProductPage;

      // Show floating nav on all devices except mobile product pages
      setShowFloatingNav(scrollPosition > 300 && !shouldHideFloatingNav);

      // Hide header when floater appears on all devices
      setHideHeader(scrollPosition > heroHeight);

      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(scrollPercentage, 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, pathname]);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && showFloatingNav) {
      // Check if user has seen the summary before
      const hasSeenSummary = localStorage.getItem('kfar-floaty-summary-seen');
      if (!hasSeenSummary) {
        setShowSummary(true);
        // Auto hide after 5 seconds
        const timer = setTimeout(() => {
          setShowSummary(false);
          localStorage.setItem('kfar-floaty-summary-seen', 'true');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [showFloatingNav]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Main Header - Hide when floater appears */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        hideHeader
          ? '-translate-y-full opacity-0'
          : 'translate-y-0 opacity-100'
      } ${
        isScrolled
          ? 'bg-white shadow-2xl border-b-2 border-sun-gold/20'
          : 'bg-gradient-to-b from-white/98 to-white/95 backdrop-blur-md'
      }`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-sun-gold/5 rounded-full animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-leaf-green/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Logo with Animation */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`transition-all duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                <Image
                  src="/images/logos/kfar_logo_primary_horizontal.png"
                  alt="KiFar Marketplace"
                  width={120}
                  height={36}
                  className="transition-all duration-300 group-hover:scale-105 w-24 sm:w-32 h-auto"
                />
              </div>
              <div className={`hidden sm:block transition-all duration-500 ${isScrolled ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
                <p className="text-xs font-medium" style={{ color: '#3a3a1d' }}>Village of Peace</p>
                <p className="text-xs font-bold" style={{ color: '#f6af0d' }}>Est. 1967</p>
              </div>
            </Link>

            {/* Desktop Navigation with Hover Effects */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              <div className="relative group">
                <Link href="/services" className="relative py-2 flex items-center">
                  <span className="relative">
                    <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                      Services
                    </span>
                    <ChevronDown className="w-3 h-3 stroke-[1.5] ml-1.5 inline-block transition-all duration-500 transform group-hover:rotate-180" style={{ color: '#478c0b' }} />
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
                  {/* Floating dot */}
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: '#478c0b' }}></span>
                </Link>

                {/* Services Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 border-2" style={{ borderColor: '#478c0b' }}>
                  <div className="p-2">
                    <Link href="/services?category=food" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <UtensilsCrossed className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Food & Dining</div>
                          <div className="text-xs text-gray-500">Restaurants, cafes & food vendors</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/services?category=home" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Home Services</div>
                          <div className="text-xs text-gray-500">Repairs, maintenance & utilities</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/services?category=personal" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 stroke-[1.5]" style={{ color: '#c23c09' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Personal Care</div>
                          <div className="text-xs text-gray-500">Health, beauty & wellness</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/services?category=events" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Events & Community</div>
                          <div className="text-xs text-gray-500">Gatherings, workshops & programs</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/marketplace" className="relative group py-2">
                <span className="relative">
                  <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                    Marketplace
                  </span>
                  <ShoppingBag className="w-3 h-3 stroke-[1.5] ml-1.5 inline-block opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0" style={{ color: '#478c0b' }} />
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
                {/* Floating dot */}
                <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: '#478c0b' }}></span>
              </Link>
              <div className="relative group">
                <Link href="/about" className="relative py-2 flex items-center">
                  <span className="relative">
                    <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                      About
                    </span>
                    <ChevronDown className="w-3 h-3 stroke-[1.5] ml-1.5 inline-block transition-all duration-500 transform group-hover:rotate-180" style={{ color: '#478c0b' }} />
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
                  {/* Floating dot */}
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: '#478c0b' }}></span>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 border-2" style={{ borderColor: '#478c0b' }}>
                  <div className="p-2">
                    <Link href="/about#tourism" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Mountain className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Tourism & Experiences</div>
                          <div className="text-xs text-gray-500">Tours, workshops & stays</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/about#services" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Community Services</div>
                          <div className="text-xs text-gray-500">Professional trades & skills</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/about#about" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 stroke-[1.5]" style={{ color: '#c23c09' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>About VOP</div>
                          <div className="text-xs text-gray-500">Our story & heritage</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/about#education" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Cultural Education</div>
                          <div className="text-xs text-gray-500">Learn our traditions</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <Link href="/support" className="relative py-2 flex items-center">
                  <span className="relative">
                    <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                      Support
                    </span>
                    <ChevronDown className="w-3 h-3 stroke-[1.5] ml-1.5 inline-block transition-all duration-500 transform group-hover:rotate-180" style={{ color: '#478c0b' }} />
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
                  {/* Floating dot */}
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: '#478c0b' }}></span>
                </Link>

                {/* Support Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 border-2" style={{ borderColor: '#478c0b' }}>
                  <div className="p-2">
                    <Link href="/support#contact" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Headphones className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Contact & Support</div>
                          <div className="text-xs text-gray-500">Get help & reach our team</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/support#faq" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>FAQ & Help</div>
                          <div className="text-xs text-gray-500">Common questions answered</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/support#shipping" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 stroke-[1.5]" style={{ color: '#c23c09' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Shipping & Returns</div>
                          <div className="text-xs text-gray-500">Delivery info & policies</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/support#privacy" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Privacy & Terms</div>
                          <div className="text-xs text-gray-500">Legal & privacy info</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Join KFAR Dropdown - Enhanced with notification light */}
              <div className="relative group">
                <button className="relative py-2 flex items-center">
                  <span className="relative">
                    <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                      Join KFAR
                    </span>
                    <ChevronDown className="w-3 h-3 stroke-[1.5] ml-1.5 inline-block transition-all duration-500 transform group-hover:rotate-180" style={{ color: '#478c0b' }} />
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
                  {/* Notification dot */}
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* Join KFAR Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 border-2" style={{ borderColor: '#478c0b' }}>
                  <div className="p-2">
                    <Link href="/become-a-vendor" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Become a Vendor</div>
                          <div className="text-xs text-gray-500">Start selling on KFAR</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/join-as-customer" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <UserPlus className="w-5 h-5 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Join as Customer</div>
                          <div className="text-xs text-gray-500">Shop & save with benefits</div>
                        </div>
                      </div>
                    </Link>
                    <div className="border-t my-2"></div>
                    <Link href="/join-kfar" className="block px-4 py-3 rounded-lg hover:bg-herbal-mint/20 transition-all group/item">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 stroke-[1.5]" style={{ color: '#c23c09' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#3a3a1d' }}>Learn More</div>
                          <div className="text-xs text-gray-500">See all membership benefits</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
              {/* Language Toggle - Hidden on mobile, shown on tablet+ */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex text-sm font-medium text-soil-brown hover:text-leaf-green transition-all duration-300 px-3 py-2 rounded-lg hover:bg-herbal-mint/20 transform hover:scale-105 flex-shrink-0"
                aria-label="Toggle language"
              >
                <span className={`inline-block transition-all duration-300 ${language === 'he' ? 'font-bold' : ''}`}>עב</span>
                <span className="mx-1">|</span>
                <span className={`inline-block transition-all duration-300 ${language === 'en' ? 'font-bold' : ''}`}>EN</span>
              </button>

              {/* Currency Selector - Fixed double arrow issue */}
              <div className="relative group hidden sm:block">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-leaf-green/10 to-sun-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <select
                  className="relative text-sm border-2 border-gray-200 rounded-lg pl-4 pr-10 py-2.5 bg-white hover:border-sun-gold focus:outline-none focus:border-leaf-green transition-all duration-300 cursor-pointer hover:shadow-lg font-medium"
                  style={{
                    minWidth: '110px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="ILS" className="font-medium py-2">₪ ILS</option>
                  <option value="USD" className="font-medium py-2">$ USD</option>
                  <option value="EUR" className="font-medium py-2">€ EUR</option>
                  <option value="GBP" className="font-medium py-2">£ GBP</option>
                </select>
                <div className="absolute right-0 top-0 h-full px-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-3 h-3 stroke-[1.5] transition-all duration-300 group-hover:text-sun-gold transform group-hover:rotate-180" style={{ color: '#6b7280' }} />
                </div>
              </div>

              {/* Temporary Portal Testing Button */}
              <div className="relative group hidden sm:block">
                <Link
                  href="/login-portal"
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed transition-all duration-300 hover:shadow-lg group"
                  style={{
                    borderColor: '#f6af0d',
                    backgroundColor: 'rgba(246, 175, 13, 0.05)'
                  }}
                >
                  <FlaskConical className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                  <span className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Portal</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="font-bold mb-1">Testing Portal</div>
                    <div>For development & testing purposes only</div>
                    <div className="text-yellow-300 mt-1">Will be removed in production</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Customer Quick Access */}
              <CustomerQuickAccess />

              {/* Notifications - Show only for logged-in customers */}
              <NotificationBell customerId={typeof window !== 'undefined' && localStorage.getItem('customerToken') ? 'demo-customer-001' : undefined} />

              {/* User Account Dropdown */}
              <UserAccountDropdown />

              {/* Cart */}
              <Link href="/cart" className="relative p-3 rounded-lg hover:bg-herbal-mint/20 transition-all duration-300 transform hover:scale-105 group block">
                <ShoppingCart className="w-5 h-5 stroke-[1.5] text-soil-brown group-hover:text-leaf-green transition-all duration-300" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#c23c09' }}>
                    {getCartCount()}
                  </span>
                )}
                {/* Cart tooltip */}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap" style={{ backgroundColor: '#3a3a1d' }}>
                  Cart
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-lg hover:bg-herbal-mint/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 stroke-[1.5] text-soil-brown transition-all duration-300" />
                ) : (
                  <Menu className="w-6 h-6 stroke-[1.5] text-soil-brown transition-all duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Image
              src="/images/logos/kfar_logo_africa_heritage.png"
              alt="KiFar Marketplace"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all min-w-[44px] min-h-[44px]"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 stroke-[1.5] text-gray-600" />
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="border-b">
              <div className="flex items-center gap-4 px-6 py-4">
                <ConciergeBell className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                <span className="text-lg font-medium" style={{ color: '#3a3a1d' }}>Services</span>
              </div>
              <div className="ml-12 pb-2">
                <Link
                  href="/services?category=food"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UtensilsCrossed className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Food & Dining</span>
                </Link>
                <Link
                  href="/services?category=home"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Home Services</span>
                </Link>
                <Link
                  href="/services?category=personal"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Personal Care</span>
                </Link>
                <Link
                  href="/services?category=events"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CalendarDays className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Events & Community</span>
                </Link>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="flex items-center gap-4 px-6 py-4 hover:bg-herbal-mint/10 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
              <span className="text-lg font-medium" style={{ color: '#3a3a1d' }}>Marketplace</span>
            </Link>
            <div className="border-b">
              <div className="flex items-center gap-4 px-6 py-4">
                <Info className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                <span className="text-lg font-medium" style={{ color: '#3a3a1d' }}>About</span>
              </div>
              <div className="ml-12 pb-2">
                <Link
                  href="/about#tourism"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mountain className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Tourism & Experiences</span>
                </Link>
                <Link
                  href="/about#services"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wrench className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Community Services</span>
                </Link>
                <Link
                  href="/about#about"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>About VOP</span>
                </Link>
                <Link
                  href="/about#education"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Cultural Education</span>
                </Link>
              </div>
            </div>
            <div className="border-b">
              <div className="flex items-center gap-4 px-6 py-4">
                <Headphones className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                <span className="text-lg font-medium" style={{ color: '#3a3a1d' }}>Support</span>
              </div>
              <div className="ml-12 pb-2">
                <Link
                  href="/support#contact"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Headphones className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Contact & Support</span>
                </Link>
                <Link
                  href="/support#faq"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>FAQ & Help</span>
                </Link>
                <Link
                  href="/support#shipping"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Truck className="w-4 h-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Shipping & Returns</span>
                </Link>
                <Link
                  href="/support#privacy"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Privacy & Terms</span>
                </Link>
              </div>
            </div>

            {/* Join KFAR Section in Mobile Menu */}
            <div className="border-b">
              <div className="flex items-center gap-4 px-6 py-4">
                <Users className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                <span className="text-lg font-medium" style={{ color: '#3a3a1d' }}>Join KFAR</span>
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </div>
              <div className="ml-12 pb-2">
                <Link
                  href="/become-a-vendor"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Store className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Become a Vendor</span>
                </Link>
                <Link
                  href="/join-as-customer"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Join as Customer</span>
                </Link>
                <Link
                  href="/join-kfar"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-herbal-mint/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info className="w-4 h-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
                  <span className="text-base" style={{ color: '#3a3a1d' }}>Learn More</span>
                </Link>
              </div>
            </div>

            <div className="border-t my-4"></div>

            {/* Mobile Language & Currency */}
            <div className="px-6 py-4">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Language</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (language !== 'en') toggleLanguage();
                  }}
                  className="flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all"
                  style={{
                    borderColor: language === 'en' ? '#478c0b' : '#e5e7eb',
                    color: language === 'en' ? '#478c0b' : '#6b7280',
                    backgroundColor: language === 'en' ? 'rgba(71, 140, 11, 0.05)' : 'transparent'
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    if (language !== 'he') toggleLanguage();
                  }}
                  className="flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all"
                  style={{
                    borderColor: language === 'he' ? '#478c0b' : '#e5e7eb',
                    color: language === 'he' ? '#478c0b' : '#6b7280',
                    backgroundColor: language === 'he' ? 'rgba(71, 140, 11, 0.05)' : 'transparent'
                  }}
                >
                  עברית
                </button>
              </div>
            </div>

            {/* Login Section in Mobile Menu */}
            <div className="border-b">
              <div className="flex items-center gap-4 px-6 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#478c0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-lg font-medium" style={{ color: '#3a3a1d' }}>Account Access</span>
              </div>
              <div className="px-6 pb-4 space-y-2">
                <Link
                  href="/customer/login?role=customer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5 stroke-[1.5] text-purple-500" />
                  <span className="text-base text-purple-600">Customer Login</span>
                </Link>
                <Link
                  href="/customer/login?role=vendor"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Store className="w-5 h-5 stroke-[1.5] text-blue-500" />
                  <span className="text-base text-blue-600">Vendor Portal</span>
                </Link>
                <Link
                  href="/customer/login?role=admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5 stroke-[1.5] text-green-500" />
                  <span className="text-base text-green-600">Admin Access</span>
                </Link>
              </div>
            </div>

            <div className="px-6 py-4">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Currency</label>
              <select className="w-full text-base border-2 border-gray-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:border-leaf-green transition-all">
                <option value="ILS">₪ ILS - Israeli Shekel</option>
                <option value="USD">$ USD - US Dollar</option>
                <option value="EUR">€ EUR - Euro</option>
                <option value="GBP">£ GBP - British Pound</option>
              </select>
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-6 border-t">
            {/* Temporary Portal Button for Mobile */}
            <Link
              href="/login-portal"
              className="w-full mb-3 py-4 rounded-xl border-2 border-dashed font-semibold text-lg flex items-center justify-center gap-3 relative"
              style={{
                borderColor: '#f6af0d',
                backgroundColor: 'rgba(246, 175, 13, 0.05)',
                color: '#3a3a1d'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FlaskConical className="w-5 h-5 stroke-[1.5]" style={{ color: '#f6af0d' }} />
              <span>Testing Portal</span>
              <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">TEMP</span>
            </Link>

            <button
              className="w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
              style={{ backgroundColor: '#478c0b' }}
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
              View Cart (0)
            </button>
          </div>
        </div>
      </div>

      {/* Floating Voice Button - Hidden on marketplace and product pages */}
      {pathname !== '/marketplace' && !pathname.startsWith('/product/') && (
        <button
          className={`fixed bottom-24 sm:bottom-8 right-4 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 z-40 hover:scale-110 ${
            showFloatingNav ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
          style={{ backgroundColor: '#c23c09' }}
          onClick={() => {
            const event = new CustomEvent('open-voice-chat');
            window.dispatchEvent(event);
          }}
          aria-label="Voice Shopping Assistant"
        >
          <Mic className="w-5 h-5 stroke-[1.5]" />
          {/* Pulsing indicator */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Floating Navigator with Summary */}
      <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl transition-all duration-300 z-50 group ${
        showFloatingNav ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}>
        {/* Summary Window - Shows Only Once */}
        {showSummary && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-500 origin-bottom">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2" style={{ borderColor: '#478c0b' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#3a3a1d' }}>KiFar Marketplace</h3>
              <p className="text-sm mb-3" style={{ color: '#3a3a1d' }}>
                The digital home of the <span className="font-semibold" style={{ color: '#478c0b' }}>Village of Peace</span>
              </p>
              <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#4b5563' }}>
                <MapPin className="w-3 h-3 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                Kfar Hashalom, Dimona, Israel
              </div>
              <div className="text-xs font-bold" style={{ color: '#f6af0d' }}>
                &quot;The Whole Village, In Your Hand&quot;
              </div>
            </div>
          </div>
        )}

        {/* Collapsed State - Single Button with Logo */}
        <div className="flex items-center justify-center relative">
          {/* Progress Ring with Glow */}
          <div className="absolute -inset-2 rounded-full">
            <svg className="w-20 h-20">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="38"
                stroke="#e5e7eb"
                strokeWidth="3"
                fill="none"
              />
              {/* Progress circle with glow */}
              <circle
                cx="40"
                cy="40"
                r="38"
                stroke="#478c0b"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${238.76 * scrollProgress / 100} 238.76`}
                className="transition-all duration-300 drop-shadow-[0_0_6px_rgba(71,140,11,0.8)]"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  filter: scrollProgress > 0 ? 'drop-shadow(0 0 8px rgba(71,140,11,0.9))' : 'none'
                }}
              />
            </svg>
          </div>

          {/* Center Button with Logo - Hidden on Hover */}
          <button className="w-16 h-16 rounded-full flex items-center justify-center bg-white relative z-10 transition-all duration-300 border-2 group-hover:opacity-0 group-hover:scale-0" style={{ borderColor: '#f6af0d' }}>
            <Image
              src="/images/logos/kfar_logo_africa_heritage.png"
              alt="KFAR Navigation"
              width={40}
              height={40}
              className="object-contain p-1"
            />
          </button>
        </div>

        {/* Expanded State - Navigation Items */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-2xl opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-bottom">
          <Link href="/" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#478c0b' }}>
            <Home className="w-5 h-5 stroke-[1.5]" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              Home
            </span>
          </Link>

          <Link href="/marketplace" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item animate-pulse" style={{ backgroundColor: '#f6af0d', animationDuration: '2s' }}>
            <Store className="w-5 h-5 stroke-[1.5]" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              Marketplace
            </span>
            {/* Special glow effect for marketplace */}
            <div className="absolute inset-0 rounded-xl animate-ping" style={{ backgroundColor: '#f6af0d', animationDuration: '3s' }}></div>
          </Link>

          <Link href="/services" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#c23c09' }}>
            <ConciergeBell className="w-5 h-5 stroke-[1.5]" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              Services
            </span>
          </Link>

          <Link href="/about" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#cfe7c1' }}>
            <Info className="w-5 h-5 stroke-[1.5]" style={{ color: '#3a3a1d' }} />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              About
            </span>
          </Link>

          <Link href="/support" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#3a3a1d' }}>
            <Headphones className="w-5 h-5 stroke-[1.5]" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              Support
            </span>
          </Link>

          <Link href="/cart" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#478c0b' }}>
            <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#c23c09' }}>
                {getCartCount()}
              </span>
            )}
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              Cart
            </span>
          </Link>

        </div>
      </div>
    </>
  );
};

export default Header;
