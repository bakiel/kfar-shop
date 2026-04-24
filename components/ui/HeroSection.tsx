'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QrCode, Wifi, Star, ShoppingBag, ArrowRight, Store, Sparkles, Leaf } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

const HeroSection = () => {
  const { t, isRTL } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Enhanced slide content with better storytelling
  const slides = [
    {
      id: 1,
      image: "/images/hero/13.jpg",
      badge: "Voice Shopping",
      title: "Shop Smarter",
      highlight: "With AI",
      subtitle: "Order with your voice, track with QR codes, enjoy same-day delivery",
      stats: { businesses: "30+", products: "1000+", delivery: "Same Day" }
    },
    {
      id: 2,
      image: "/images/hero/21.jpg",
      badge: "Local Marketplace",
      title: "Support Your",
      highlight: "Community",
      subtitle: "Shop from trusted local vendors with authentic products and great prices",
      stats: { vendors: "30+", savings: "20%+", reviews: "5 Stars" }
    },
    {
      id: 3,
      image: "/images/hero/19.jpg",
      badge: "100% Secure",
      title: "Safe & Easy",
      highlight: "Shopping",
      subtitle: "SSL encrypted checkout, multiple payment options, satisfaction guaranteed",
      stats: { secure: "100%", support: "24/7", returns: "30 Days" }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[750px] overflow-hidden" style={{ backgroundColor: '#fef9ef' }}>
      {/* Split Design - Content Left, Image Right */}
      <div className="relative h-full">
        <div className="container mx-auto px-4 sm:px-6 h-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 h-full items-center py-16 sm:py-20 md:py-0">
            
            {/* Left Content Area */}
            <div className="relative z-20 order-2 md:order-1">
              {/* Badge and Smart Shopping Alert */}
              <div className="space-y-3 mb-6">
                {/* Original Badge */}
                <div className="inline-flex items-center gap-2 animate-fade-in">
                  <span className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg inline-flex items-center gap-2" style={{ backgroundColor: '#f6af0d' }}>
                    <Star className="w-4 h-4 stroke-[1.5]" />
                    {slides[currentSlide].badge}
                  </span>
                  <span className="text-sm font-medium" style={{ color: '#3a3a1d' }}>
                    Kfar Hashalom, Dimona
                  </span>
                </div>
                
                {/* New QR/NFC Badge - Below original badge */}
                <div className="animate-fade-in">
                  <Link href="/info/qr-nfc">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg animate-pulse cursor-pointer hover:animate-none transform hover:scale-105 transition-all" style={{ backgroundColor: '#478c0b' }}>
                      <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{t('Smart Shopping: QR & NFC')}</span>
                      <Wifi className="w-3.5 h-3.5 stroke-[1.5]" />
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Main Title with Highlight */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in" style={{ color: '#3a3a1d' }}>
                {t(slides[currentSlide].title)}<br />
                <span className="relative inline-block">
                  <span style={{ color: '#478c0b' }} className="relative z-10">
                    {t(slides[currentSlide].highlight)}
                  </span>
                  {/* Underline decoration */}
                  <span 
                    className="absolute bottom-0 left-0 w-full h-2 sm:h-3 -z-0 transform -skew-x-12" 
                    style={{ backgroundColor: '#cfe7c1' }}
                  ></span>
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 leading-relaxed animate-fade-in-delay" style={{ color: '#4b5563' }}>
                {t(slides[currentSlide].subtitle)}
              </p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10 animate-fade-in-delay">
                {Object.entries(slides[currentSlide].stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: '#478c0b' }}>
                      {value}
                    </div>
                    <div className="text-xs sm:text-sm capitalize" style={{ color: '#6b7280' }}>
                      {t(key)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* CTA Buttons - Mobile Optimized Touch Targets */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
                <Link href="/marketplace">
                  <button className="w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group" style={{ backgroundColor: '#c23c09' }}>
                    <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                    {t('Explore Marketplace')}
                    <ArrowRight className="w-4 h-4 stroke-[1.5] group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                <Link href="/become-a-vendor">
                  <button className="w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600">
                    <Store className="w-5 h-5 stroke-[1.5]" />
                    {t('Become a Vendor')}
                    <Sparkles className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-8 animate-fade-in-delay-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden" style={{ backgroundColor: '#cfe7c1' }}>
                      <Image
                        src={`/images/hero/${12 + i}.jpg`}
                        alt={i ? `Happy KFAR customer ${i}` : "Image"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 stroke-[1.5] fill-[#f6af0d]" style={{ color: '#f6af0d' }} />
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    <span className="font-semibold" style={{ color: '#3a3a1d' }}>5,000+</span> happy customers
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] order-1 md:order-2">
              {/* Main Image with Creative Shape */}
              <div className="relative h-full">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ${
                      index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    {/* Decorative shapes behind image */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: '#f6af0d', opacity: 0.2 }}></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full" style={{ backgroundColor: '#478c0b', opacity: 0.2 }}></div>
                    
                    {/* Main image container with shape */}
                    <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                      <Image
                        src={slide.image}
                        alt={slide.title || "Image"}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      {/* Subtle gradient overlay for better text readability if needed */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    {/* Floating product cards - Hidden on mobile */}
                    {index === currentSlide && (
                      <>
                        <div className="hidden sm:block absolute -left-10 top-20 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#cfe7c1' }}>
                              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" style={{ color: '#478c0b' }} />
                            </div>
                            <div>
                              <p className="font-semibold text-xs sm:text-sm" style={{ color: '#3a3a1d' }}>100% Vegan</p>
                              <p className="text-xs" style={{ color: '#6b7280' }}>Fresh Daily</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="hidden sm:block absolute -right-10 bottom-20 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(246, 175, 13, 0.2)' }}>
                              <Store className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                            </div>
                            <div>
                              <p className="font-semibold text-xs sm:text-sm" style={{ color: '#3a3a1d' }}>30+ Vendors</p>
                              <p className="text-xs" style={{ color: '#6b7280' }}>Quality verified</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* QR & NFC Feature Card */}
                        <Link href="/info/qr-nfc">
                          <div className="hidden md:block absolute right-1/2 top-10 bg-white rounded-xl shadow-2xl p-4 transform translate-x-1/2 hover:scale-110 transition-all duration-300 cursor-pointer border-2" style={{ borderColor: '#478c0b' }}>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <QrCode className="w-6 h-6 stroke-[1.5]" style={{ color: '#478c0b' }} />
                                <div className="w-0.5 h-8 bg-gray-300"></div>
                                <Wifi className="w-6 h-6 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                              </div>
                              <p className="font-bold text-sm" style={{ color: '#3a3a1d' }}>Smart Shopping</p>
                              <p className="text-xs" style={{ color: '#478c0b' }}>QR & NFC Enabled</p>
                              <div className="mt-2 text-xs font-semibold text-white px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#c23c09' }}>
                                Click to Learn
                              </div>
                            </div>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Slide Navigation - Mobile Optimized Touch Targets */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-12 h-3 sm:h-3 min-h-[12px] rounded-full' 
                        : 'w-8 h-8 sm:w-3 sm:h-3 rounded-full opacity-50 hover:opacity-75'
                    }`}
                    style={{ 
                      backgroundColor: index === currentSlide ? '#478c0b' : '#6b7280',
                      // On mobile, ensure minimum touch target for inactive dots
                      minWidth: index !== currentSlide ? '44px' : undefined,
                      minHeight: index !== currentSlide ? '44px' : undefined
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    {/* Add invisible touch target for mobile */}
                    {index !== currentSlide && (
                      <span className="block sm:hidden w-2 h-2 bg-current rounded-full mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(71, 140, 11, 0.1) 35px, rgba(71, 140, 11, 0.1) 70px)`
        }} />
      </div>
    </section>
  );
};

export default HeroSection;