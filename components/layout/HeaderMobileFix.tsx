'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeaderMobileFix = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setIsScrolled(scrollPosition > 50);
      setShowFloatingNav(scrollPosition > 300);
      
      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(scrollPercentage, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && showFloatingNav) {
      const hasSeenSummary = localStorage.getItem('kfar-floaty-summary-seen');
      if (!hasSeenSummary) {
        setShowSummary(true);
        const timer = setTimeout(() => {
          setShowSummary(false);
          localStorage.setItem('kfar-floaty-summary-seen', 'true');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [showFloatingNav]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white shadow-2xl border-b-2 border-sun-gold/20' 
          : 'bg-gradient-to-b from-white/98 to-white/95 backdrop-blur-md'
      }`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-sun-gold/5 rounded-full animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-leaf-green/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="flex items-center justify-between h-16 md:h-24">
            {/* Logo with Animation - Mobile Optimized */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className={`transition-all duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                <Image
                  src="/images/logos/kfar_logo_primary_horizontal.png" 
                  alt="KiFar Marketplace" 
                  width={120}
                  height={36}
                  className="w-24 md:w-[120px] h-auto"
                />
              </div>
              {/* Hide text on mobile */}
              <div className={`hidden md:block transition-all duration-500 ${isScrolled ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
                <p className="text-xs text-soil-brown font-medium">Village of Peace</p>
                <p className="text-xs text-sun-gold font-bold">Est. 1967</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              <Link href="/categories" className="relative group py-2">
                <span className="relative">
                  <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                    Categories
                  </span>
                  <i className="fas fa-th-large text-xs ml-1.5 inline-block opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0" style={{ color: '#478c0b' }}></i>
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link href="/services" className="relative group py-2">
                <span className="relative">
                  <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                    Services
                  </span>
                  <i className="fas fa-concierge-bell text-xs ml-1.5 inline-block opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0" style={{ color: '#478c0b' }}></i>
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link href="/about" className="relative group py-2">
                <span className="relative">
                  <span className="text-soil-brown font-medium transition-all duration-500 inline-block group-hover:text-leaf-green transform group-hover:-translate-y-1 group-hover:scale-105">
                    About
                  </span>
                  <i className="fas fa-info-circle text-xs ml-1.5 inline-block opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0" style={{ color: '#478c0b' }}></i>
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-leaf-green to-sun-gold transition-all duration-500 group-hover:w-full" />
              </Link>
              
              <Link href="/directory" className="relative group ml-2">
                <button className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1.5" style={{ backgroundColor: '#f6af0d' }}>
                  <i className="fas fa-store text-sm"></i>
                  <span>Marketplace</span>
                  <i className="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-300"></i>
                </button>
              </Link>
            </nav>

            {/* Right Section - Mobile Optimized */}
            <div className="flex items-center gap-2 md:gap-6">
              {/* Language Toggle - Hidden on small mobile */}
              <button className="hidden sm:flex text-sm font-medium text-soil-brown hover:text-leaf-green transition-all duration-300 px-3 py-2 rounded-lg hover:bg-herbal-mint/20 transform hover:scale-105 min-h-[44px] items-center">
                <span className="inline-block transition-transform duration-300 hover:rotate-180">עב</span>
                <span className="mx-1">|</span>
                <span>EN</span>
              </button>

              {/* Currency Selector - Mobile Optimized */}
              <div className="relative group hidden sm:block">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-leaf-green/10 to-sun-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <select className="relative text-sm border-2 border-gray-200 rounded-lg pl-3 pr-8 py-2.5 md:pl-4 md:pr-10 bg-white hover:border-sun-gold focus:outline-none focus:border-leaf-green transition-all duration-300 cursor-pointer appearance-none hover:shadow-lg font-medium min-h-[44px]" style={{ minWidth: '90px', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                  <option value="ILS" className="font-medium py-2">₪ ILS</option>
                  <option value="USD" className="font-medium py-2">$ USD</option>
                  <option value="EUR" className="font-medium py-2">€ EUR</option>
                  <option value="GBP" className="font-medium py-2">£ GBP</option>
                </select>
                <div className="absolute right-0 top-0 h-full px-3 flex items-center pointer-events-none border-l border-gray-200">
                  <i className="fas fa-chevron-down text-xs transition-all duration-300 group-hover:text-sun-gold transform group-hover:rotate-180" style={{ color: '#6b7280' }}></i>
                </div>
              </div>

              {/* Cart - Always Visible */}
              <button className="relative p-3 rounded-lg hover:bg-herbal-mint/20 transition-all duration-300 transform hover:scale-105 group min-w-[44px] min-h-[44px] flex items-center justify-center">
                <i className="fas fa-shopping-cart text-lg md:text-xl text-soil-brown group-hover:text-leaf-green transition-all duration-300"></i>
                <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#c23c09' }}>
                  0
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-3 rounded-lg hover:bg-herbal-mint/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center mobile-menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl text-soil-brown transition-all duration-300`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      <div className={`mobile-menu fixed inset-0 bg-white z-50 transition-all duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Image
              src="/images/logos/kfar_logo_primary_horizontal.png" 
              alt="KiFar Marketplace" 
              width={100}
              height={30}
              className="h-8 w-auto"
            />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-lg hover:bg-gray-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close mobile menu"
            >
              <i className="fas fa-times text-xl text-soil-brown"></i>
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto py-6">
            {/* Main Navigation */}
            <nav className="px-4 space-y-2">
              <Link 
                href="/directory" 
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <div className="px-4 py-4 rounded-xl text-white font-semibold flex items-center gap-3 shadow-lg" style={{ backgroundColor: '#f6af0d' }}>
                  <i className="fas fa-store text-lg"></i>
                  <span className="text-lg">Marketplace</span>
                  <i className="fas fa-arrow-right ml-auto"></i>
                </div>
              </Link>

              <Link 
                href="/categories" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3"
              >
                <i className="fas fa-th-large text-lg" style={{ color: '#478c0b' }}></i>
                <span className="text-lg font-medium text-soil-brown">Categories</span>
              </Link>

              <Link 
                href="/services" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3"
              >
                <i className="fas fa-concierge-bell text-lg" style={{ color: '#478c0b' }}></i>
                <span className="text-lg font-medium text-soil-brown">Services</span>
              </Link>

              <Link 
                href="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3"
              >
                <i className="fas fa-info-circle text-lg" style={{ color: '#478c0b' }}></i>
                <span className="text-lg font-medium text-soil-brown">About</span>
              </Link>
            </nav>

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-4 my-6"></div>

            {/* Settings Section */}
            <div className="px-4 space-y-4">
              {/* Language Selector */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <span className="font-medium text-soil-brown">Language</span>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-lg bg-white border-2 border-leaf-green text-sm font-medium min-h-[44px]" style={{ color: '#478c0b' }}>
                    EN
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-white border-2 border-gray-200 text-sm font-medium min-h-[44px]">
                    עב
                  </button>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="font-medium text-soil-brown block mb-2">Currency</label>
                <select className="w-full text-sm border-2 border-gray-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:border-leaf-green transition-all duration-300">
                  <option value="ILS">₪ ILS - Israeli Shekel</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>Village of Peace</span>
              <span>•</span>
              <span>Est. 1967</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigator - Mobile Optimized */}
      <div className={`fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl transition-all duration-300 z-40 group scale-90 md:scale-100 ${
        showFloatingNav ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}>
        {/* Summary Window - Mobile Optimized */}
        {showSummary && (
          <div className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-500 origin-bottom">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 w-72 md:w-80 border-2" style={{ borderColor: '#478c0b' }}>
              <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: '#3a3a1d' }}>KiFar Marketplace</h3>
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

        {/* Collapsed State */}
        <div className="flex items-center justify-center">
          {/* Progress Ring */}
          <div className="absolute inset-0 rounded-full">
            <svg className="w-14 h-14 md:w-16 md:h-16">
              <circle
                cx="28"
                cy="28"
                r="26"
                stroke="#e5e7eb"
                strokeWidth="3"
                fill="none"
                className="md:hidden"
              />
              <circle
                cx="28"
                cy="28"
                r="26"
                stroke="#478c0b"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${163.4 * scrollProgress / 100} 163.4`}
                className="transition-all duration-300 md:hidden"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="none"
                className="hidden md:block"
              />
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#478c0b"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${188.5 * scrollProgress / 100} 188.5`}
                className="transition-all duration-300 hidden md:block"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
          </div>
          
          {/* Center Button with Logo */}
          <button className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white relative z-10 transition-all duration-300 border-2 group-hover:opacity-0 group-hover:scale-0" style={{ borderColor: '#f6af0d' }}>
            <Image
              src="/images/logos/kfar_logo_africa_heritage.png" 
              alt="KFAR Navigation" 
              width={36} 
              height={36}
              className="object-contain p-1 w-9 h-9 md:w-10 md:h-10"
            />
          </button>
        </div>

        {/* Expanded State - Navigation Items */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-3 bg-white rounded-full px-4 md:px-6 py-2 md:py-3 shadow-2xl opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-bottom">
          <Link href="/" className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#478c0b' }}>
            <i className="fas fa-home text-base md:text-lg"></i>
          </Link>

          <Link href="/directory" className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item animate-pulse" style={{ backgroundColor: '#f6af0d', animationDuration: '2s' }}>
            <i className="fas fa-store text-base md:text-lg"></i>
          </Link>

          <Link href="/categories" className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#f6af0d' }}>
            <i className="fas fa-th-large text-base md:text-lg"></i>
          </Link>

          <Link href="/services" className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#c23c09' }}>
            <i className="fas fa-concierge-bell text-base md:text-lg"></i>
          </Link>

          <Link href="/about" className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#cfe7c1' }}>
            <i className="fas fa-info-circle text-base md:text-lg" style={{ color: '#3a3a1d' }}></i>
          </Link>

          <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all relative group/item" style={{ backgroundColor: '#478c0b' }}>
            <i className="fas fa-shopping-cart text-base md:text-lg"></i>
            <span className="absolute -top-1 -right-1 text-white text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#c23c09' }}>
              0
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default HeaderMobileFix;