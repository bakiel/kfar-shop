'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const FloatingNavigation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8; // Show after hero
      setIsVisible(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Auto-hide message after 5 seconds
    const messageTimer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(messageTimer);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 transition-all duration-500 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'
    }`}>
      {/* Main Button - Africa Heritage Logo */}
      <div 
        className={`relative transition-all duration-500 ${isExpanded ? 'scale-110' : 'scale-100'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Pulsing Background */}
        <div className="absolute inset-0 bg-sun-gold/20 rounded-full animate-pulse scale-150" />
        
        {/* Main Button */}
        <button className="relative w-20 h-20 bg-white rounded-full shadow-2xl border-4 border-sun-gold overflow-hidden group">
          <Image
            src="/images/logos/kfar_logo_africa_heritage.png"
            alt="KFAR Navigation"
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          />
        </button>

        {/* What is KFAR Text */}
        <div className={`absolute right-24 top-1/2 -translate-y-1/2 transition-all duration-500 ${
          isExpanded && showMessage ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2 border-leaf-green/20">
            <h3 className="text-lg font-bold text-soil-brown mb-2">KiFar Marketplace</h3>
            <p className="text-sm text-soil-brown mb-3">
              The digital home of the <span className="font-semibold text-leaf-green">Village of Peace</span>
            </p>
            <p className="text-xs text-gray-700 mb-2">
              <i className="fas fa-map-marker-alt text-sun-gold mr-1"></i>
              Kfar Hashalom, Dimona, Israel
            </p>
            <p className="text-xs text-gray-700 mb-4">
              Connecting our Village of Peace community's 50+ years of sustainable vegan living, authentic products, and pioneering businesses with the world.
            </p>
            <div className="text-xs text-sun-gold font-bold">
              "The Whole Village, In Your Hand"
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className={`absolute right-0 top-full mt-4 transition-all duration-500 ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}>
          <div className="space-y-3">
            <button 
              onClick={() => scrollToSection('community-services')}
              className="w-14 h-14 bg-leaf-green text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
            >
              <i className="fas fa-hands-helping text-lg"></i>
              <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-soil-brown text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Community Services
              </span>
            </button>

            <button 
              onClick={() => scrollToSection('village-enterprises')}
              className="w-14 h-14 bg-sun-gold text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
            >
              <i className="fas fa-store text-lg"></i>
              <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-soil-brown text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Our Businesses
              </span>
            </button>

            <button 
              onClick={() => scrollToSection('featured-products')}
              className="w-14 h-14 bg-earth-flame text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
            >
              <i className="fas fa-shopping-basket text-lg"></i>
              <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-soil-brown text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Products
              </span>
            </button>

            <button 
              onClick={() => scrollToSection('reviews')}
              className="w-14 h-14 bg-herbal-mint text-soil-brown rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
            >
              <i className="fas fa-star text-lg"></i>
              <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-soil-brown text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Reviews
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingNavigation;