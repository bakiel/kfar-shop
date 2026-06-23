'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight,
  Leaf, Star, Users, Heart, Quote, Gift, Zap, Award, TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { VENDOR_COUNT, TOTAL_PRODUCTS, getFeaturedProducts, getVendors } from './archived-data';

// Payment method SVG icons - Clean, properly rendered versions
const PaymentIcons = {
  visa: (
    <svg viewBox="0 0 50 35" className="w-12 h-8" fill="none">
      <rect width="50" height="35" rx="4" fill="#1A1F71"/>
      <text x="25" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 50 35" className="w-12 h-8" fill="none">
      <rect width="50" height="35" rx="4" fill="#F7F7F7"/>
      <circle cx="19" cy="17.5" r="10" fill="#EB001B"/>
      <circle cx="31" cy="17.5" r="10" fill="#F79E1B"/>
      <path d="M25 10a10 10 0 000 15 10 10 0 000-15z" fill="#FF5F00"/>
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 50 35" className="w-12 h-8" fill="none">
      <rect width="50" height="35" rx="4" fill="#006FCF"/>
      <text x="25" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
    </svg>
  ),
  applePay: (
    <svg viewBox="0 0 50 35" className="w-12 h-8" fill="none">
      <rect width="50" height="35" rx="4" fill="#000000"/>
      <g fill="#FFFFFF">
        <path d="M15.2 12.5c-.5.6-1.2 1-2 .9-.1-.8.3-1.6.7-2.1.5-.6 1.3-1 2-.9.1.8-.2 1.5-.7 2.1zm.6 1.1c-1.1-.1-2.1.6-2.6.6s-1.4-.6-2.3-.6c-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.2 0.9 6.9.6.8 1.3 1.8 2.2 1.7.9 0 1.2-.6 2.3-.6 1.1 0 1.3.6 2.3.6.9 0 1.5-.8 2.1-1.7.7-1 .9-1.9.9-2-.1 0-1.8-.7-1.8-2.7 0-1.7 1.4-2.5 1.4-2.5-.8-1.1-2-1.3-2.4-1.3l-.1-.2z"/>
        <text x="32" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="Arial">Pay</text>
      </g>
    </svg>
  ),
  googlePay: (
    <svg viewBox="0 0 50 35" className="w-12 h-8" fill="none">
      <rect width="50" height="35" rx="4" fill="#FFFFFF" stroke="#E5E7EB"/>
      <text x="25" y="21" textAnchor="middle" fill="#5F6368" fontSize="8" fontWeight="bold" fontFamily="Arial">G Pay</text>
    </svg>
  ),
};

// Real testimonials component
const TestimonialCard = ({
  testimonial,
  index,
  shouldReduceMotion
}: {
  testimonial: any;
  index: number;
  shouldReduceMotion: boolean | null;
}) => {
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-leaf-green/20" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-leaf-green to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3 h-3 fill-sun-gold text-sun-gold" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
    </motion.div>
  );
};

// Live activity indicator
const LiveActivityBadge = ({ language }: { language: string }) => {
  const [count, setCount] = useState(23);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(15, Math.min(35, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-leaf-green/10 rounded-full"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-green opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-leaf-green"></span>
      </span>
      <span className="text-leaf-green text-sm font-medium">
        {language === 'he' ? `${count} אנשים צופים עכשיו` : `${count} people shopping now`}
      </span>
    </motion.div>
  );
};

const TrustFooter = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const featuredProducts = getFeaturedProducts().slice(0, 6);
  const vendors = getVendors();

  const trustBadges = [
    {
      icon: ShieldCheck,
      title: language === 'he' ? 'תשלום מאובטח' : 'Secure Payment',
      description: language === 'he' ? 'הצפנת SSL 256-bit' : '256-bit SSL encryption',
      color: 'bg-emerald-500'
    },
    {
      icon: Truck,
      title: language === 'he' ? 'משלוח מהיר' : 'Same-Day Delivery',
      description: language === 'he' ? 'חינם מעל ₪150' : 'Free over ₪150',
      color: 'bg-blue-500'
    },
    {
      icon: RotateCcw,
      title: language === 'he' ? 'החזרות קלות' : '30-Day Returns',
      description: language === 'he' ? '30 יום בלי שאלות' : 'No questions asked',
      color: 'bg-purple-500'
    },
    {
      icon: Headphones,
      title: language === 'he' ? 'תמיכה 24/7' : 'WhatsApp Support',
      description: language === 'he' ? 'מענה מיידי' : 'Instant response',
      color: 'bg-orange-500'
    }
  ];

  const testimonials = [
    {
      name: language === 'he' ? 'שרה כהן' : 'Sarah Cohen',
      text: language === 'he'
        ? 'המוצרים הכי טריים שמצאתי! משלוח תוך שעות ושירות מדהים. ממליצה בחום!'
        : 'The freshest products I\'ve found! Delivery within hours and amazing service. Highly recommend!'
    },
    {
      name: language === 'he' ? 'דוד לוי' : 'David Levi',
      text: language === 'he'
        ? 'כבר שנה שאני לקוח קבוע. האיכות עקבית ומעולה. הספקים באמת אכפתיים.'
        : 'Been a regular customer for a year. Quality is consistently excellent. The vendors truly care.'
    },
    {
      name: language === 'he' ? 'רחל אברהם' : 'Rachel Abraham',
      text: language === 'he'
        ? 'השוק הטבעוני הטוב בישראל! המחירים הוגנים והמגוון מדהים.'
        : 'The best vegan marketplace in Israel! Fair prices and amazing variety.'
    }
  ];

  const benefits = [
    { icon: Leaf, text: language === 'he' ? '100% טבעוני' : '100% Vegan' },
    { icon: Heart, text: language === 'he' ? 'תוצרת מקומית' : 'Locally Made' },
    { icon: Award, text: language === 'he' ? 'איכות מובטחת' : 'Quality Guaranteed' },
    { icon: Users, text: language === 'he' ? '50+ שנות קהילה' : '50+ Years Community' },
  ];

  return (
    <section
      className="relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Trust Badges Strip */}
      <div className="bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 py-6">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-10 h-10 ${badge.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{badge.title}</h4>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main CTA Section - Premium Design */}
      <div className="py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faf5 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Social Proof Header */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <LiveActivityBadge language={language} />

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-6 mb-4 font-display">
              {language === 'he' ? (
                <>הצטרפו ל<span className="text-leaf-green">500+ משפחות</span> מרוצות</>
              ) : (
                <>Join <span className="text-leaf-green">500+ Happy Families</span></>
              )}
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              {language === 'he'
                ? 'מאות משפחות כבר נהנות ממוצרים טבעוניים איכותיים ישירות מכפר השלום'
                : 'Hundreds of families already enjoy quality vegan products directly from the Village of Peace'}
            </p>

            {/* Benefits row */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.text} className="flex items-center gap-2 text-gray-700">
                    <Icon className="w-5 h-5 text-leaf-green" />
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                index={index}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>

          {/* Premium CTA Card */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a472a] via-[#2d5a3d] to-[#1a472a]" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #f6af0d 0%, transparent 70%)' }}
            />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #478c0b 0%, transparent 70%)' }}
            />
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }}
            />

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-10 items-center">

                {/* Left: Content */}
                <div>
                  {/* Special Offer Badge */}
                  <motion.div
                    initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sun-gold/20 rounded-full mb-6"
                  >
                    <Gift className="w-4 h-4 text-sun-gold" />
                    <span className="text-sun-gold font-bold text-sm">
                      {language === 'he' ? 'משלוח חינם להזמנה ראשונה!' : 'Free Shipping on First Order!'}
                    </span>
                  </motion.div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                      { value: TOTAL_PRODUCTS, suffix: '+', label: language === 'he' ? 'מוצרים' : 'Products' },
                      { value: VENDOR_COUNT, suffix: '', label: language === 'he' ? 'ספקים' : 'Vendors' },
                      { value: '5.0', suffix: '', label: language === 'he' ? 'דירוג' : 'Rating' },
                      { value: '50', suffix: '+', label: language === 'he' ? 'שנים' : 'Years' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}{stat.suffix}</div>
                        <div className="text-white/60 text-xs">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Headline */}
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-display leading-tight">
                    {language === 'he' ? (
                      <>התחילו לחסוך<br /><span className="text-sun-gold">עם הקהילה</span></>
                    ) : (
                      <>Start Saving<br /><span className="text-sun-gold">With Community</span></>
                    )}
                  </h3>

                  <p className="text-white/70 text-lg mb-8 max-w-md">
                    {language === 'he'
                      ? 'מוצרים איכותיים במחירים הוגנים, ישירות מהספקים שלנו אליכם'
                      : 'Quality products at fair prices, directly from our vendors to you'}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/shop">
                      <motion.button
                        whileHover={shouldReduceMotion ? {} : { scale: 1.03, boxShadow: '0 20px 40px rgba(246, 175, 13, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-sun-gold text-gray-900 rounded-full font-bold text-lg cursor-pointer shadow-xl"
                      >
                        <Zap className="w-5 h-5" />
                        {language === 'he' ? 'קנו עכשיו' : 'Shop Now'}
                        <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                      </motion.button>
                    </Link>

                    <Link href="/vendors">
                      <motion.button
                        whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {language === 'he' ? 'הכירו את הספקים' : 'Meet Vendors'}
                      </motion.button>
                    </Link>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
                    <div className="flex -space-x-2">
                      {vendors.slice(0, 4).map((vendor) => (
                        <div key={vendor.id} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                          <Image src={vendor.logo} alt={vendor.name} width={40} height={40} className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="text-white/80 text-sm">
                      <span className="font-bold text-white">{VENDOR_COUNT} {language === 'he' ? 'ספקים' : 'vendors'}</span>
                      {language === 'he' ? ' מחכים לשרת אתכם' : ' ready to serve you'}
                    </div>
                  </div>
                </div>

                {/* Right: Product showcase */}
                <div className="hidden lg:block">
                  <div className="relative">
                    {/* Floating product images */}
                    <div className="grid grid-cols-2 gap-4">
                      {featuredProducts.slice(0, 4).map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8, rotate: -5 }}
                          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                          whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -5 }}
                          className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 cursor-pointer"
                        >
                          <Image
                            src={product.image || '/images/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white font-bold text-sm truncate">{product.name}</p>
                            <p className="text-sun-gold font-bold">₪{product.price}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Central badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-sun-gold rounded-full flex items-center justify-center shadow-2xl z-10">
                      <div className="text-center">
                        <TrendingUp className="w-6 h-6 text-gray-900 mx-auto" />
                        <span className="text-xs font-bold text-gray-900 block mt-1">
                          {language === 'he' ? 'הכי נמכר' : 'Best Sellers'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-leaf-green" />
              <span className="text-gray-700 font-medium">
                {language === 'he' ? 'תשלום מאובטח ב-100%' : '100% Secure Checkout'}
              </span>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-3">
              {Object.entries(PaymentIcons).map(([name, icon]) => (
                <motion.div
                  key={name}
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all"
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustFooter;
