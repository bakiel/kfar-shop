'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Star, CheckCircle, Clock, LayoutGrid, ChevronDown, ArrowRight, Store, Info, Shield, Users, Leaf, UtensilsCrossed, Sprout, Crown, Sun, IceCreamCone, ShoppingBasket, Gift, Sandwich, GlassWater, Home, Wrench, Zap, Hammer, PaintBucket, Brush, TreePine, Sparkles, Scissors, Heart, Dumbbell, HandHeart, Briefcase, Calculator, Scale, Laptop, Languages, GraduationCap, type LucideIcon } from 'lucide-react';

const faToLucide: Record<string, LucideIcon> = {
  'fa-utensils': UtensilsCrossed,
  'fa-seedling': Sprout,
  'fa-crown': Crown,
  'fa-sun': Sun,
  'fa-ice-cream': IceCreamCone,
  'fa-shopping-basket': ShoppingBasket,
  'fa-gift': Gift,
  'fa-bread-slice': Sandwich,
  'fa-blender': GlassWater,
  'fa-home': Home,
  'fa-wrench': Wrench,
  'fa-bolt': Zap,
  'fa-hammer': Hammer,
  'fa-paint-roller': PaintBucket,
  'fa-broom': Brush,
  'fa-tree': TreePine,
  'fa-spa': Sparkles,
  'fa-cut': Scissors,
  'fa-heart': Heart,
  'fa-dumbbell': Dumbbell,
  'fa-hand-holding-heart': HandHeart,
  'fa-leaf': Leaf,
  'fa-briefcase': Briefcase,
  'fa-calculator': Calculator,
  'fa-balance-scale': Scale,
  'fa-laptop': Laptop,
  'fa-language': Languages,
  'fa-graduation-cap': GraduationCap,
};

const FaIcon = ({ icon, className, style }: { icon: string; className?: string; style?: React.CSSProperties }) => {
  const LucideComp = faToLucide[icon];
  if (LucideComp) return <LucideComp className={className || 'w-5 h-5 stroke-[1.5]'} style={style} />;
  return null;
};

interface Service {
  name: string;
  status: 'active' | 'coming-soon';
  icon: string;
  description?: string;
  link?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  accentColor: string;
  services: Service[];
}

const CommunityServices = () => {
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('food');
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const serviceCategories: ServiceCategory[] = [
    {
      id: 'food',
      name: 'Food & Dining',
      icon: 'fa-utensils',
      color: 'leaf-green',
      gradient: 'from-leaf-green via-leaf-green-dark to-leaf-green',
      accentColor: 'bg-leaf-green',
      services: [
        { name: 'Teva Deli', status: 'active', icon: 'fa-seedling', description: 'Vegan food manufacturing since 1983', link: '/store/teva-deli' },
        { name: 'Queens Cuisine', status: 'active', icon: 'fa-crown', description: 'Vegan food art & catering', link: '/store/queens-cuisine' },
        { name: 'Garden of Light Vegan Deli', status: 'active', icon: 'fa-sun', description: 'Premium vegan deli specialties', link: '/store/garden-of-light' },
        { name: 'Gahn Delight', status: 'active', icon: 'fa-ice-cream', description: 'Artisanal desserts', link: '/store/gahn-delight' },
        { name: 'People Store', status: 'active', icon: 'fa-shopping-basket', description: 'Community retail', link: '/store/people-store' },
        { name: 'VOP Shop', status: 'active', icon: 'fa-gift', description: 'Village marketplace hub', link: '/store/vop-shop' },
        { name: 'Community Bakery', status: 'coming-soon', icon: 'fa-bread-slice', description: 'Fresh baked goods' },
        { name: 'Juice Bar', status: 'coming-soon', icon: 'fa-blender', description: 'Fresh pressed juices' }
      ]
    },
    {
      id: 'home',
      name: 'Home Services',
      icon: 'fa-home',
      color: 'sun-gold',
      gradient: 'from-sun-gold via-sun-gold-dark to-sun-gold',
      accentColor: 'bg-sun-gold',
      services: [
        { name: 'Plumbing', status: 'coming-soon', icon: 'fa-wrench', description: '24/7 emergency service' },
        { name: 'Electrical', status: 'coming-soon', icon: 'fa-bolt', description: 'Licensed electricians' },
        { name: 'Carpentry', status: 'coming-soon', icon: 'fa-hammer', description: 'Custom woodwork' },
        { name: 'Painting', status: 'coming-soon', icon: 'fa-paint-roller', description: 'Interior & exterior' },
        { name: 'Cleaning', status: 'coming-soon', icon: 'fa-broom', description: 'Eco-friendly service' },
        { name: 'Landscaping', status: 'coming-soon', icon: 'fa-tree', description: 'Garden maintenance' }
      ]
    },
    {
      id: 'personal',
      name: 'Personal Care',
      icon: 'fa-spa',
      color: 'earth-flame',
      gradient: 'from-earth-flame via-earth-flame-dark to-earth-flame',
      accentColor: 'bg-earth-flame',
      services: [
        { name: 'Hair Salon', status: 'coming-soon', icon: 'fa-cut', description: 'Natural hair care' },
        { name: 'Wellness Center', status: 'coming-soon', icon: 'fa-heart', description: 'Holistic health' },
        { name: 'Fitness Studio', status: 'coming-soon', icon: 'fa-dumbbell', description: 'Group classes' },
        { name: 'Massage Therapy', status: 'coming-soon', icon: 'fa-hand-holding-heart', description: 'Therapeutic massage' },
        { name: 'Natural Medicine', status: 'coming-soon', icon: 'fa-leaf', description: 'Alternative healing' }
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: 'fa-briefcase',
      color: 'soil-brown',
      gradient: 'from-soil-brown via-soil-brown to-gray-700',
      accentColor: 'bg-soil-brown',
      services: [
        { name: 'Accounting', status: 'coming-soon', icon: 'fa-calculator', description: 'Tax & bookkeeping' },
        { name: 'Legal Services', status: 'coming-soon', icon: 'fa-balance-scale', description: 'Legal consultation' },
        { name: 'IT Support', status: 'coming-soon', icon: 'fa-laptop', description: 'Tech assistance' },
        { name: 'Translation', status: 'coming-soon', icon: 'fa-language', description: 'Multi-language' },
        { name: 'Education', status: 'coming-soon', icon: 'fa-graduation-cap', description: 'Tutoring services' }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const activeServicesCount = serviceCategories.reduce((acc, cat) => 
    acc + cat.services.filter(s => s.status === 'active').length, 0
  );

  const totalServicesCount = serviceCategories.reduce((acc, cat) => 
    acc + cat.services.length, 0
  );

  return (
    <section id="community-services" className="py-24 relative overflow-hidden">
      {/* Beautiful Background with Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/backgrounds/1.jpg')`,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Multi-layer Overlay for Perfect Blend */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-cream-base/90 to-white/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-leaf-green/5 via-transparent to-sun-gold/5" />
        
        {/* Animated Accent Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-2xl animate-pulse" style={{ 
          background: 'radial-gradient(circle, rgba(71, 140, 11, 0.1) 0%, transparent 70%)',
          animationDuration: '8s' 
        }} />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-2xl animate-pulse" style={{ 
          background: 'radial-gradient(circle, rgba(246, 175, 13, 0.1) 0%, transparent 70%)',
          animationDuration: '10s',
          animationDelay: '3s'
        }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full blur-xl animate-pulse" style={{ 
          background: 'radial-gradient(circle, rgba(194, 60, 9, 0.08) 0%, transparent 70%)',
          animationDuration: '12s',
          animationDelay: '6s'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className={`text-center mb-16 transition-all duration-1000 relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border text-leaf-green border-leaf-green/20"
          style={{
            background: 'linear-gradient(to right, rgba(71, 140, 11, 0.1), rgba(246, 175, 13, 0.1))'
          }}>
            <Star className="w-4 h-4 stroke-[1.5] text-sun-gold" />
            <span>{activeServicesCount} {t('Active Businesses')}</span>
          </div>
          
          <h2 className="text-4xl xs:text-5xl md:text-6xl font-bold mb-8 relative font-['Poppins'] text-soil-brown">
            {t('Community Services Hub')}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1.5 rounded-full shadow-sm"
            style={{ background: 'linear-gradient(to right, #478c0b, #f6af0d, #c23c09)' }} />
          </h2>

          <p className="text-xl max-w-3xl mx-auto leading-relaxed text-soil-brown">
            {t('Your gateway to authentic Village of Peace services. From our pioneering vegan food businesses to essential community services, everything you need in one place.')}
          </p>
          
          {/* Stats Bar - Enhanced with Colors */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 xs:p-8 max-w-3xl mx-auto mt-10 border-2 border-sun-gold">
            <div className="grid grid-cols-3 gap-4 xs:gap-8">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 xs:w-20 xs:h-20 rounded-2xl mb-3 xs:mb-4 shadow-lg group-hover:shadow-xl transition-shadow bg-leaf-green">
                  <CheckCircle className="w-6 h-6 xs:w-8 xs:h-8 stroke-[1.5] text-white" />
                </div>
                <div className="text-3xl xs:text-5xl font-bold mb-2 text-leaf-green">{activeServicesCount}</div>
                <div className="text-xs sm:text-sm font-bold mb-1 text-soil-brown">{t('Active')}</div>
                <div className="text-xs font-semibold hidden xs:block text-leaf-green">{t('Currently operating')}</div>
              </div>

              <div className="text-center group hover:scale-105 transition-transform duration-300 border-x-2 border-sun-gold">
                <div className="inline-flex items-center justify-center w-14 h-14 xs:w-20 xs:h-20 rounded-2xl mb-3 xs:mb-4 shadow-lg group-hover:shadow-xl transition-shadow bg-sun-gold">
                  <Clock className="w-6 h-6 xs:w-8 xs:h-8 stroke-[1.5] text-white" />
                </div>
                <div className="text-3xl xs:text-5xl font-bold mb-2 text-sun-gold">{totalServicesCount - activeServicesCount}</div>
                <div className="text-xs sm:text-sm font-bold mb-1 text-soil-brown">{t('Coming')}</div>
                <div className="text-xs font-semibold hidden xs:block text-sun-gold">{t('Launching shortly')}</div>
              </div>

              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 xs:w-20 xs:h-20 rounded-2xl mb-3 xs:mb-4 shadow-lg group-hover:shadow-xl transition-shadow bg-earth-flame">
                  <LayoutGrid className="w-6 h-6 xs:w-8 xs:h-8 stroke-[1.5] text-white" />
                </div>
                <div className="text-3xl xs:text-5xl font-bold mb-2 text-earth-flame">{totalServicesCount}</div>
                <div className="text-xs sm:text-sm font-bold mb-1 text-soil-brown">{t('Total')}</div>
                <div className="text-xs font-semibold hidden xs:block text-earth-flame">{t('Growing daily')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Categories - Enhanced Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {serviceCategories.map((category, index) => (
            <div
              key={category.id}
              className={`group relative transform transition-all duration-700 ${
                expandedCategory === category.id ? 'md:col-span-2' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                transitionDelay: `${index * 150}ms`
              }}
            >
              {/* Card Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${category.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`} />
              
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 group-hover:border-transparent transition-all duration-500 group-hover:shadow-2xl">
                {/* Category Header - Enhanced */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full p-4 md:p-6 flex items-center justify-between text-left relative overflow-hidden transition-all duration-500`}
                  style={{
                    background: expandedCategory === category.id 
                      ? category.id === 'food' ? 'linear-gradient(135deg, #478c0b, #3a7209)' :
                        category.id === 'home' ? 'linear-gradient(135deg, #f6af0d, #e09b00)' :
                        category.id === 'personal' ? 'linear-gradient(135deg, #c23c09, #a82f07)' :
                        'linear-gradient(135deg, #3a3a1d, #2a2a15)'
                      : category.id === 'food' ? 'linear-gradient(135deg, #478c0b15, #478c0b05)' :
                        category.id === 'home' ? 'linear-gradient(135deg, #f6af0d15, #f6af0d05)' :
                        category.id === 'personal' ? 'linear-gradient(135deg, #c23c0915, #c23c0905)' :
                        'linear-gradient(135deg, #3a3a1d15, #3a3a1d05)'
                  }}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${
                      expandedCategory === category.id 
                        ? 'bg-white/20 text-white' 
                        : `bg-white border-2`
                    }`}
                    style={{
                      borderColor: expandedCategory !== category.id ? 
                        (category.id === 'food' ? '#478c0b20' :
                         category.id === 'home' ? '#f6af0d20' :
                         category.id === 'personal' ? '#c23c0920' :
                         '#3a3a1d20') : 'transparent'
                    }}>
                      <FaIcon icon={category.icon} className="w-8 h-8 stroke-[1.5]"
                         style={{
                           color: expandedCategory === category.id ? 'white' :
                             (category.id === 'food' ? '#478c0b' :
                              category.id === 'home' ? '#f6af0d' :
                              category.id === 'personal' ? '#c23c09' :
                              '#3a3a1d')
                         }} />
                    </div>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold transition-colors duration-500 break-words ${
                        expandedCategory === category.id ? 'text-white' : 'text-soil-brown'
                      }`}>
                        {t(category.name)}
                      </h3>
                      <p className={`text-sm transition-colors duration-500 ${
                        expandedCategory === category.id ? 'text-white/90' : 'text-gray-500'
                      }`}>
                        {category.services.filter(s => s.status === 'active').length} active • {' '}
                        {category.services.filter(s => s.status === 'coming-soon').length} coming soon
                      </p>
                    </div>
                  </div>
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`
                    }} />
                    {/* Floating Icons */}
                    <div className="absolute top-4 right-8 opacity-20">
                      <FaIcon icon={category.icon} className="w-16 h-16 stroke-[1.5] text-white rotate-12" />
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-3">
                    {/* Service Count Pills */}
                    <div className="flex gap-2">
                      {category.services.filter(s => s.status === 'active').length > 0 && (
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 border ${
                          expandedCategory === category.id
                            ? 'bg-white/20 text-white border-transparent'
                            : 'bg-leaf-green/10 text-leaf-green border-leaf-green/20'
                        }`}>
                          {category.services.filter(s => s.status === 'active').length} {t('Active')}
                        </div>
                      )}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      expandedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <ChevronDown className={`w-5 h-5 stroke-[1.5] transition-transform duration-500 ${
                        expandedCategory === category.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </button>

                {/* Services Grid - Enhanced */}
                <div className={`transition-all duration-500 ${
                  expandedCategory === category.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}>
                  <div className="p-6 bg-gradient-to-b from-gray-50/50 to-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.services.map((service, index) => (
                        <div
                          key={index}
                          onMouseEnter={() => setHoveredService(`${category.id}-${index}`)}
                          onMouseLeave={() => setHoveredService(null)}
                          className={`relative group/service transition-all duration-300 ${
                            service.status === 'active' ? 'cursor-pointer' : ''
                          }`}
                        >
                          <div className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                            service.status === 'active' 
                              ? 'bg-white border-transparent hover:shadow-lg hover:-translate-y-1' 
                              : 'bg-gray-50 border-gray-200 opacity-70'
                          }`}
                          style={{
                            borderColor: service.status === 'active' && hoveredService === `${category.id}-${index}` 
                              ? `var(--${category.color})` 
                              : 'transparent'
                          }}>
                            {/* Service Icon */}
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                service.status === 'active' 
                                  ? `bg-gradient-to-br from-white to-gray-50 border-2 shadow-sm` 
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                              style={{
                                borderColor: service.status === 'active' ? 
                                  (category.id === 'food' ? '#478c0b' :
                                   category.id === 'home' ? '#f6af0d' :
                                   category.id === 'personal' ? '#c23c09' :
                                   '#3a3a1d') : 'transparent'
                              }}>
                                <FaIcon icon={service.icon} className="w-5 h-5 stroke-[1.5]"
                                   style={{
                                     color: service.status === 'active' ?
                                       (category.id === 'food' ? '#478c0b' :
                                        category.id === 'home' ? '#f6af0d' :
                                        category.id === 'personal' ? '#c23c09' :
                                        '#3a3a1d') : 'inherit'
                                   }} />
                              </div>
                              
                              <div className="flex-1">
                                <h4 className={`font-semibold mb-1 transition-colors duration-300 break-words line-clamp-2 ${
                                  service.status === 'active' ? 'text-soil-brown' : 'text-gray-500'
                                }`}>
                                  {service.name}
                                </h4>
                                {service.description && (
                                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              
                              {service.status === 'active' ? (
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover/service:opacity-100"
                                       style={{ 
                                         backgroundColor: category.id === 'food' ? '#478c0b' :
                                                        category.id === 'home' ? '#f6af0d' :
                                                        category.id === 'personal' ? '#c23c09' :
                                                        '#3a3a1d'
                                       }}>
                                    <ArrowRight className="w-3 h-3 stroke-[1.5] text-white" />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs border border-sun-gold/20 px-2 py-1 rounded-full font-medium bg-sun-gold/10 text-sun-gold">
                                  {t('Soon')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section - Floaty Panel Design */}
        <div className="mt-16 flex justify-center">
          <div className="group relative transform transition-all duration-500 hover:scale-102">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sun-gold via-leaf-green to-earth-flame rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
            
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100 group-hover:border-transparent transition-all duration-500 group-hover:shadow-3xl max-w-xl">
              {/* Header */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3 text-soil-brown">
                    <Store className="w-7 h-7 stroke-[1.5] text-leaf-green" />
                    {t('Join Our Shop')}
                  </h3>
                  <p className="text-lg text-gray-600">{t('Grow your business with us')}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    {t('Service providers and new businesses welcome! Connect with thousands of customers seeking quality services.')}
                  </p>
                  
                  {/* Buttons */}
                  <div className="flex flex-col gap-4 mb-8">
                  <Link href="/vendor/onboarding" className="w-full">
                    <button className="w-full py-3 px-4 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap bg-earth-flame">
                      <Store className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] flex-shrink-0" />
                      {t('Join as Vendor')}
                      <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </Link>
                  
                  <button className="w-full py-3 px-4 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap bg-sun-gold">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] flex-shrink-0" />
                    {t('Learn More')}
                  </button>
                  </div>
                </div>
                
                {/* Trust Icons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center px-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-leaf-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-5 h-5 stroke-[1.5] text-leaf-green" />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 font-medium break-words leading-tight">{t('Trusted Platform')}</div>
                  </div>
                  
                  <div className="text-center px-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sun-gold/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 stroke-[1.5] text-sun-gold" />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 font-medium break-words leading-tight">{t('5000+ Customers')}</div>
                  </div>
                  
                  <div className="text-center px-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-earth-flame/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Leaf className="w-5 h-5 stroke-[1.5] text-earth-flame" />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 font-medium break-words leading-tight">{t('100% Vegan')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityServices;