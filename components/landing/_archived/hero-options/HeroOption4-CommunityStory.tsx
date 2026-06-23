'use client';

/**
 * HERO OPTION 4: COMMUNITY STORY
 *
 * Design Direction:
 * - People-focused with warm, inviting imagery
 * - Storytelling approach - heritage and community values
 * - Testimonials and social proof prominent
 * - Warm earth tones and organic shapes
 * - Emotional connection through faces and stories
 *
 * Best for: Building trust, emotional connection, community values
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Heart, Quote, Users, MapPin, Calendar,
  Star, Leaf, ShoppingBag, Play, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getVendors, TOTAL_PRODUCTS, VENDOR_COUNT } from '../archived-data';

const testimonials = [
  {
    id: 1,
    quote: {
      en: "The quality and freshness remind me of home. This community truly cares about what they create.",
      he: "האיכות והטריות מזכירים לי בית. הקהילה הזו באמת אכפת לה ממה שהיא יוצרת."
    },
    author: "Sarah M.",
    role: { en: "Customer since 2020", he: "לקוחה מאז 2020" },
    avatar: "/images/avatars/customer1.jpg"
  },
  {
    id: 2,
    quote: {
      en: "More than a marketplace - it's a connection to tradition and values that matter.",
      he: "יותר משוק - זה חיבור למסורת ולערכים שחשובים."
    },
    author: "David K.",
    role: { en: "Weekly shopper", he: "קונה שבועי" },
    avatar: "/images/avatars/customer2.jpg"
  },
  {
    id: 3,
    quote: {
      en: "Every product tells a story. You can taste the love and dedication in everything.",
      he: "כל מוצר מספר סיפור. אפשר לטעום את האהבה והמסירות בכל דבר."
    },
    author: "Rachel T.",
    role: { en: "Family of 6", he: "משפחה של 6" },
    avatar: "/images/avatars/customer3.jpg"
  }
];

const communityImages = [
  '/images/hero/13.jpg',
  '/images/hero/14.jpg',
  '/images/hero/15.jpg',
];

const HeroOption4CommunityStory = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const vendors = getVendors();

  useEffect(() => {
    setIsLoaded(true);

    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, #FDF8F3 0%, #F5EDE4 50%, #EDE5DB 100%)' }}
    >
      {/* Decorative Organic Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(71, 140, 11, 0.3) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)'
          }}
        />
        <div className="absolute bottom-0 left-0 w-80 h-80 opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(246, 175, 13, 0.3) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col justify-center py-16">

          {/* Top Badge */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-earth-flame" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {language === 'he' ? 'כפר השלום, דימונה • 50+ שנות מסורת' : 'Village of Peace, Dimona • 50+ Years of Tradition'}
              </span>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Story Content */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -40 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {language === 'he' ? (
                  <>
                    מהקהילה,
                    <br />
                    <span className="text-leaf-green">למשפחה שלכם</span>
                  </>
                ) : (
                  <>
                    From Our Community,
                    <br />
                    <span className="text-leaf-green">To Your Family</span>
                  </>
                )}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                {language === 'he'
                  ? 'יותר מחמישים שנה אנחנו מגדלים, יוצרים ומכינים מוצרים טבעוניים באהבה. כל מוצר מספר סיפור של מסורת, איכות וקהילה.'
                  : 'For over fifty years, we\'ve been growing, creating, and preparing vegan products with love. Every product tells a story of tradition, quality, and community.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link href="/shop">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-8 py-4 bg-leaf-green text-white rounded-full font-medium text-lg flex items-center gap-3 cursor-pointer shadow-lg shadow-leaf-green/20"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {language === 'he' ? 'גלו את המוצרים' : 'Explore Products'}
                    <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  className="flex items-center gap-3 text-gray-600 hover:text-leaf-green transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-leaf-green transition-colors">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <span className="font-medium">
                    {language === 'he' ? 'הסיפור שלנו' : 'Our Story'}
                  </span>
                </motion.button>
              </div>

              {/* Community Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
                {[
                  { icon: Users, value: '500+', label: language === 'he' ? 'משפחות' : 'Families' },
                  { icon: Calendar, value: '50+', label: language === 'he' ? 'שנים' : 'Years' },
                  { icon: Heart, value: `${VENDOR_COUNT}`, label: language === 'he' ? 'יוצרים' : 'Makers' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                    animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-center"
                  >
                    <stat.icon className="w-6 h-6 mx-auto text-sun-gold mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Visual Collage */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 40 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Image Collage */}
              <div className="relative h-[500px] lg:h-[600px]">
                {/* Main Large Image */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  className="absolute top-0 right-0 w-3/4 h-3/4 rounded-3xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src={communityImages[0]}
                    alt="Community"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </motion.div>

                {/* Smaller Image */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-xl border-4 border-white"
                >
                  <Image
                    src={communityImages[1]}
                    alt="Products"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Floating Badge */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
                  animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute top-1/2 left-1/4 transform -translate-y-1/2 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-leaf-green/10 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-leaf-green" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{TOTAL_PRODUCTS}+</div>
                      <div className="text-sm text-gray-500">
                        {language === 'he' ? 'מוצרים טבעוניים' : 'Vegan Products'}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Vendor Logos Badge */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3"
                >
                  <div className="flex -space-x-2">
                    {vendors.slice(0, 4).map((vendor) => (
                      <div
                        key={vendor.id}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                      >
                        <Image src={vendor.logo} alt={vendor.name} width={32} height={32} className="object-cover" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-sun-gold/20 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-bold text-sun-gold">+{VENDOR_COUNT - 4}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Testimonials Section */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Quote className="w-8 h-8 text-sun-gold" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {language === 'he' ? 'מה הלקוחות אומרים' : 'What Our Customers Say'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col md:flex-row items-start gap-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-leaf-green to-sun-gold flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {testimonials[activeTestimonial].author[0]}
                  </div>

                  <div className="flex-1">
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
                      "{language === 'he' ? testimonials[activeTestimonial].quote.he : testimonials[activeTestimonial].quote.en}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonials[activeTestimonial].author}</p>
                      <p className="text-sm text-gray-500">
                        {language === 'he' ? testimonials[activeTestimonial].role.he : testimonials[activeTestimonial].role.en}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-sun-gold text-sun-gold" />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      index === activeTestimonial ? 'w-8 bg-leaf-green' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroOption4CommunityStory;
