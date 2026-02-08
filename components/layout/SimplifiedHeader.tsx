'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { useUserRole, useVendorOrderCount } from '@/hooks/useUserRole';
import { useLanguage } from '@/lib/context/LanguageContext';
import MenuDropdownFixed from './MenuDropdownFixed';
import NotificationBell from '@/components/customer/NotificationBell';
import { usePathname } from 'next/navigation';
import { FaSearch, FaQrcode } from 'react-icons/fa';

const SimplifiedHeader = () => {
  const { getCartCount } = useCart();
  const { role, userId } = useUserRole();
  const orderCount = useVendorOrderCount();
  const { language, setLanguage, toggleLanguage, t, isRTL } = useLanguage();
  const pathname = usePathname();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll and floating nav
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);
      
      // Show floating nav after scrolling past hero
      const heroHeight = window.innerHeight * 0.8;
      setShowFloatingNav(scrollY > heroHeight);
      
      // Calculate scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollY / docHeight) * 100, 100);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-hide summary after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSummary(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Open QR Scanner
  const openQRScanner = () => {
    const event = new CustomEvent('open-qr-scanner');
    window.dispatchEvent(event);
  };

  // Open User Menu (for profile dropdown if needed)
  const openUserMenu = () => {
    if (role === 'guest') {
      window.location.href = '/login';
    } else if (role === 'vendor') {
      window.location.href = '/vendor/dashboard';
    } else if (role === 'admin') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/customer/dashboard';
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
          : 'bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-lg border-b border-white/20'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Reduced by 30% */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/images/logos/kfar_logo_primary_horizontal.png"
                alt="KFAR Marketplace"
                width={isMobile ? 70 : 84}
                height={isMobile ? 21 : 25}
                className="h-auto"
                priority
              />
            </Link>

            {/* Desktop Search Bar */}
            {!isMobile && (
              <div className="flex-1 max-w-xl mx-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, vendors..."
                    className="w-full px-4 py-2 pr-10 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-lg focus:outline-none focus:border-leaf-green focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-leaf-green transition-colors"
                    aria-label="Search"
                  >
                    <FaSearch />
                  </button>
                </form>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile Search Toggle */}
              {isMobile && (
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 rounded-lg hover:bg-leaf-green/10 transition-colors group"
                  aria-label="Toggle search"
                >
                  <FaSearch className="text-lg text-gray-600 group-hover:text-leaf-green transition-colors" />
                </button>
              )}

              {/* QR Scanner */}
              <button
                onClick={openQRScanner}
                className="p-2 rounded-lg hover:bg-sun-gold/10 transition-colors group"
                aria-label="QR Scanner"
              >
                <FaQrcode className="text-lg text-gray-600 group-hover:text-sun-gold transition-colors" />
              </button>

              {/* Onboarding Quick Access */}
              {!isMobile && (
                <div className="relative group">
                  <button 
                    className="relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
                    style={{ 
                      borderColor: '#478c0b',
                      backgroundColor: 'rgba(71, 140, 11, 0.05)'
                    }}
                  >
                    <i className="fas fa-rocket text-sm" style={{ color: '#478c0b' }}></i>
                    <span className="text-sm font-medium" style={{ color: '#3a3a1d' }}>Join</span>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] overflow-hidden border border-gray-200">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Get Started
                        </div>
                        
                        <Link 
                          href="/customer/onboarding"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-leaf-green/10 transition-colors group/item"
                        >
                          <div className="w-8 h-8 bg-sun-gold/20 rounded-lg flex items-center justify-center">
                            <i className="fas fa-shopping-bag text-sun-gold text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm" style={{ color: '#3a3a1d' }}>
                              Customer Onboarding
                            </div>
                            <div className="text-xs text-gray-500">
                              Start shopping today
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-xs text-gray-400 group-hover/item:text-sun-gold transition-colors"></i>
                        </Link>
                        
                        <Link 
                          href="/vendor/onboarding"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-terra-cotta/10 transition-colors group/item"
                        >
                          <div className="w-8 h-8 bg-terra-cotta/20 rounded-lg flex items-center justify-center">
                            <i className="fas fa-store text-terra-cotta text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm" style={{ color: '#3a3a1d' }}>
                              Vendor Onboarding
                            </div>
                            <div className="text-xs text-gray-500">
                              List your business
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-xs text-gray-400 group-hover/item:text-terra-cotta transition-colors"></i>
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <Link 
                            href="/login-portal"
                            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group/item"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-sign-in-alt text-gray-600 text-sm"></i>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm" style={{ color: '#3a3a1d' }}>
                                Login Portal
                              </div>
                              <div className="text-xs text-gray-500">
                                All login options
                              </div>
                            </div>
                            <i className="fas fa-arrow-right text-xs text-gray-400 group-hover/item:text-gray-600 transition-colors"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Language Toggle - Always Visible */}
              {!isMobile && (
                <button
                  onClick={() => {
                    toggleLanguage();
                    // Force re-render without page reload
                    window.dispatchEvent(new Event('languagechange'));
                  }}
                  className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                  aria-label="Toggle language"
                >
                  <span className={language === 'he' ? 'font-bold' : ''}>עב</span>
                  <span className="mx-1">|</span>
                  <span className={language === 'en' ? 'font-bold' : ''}>EN</span>
                </button>
              )}

              {/* Notifications */}
              {role !== 'guest' && (
                <div className="relative">
                  <NotificationBell customerId={userId} />
                  {role === 'vendor' && orderCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {orderCount}
                    </span>
                  )}
                </div>
              )}

              {/* Menu Button */}
              <button
                onClick={() => {
                  console.log('Menu button clicked');
                  setIsMenuOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-leaf-green/10 transition-colors relative group"
                aria-label="Open menu"
              >
                <i className="fas fa-bars text-xl text-gray-600 group-hover:text-leaf-green transition-colors"></i>
                {/* Visual feedback for menu state */}
                {isMenuOpen && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-leaf-green rounded-full animate-pulse"></span>
                )}
              </button>

              {/* User Account */}
              <button
                onClick={openUserMenu}
                className="p-2 rounded-lg hover:bg-terra-cotta/10 transition-colors group"
                aria-label="User account"
              >
                <i className={`fas ${
                  role === 'admin' ? 'fa-user-shield' : 
                  role === 'vendor' ? 'fa-store' : 
                  role === 'customer' ? 'fa-user' : 
                  'fa-user-circle'
                } text-xl text-gray-600 group-hover:text-terra-cotta transition-colors`}></i>
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg hover:bg-sun-gold/10 transition-colors group"
                aria-label="Shopping cart"
              >
                <i className="fas fa-shopping-cart text-xl text-gray-600 group-hover:text-sun-gold transition-colors"></i>
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-sun-gold to-kfar-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobile && isSearchOpen && (
            <div className="pb-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, vendors..."
                  className="w-full px-4 py-2 pr-10 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-lg focus:outline-none focus:border-leaf-green focus:bg-white transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-leaf-green transition-colors"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Menu Dropdown */}
      <MenuDropdownFixed 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Floating Navigator with Logo - Center Bottom */}
      {/* Hide on mobile product/cart/checkout pages to avoid obstructing important buttons */}
      {!(isMobile && (pathname.startsWith('/product/') || pathname === '/cart' || pathname.startsWith('/checkout'))) && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl transition-all duration-300 z-40 group ${
          showFloatingNav ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}>
        {/* Summary Window - Shows Only Once */}
        {showSummary && showFloatingNav && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-500 origin-bottom">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2" style={{ borderColor: '#478c0b' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#3a3a1d' }}>KFAR Marketplace</h3>
              <p className="text-sm mb-3" style={{ color: '#3a3a1d' }}>
                The digital home of the <span className="font-semibold" style={{ color: '#478c0b' }}>Village of Peace</span>
              </p>
              <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#4b5563' }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#f6af0d' }}></i>
                Kfar Hashalom, Dimona, Israel
              </div>
              <div className="text-xs font-bold" style={{ color: '#f6af0d' }}>
                "The Whole Village, In Your Hand"
              </div>
            </div>
          </div>
        )}

        {/* Collapsed State - Single Button with Logo */}
        <div className="flex items-center justify-center relative w-24 h-24">
          {/* Progress Ring with Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 absolute -top-4 -left-4">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="#478c0b"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${377.0 * scrollProgress / 100} 377.0`}
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
          <button className="w-24 h-24 rounded-full flex items-center justify-center bg-white relative z-10 transition-all duration-300 border-2 group-hover:opacity-0 group-hover:scale-0" style={{ borderColor: '#f6af0d' }}>
            <Image
              src="/images/logos/kfar_logo_africa_heritage.png" 
              alt="KFAR Navigation" 
              width={72} 
              height={72}
              className="object-contain p-2"
            />
          </button>
        </div>

        {/* Expanded State - Navigation Items */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-2xl opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-bottom">
          <Link href="/" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#478c0b' }}>
            <i className="fas fa-home text-lg"></i>
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              {t('Home')}
            </span>
          </Link>

          <Link href="/marketplace" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item animate-pulse" style={{ backgroundColor: '#f6af0d', animationDuration: '2s' }}>
            <i className="fas fa-store text-lg"></i>
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              {t('Marketplace')}
            </span>
          </Link>

          <Link href="/services" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#c23c09' }}>
            <i className="fas fa-concierge-bell text-lg"></i>
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              {t('Services')}
            </span>
          </Link>

          <Link href="/about" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#95b8f6' }}>
            <i className="fas fa-users text-lg"></i>
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              {t('About')}
            </span>
          </Link>

          <Link href="/cart" className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#00b1f7' }}>
            <i className="fas fa-shopping-basket text-lg"></i>
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {getCartCount()}
              </span>
            )}
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none" style={{ backgroundColor: '#3a3a1d' }}>
              {t('Cart')}
            </span>
          </Link>
        </div>
      </div>
      )}

      {/* AI Shopping Assistant is now in ClientLayout */}
    </>
  );
};

export default SimplifiedHeader;