'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Stat {
  number: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  background: string;
}

const StatsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const primaryStats: Stat[] = [
    {
      number: '50+',
      label: 'Years in Business',
      sublabel: 'Established 1973',
      icon: 'fa-store',
      color: '#478c0b',
      background: 'linear-gradient(135deg, #478c0b, #3a7209)'
    },
    {
      number: '3,000+',
      label: 'Happy Customers',
      sublabel: 'Growing Daily',
      icon: 'fa-users',
      color: '#f6af0d',
      background: 'linear-gradient(135deg, #f6af0d, #e09b00)'
    },
    {
      number: '100%',
      label: 'Customer Satisfaction',
      sublabel: 'Quality Guaranteed',
      icon: 'fa-star',
      color: '#c23c09',
      background: 'linear-gradient(135deg, #c23c09, #a82f07)'
    },
    {
      number: '24/7',
      label: 'Support Available',
      sublabel: 'Always Here for You',
      icon: 'fa-headset',
      color: '#478c0b',
      background: 'linear-gradient(135deg, #478c0b, #3a7209)'
    }
  ];

  const businessHighlights = [
    { icon: 'fa-truck', value: 'Same Day', label: 'Fast Delivery', business: 'Local Orders Before 2PM' },
    { icon: 'fa-shield-alt', value: '100%', label: 'Secure Payment', business: 'SSL Encrypted Checkout' },
    { icon: 'fa-handshake', value: '30+', label: 'Trusted Vendors', business: 'Quality Verified Partners' },
    { icon: 'fa-mobile-alt', value: 'Voice', label: 'Shopping Available', business: 'Order Hands-Free' }
  ];

  const milestones = [
    { year: '1973', event: 'First Store Opens', detail: 'Community marketplace begins' },
    { year: '1983', event: 'Manufacturing Starts', detail: 'Teva Deli plant-based foods' },
    { year: '2020', event: 'Online Expansion', detail: 'Digital marketplace launches' },
    { year: '2024', event: 'Voice Commerce', detail: 'AI-powered shopping arrives' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-rotate featured stat
  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setCurrentStat((prev) => (prev + 1) % primaryStats.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isVisible, primaryStats.length]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/backgrounds/2.jpg')`,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Multi-layer Overlay for Perfect Blend */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-cream-base/85 to-white/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-leaf-green/5 via-transparent to-sun-gold/5" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(71, 140, 11, 0.1) 10px,
            rgba(71, 140, 11, 0.1) 20px
          )`
        }} />
        
        {/* Animated circles */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-20 animate-pulse" style={{ 
          background: 'radial-gradient(circle, #478c0b 0%, transparent 70%)',
          animationDuration: '6s'
        }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-20 animate-pulse" style={{ 
          background: 'radial-gradient(circle, #f6af0d 0%, transparent 70%)',
          animationDuration: '8s',
          animationDelay: '2s'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <span className="px-3 sm:px-4 py-2 rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg" style={{ backgroundColor: '#c23c09' }}>
              <i className="fas fa-chart-line mr-1 sm:mr-2"></i>
              Impact & Heritage
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6" style={{ color: '#3a3a1d' }}>
            Trusted by Thousands
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#4b5563' }}>
            Your one-stop marketplace for authentic products, fast delivery, 
            and exceptional customer service powered by cutting-edge technology.
          </p>
        </div>

        {/* Primary Stats - Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {primaryStats.map((stat, index) => (
            <div 
              key={index}
              className={`relative group transform transition-all duration-1000 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                {/* Background Gradient on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: stat.background }}
                />
                
                {/* Icon */}
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 md:mb-6 shadow-lg relative z-10 mx-auto"
                  style={{ background: stat.background }}
                >
                  <i className={`fas ${stat.icon} text-lg sm:text-xl md:text-2xl text-white`}></i>
                </div>
                
                {/* Number with Animation */}
                <div 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 relative z-10 transition-colors duration-300 text-center"
                  style={{ color: stat.color }}
                >
                  {stat.number}
                </div>
                
                {/* Labels */}
                <div className="text-sm sm:text-base md:text-lg font-semibold mb-1 relative z-10 text-center" style={{ color: '#3a3a1d' }}>
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className="text-xs sm:text-sm relative z-10 text-center" style={{ color: '#6b7280' }}>
                    {stat.sublabel}
                  </div>
                )}
                
                {/* Decorative Element */}
                <div 
                  className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full opacity-20"
                  style={{ backgroundColor: stat.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Business Highlights - Horizontal Scroll */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center" style={{ color: '#3a3a1d' }}>
            Why Shop With Us
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {businessHighlights.map((highlight, index) => (
              <div 
                key={index}
                className={`text-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl transition-all duration-500 hover:shadow-lg ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{ 
                  transitionDelay: `${(index + 4) * 150}ms`,
                  backgroundColor: 'rgba(207, 231, 193, 0.3)'
                }}
              >
                <i className={`fas ${highlight.icon} text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 md:mb-4`} style={{ color: '#478c0b' }}></i>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#f6af0d' }}>
                  {highlight.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1" style={{ color: '#3a3a1d' }}>
                  {highlight.label}
                </div>
                <div className="text-xs hidden sm:block" style={{ color: '#6b7280' }}>
                  {highlight.business}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline - Mobile Optimized */}
        <div className="relative">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center" style={{ color: '#3a3a1d' }}>
            Our Journey
          </h3>
          
          {/* Timeline Line - Hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full" style={{ backgroundColor: '#e5e7eb' }} />
          
          {/* Mobile Timeline */}
          <div className="md:hidden space-y-4">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-lg p-4 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${(index + 8) * 150}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#f6af0d' }}
                  />
                  <div className="text-xl font-bold" style={{ color: '#c23c09' }}>
                    {milestone.year}
                  </div>
                </div>
                <div className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                  {milestone.event}
                </div>
                <div className="text-sm" style={{ color: '#6b7280' }}>
                  {milestone.detail}
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Timeline */}
          <div className="hidden md:block space-y-8">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${(index + 8) * 150}ms` }}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
                    <div className="text-2xl font-bold mb-1" style={{ color: '#c23c09' }}>
                      {milestone.year}
                    </div>
                    <div className="font-semibold mb-1" style={{ color: '#3a3a1d' }}>
                      {milestone.event}
                    </div>
                    <div className="text-sm" style={{ color: '#6b7280' }}>
                      {milestone.detail}
                    </div>
                  </div>
                </div>
                
                {/* Center Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div 
                    className="w-6 h-6 rounded-full border-4 border-white shadow-lg"
                    style={{ backgroundColor: index === currentStat ? '#f6af0d' : '#478c0b' }}
                  />
                </div>
                
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg mb-6" style={{ color: '#4b5563' }}>
            Experience the future of shopping with voice commerce and same-day delivery
          </p>
          <button className="px-8 py-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: '#478c0b' }}>
            <i className="fas fa-shopping-cart mr-2"></i>
            Start Shopping Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;