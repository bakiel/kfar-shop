'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Leaf, Heart, Globe, BookOpen, GraduationCap, Users, Calendar,
  MapPin, Car, Bus, Plane, Sun, TreePine, Snowflake, Clock,
  Star, ChevronRight, ArrowRight, Mountain, Hammer, Sparkles,
  Music, Hand, Sprout, Check, Building, Utensils, Palette,
  Languages, History, Mic, Image as ImageIcon, ScrollText,
  ChefHat
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const start = 0;
      const increment = value / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ScrollReveal wrapper
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface TimelineItem {
  year: string;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
}

const timeline: TimelineItem[] = [
  { year: '1967', titleEn: 'Community Founded', titleHe: 'הקהילה הוקמה', descEn: 'African Hebrew Israelites arrive in Israel, establishing the foundation for a thriving community.', descHe: 'העברים הישראלים האפריקאים מגיעים לישראל ומקימים את הבסיס לקהילה משגשגת.' },
  { year: '1970s', titleEn: 'Early Settlement', titleHe: 'התיישבות ראשונה', descEn: 'Community establishes roots in Dimona with agricultural projects and early recognition efforts.', descHe: 'הקהילה מכה שורשים בדימונה עם פרויקטים חקלאיים.' },
  { year: '1983', titleEn: 'Teva Deli Founded', titleHe: 'טבע דלי נוסדה', descEn: 'Launch of Israel\'s first vegan food manufacturing company, pioneering plant-based products.', descHe: 'השקת חברת המזון הטבעוני הראשונה בישראל, חלוצת המוצרים מהצומח.' },
  { year: '2003', titleEn: 'Official Recognition', titleHe: 'הכרה רשמית', descEn: 'Israeli government grants permanent residency, recognizing the community\'s place in society.', descHe: 'ממשלת ישראל מעניקה תושבות קבע, מכירה במקומה של הקהילה בחברה.' },
  { year: '2026', titleEn: 'Digital Marketplace', titleHe: 'שוק דיגיטלי', descEn: 'KFAR Marketplace launches, bringing community businesses to the global digital economy.', descHe: 'כפר מרקטפלייס מושק, מביא את העסקים הקהילתיים לכלכלה הדיגיטלית הגלובלית.' }
];

interface ValueItem {
  icon: React.ElementType;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  color: string;
}

const values: ValueItem[] = [
  { icon: Leaf, titleEn: 'Healthy Living', titleHe: 'חיים בריאים', descEn: '100% vegan products, natural ingredients, and quality for well-being.', descHe: 'מוצרים טבעוניים 100%, מרכיבים טבעיים ואיכות לבריאות.', color: '#478c0b' },
  { icon: Heart, titleEn: 'Peace & Harmony', titleHe: 'שלום והרמוניה', descEn: 'Living in peace with all creation, promoting harmony between peoples.', descHe: 'חיים בשלום עם כל הבריאה, קידום הרמוניה בין עמים.', color: '#c23c09' },
  { icon: BookOpen, titleEn: 'Cultural Heritage', titleHe: 'מורשת תרבותית', descEn: 'Preserving traditions and sharing our unique Hebrew African identity.', descHe: 'שימור מסורות ושיתוף הזהות העברית-אפריקאית הייחודית שלנו.', color: '#f6af0d' },
  { icon: Users, titleEn: 'Community Unity', titleHe: 'אחדות קהילתית', descEn: 'Strong family bonds, mutual support, and collective responsibility.', descHe: 'קשרים משפחתיים חזקים, תמיכה הדדית ואחריות משותפת.', color: '#478c0b' },
  { icon: Globe, titleEn: 'Sustainability', titleHe: 'קיימות', descEn: 'Sustainable practices, organic agriculture, and responsible stewardship.', descHe: 'שיטות בנות קיימא, חקלאות אורגנית וניהול אחראי.', color: '#2D5A27' },
  { icon: GraduationCap, titleEn: 'Education', titleHe: 'חינוך', descEn: 'Lifelong learning, cultural education, and sharing knowledge globally.', descHe: 'למידה לכל החיים, חינוך תרבותי ושיתוף ידע ברחבי העולם.', color: '#f6af0d' }
];

export default function AboutPage() {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <Layout>
      <div className="min-h-screen bg-[#fef9ef]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/community/5.jpg"
              alt="Village of Peace Community"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(71,140,11,0.88), rgba(45,90,39,0.85))' }} />
          </div>

          <motion.div
            className="container mx-auto px-4 text-center relative z-10 py-24"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 stroke-[1.5]" />
              {language === 'he' ? '50+ שנות מורשת' : '50+ Years of Heritage'}
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {language === 'he' ? 'גלו את כפר השלום' : 'Discover Village of Peace'}
            </motion.h1>
            <motion.p variants={item} className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10">
              {language === 'he'
                ? 'חוו 50+ שנות מורשת, תרבות וחיי קהילה בלב ישראל'
                : 'Experience 50+ years of heritage, culture, and community life in the heart of Israel'}
            </motion.p>
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#story"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#478c0b] rounded-full font-semibold text-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <BookOpen className="w-5 h-5 stroke-[1.5]" />
                {language === 'he' ? 'הסיפור שלנו' : 'Our Story'}
              </motion.a>
              <motion.a
                href="#values"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all cursor-pointer border border-white/20"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {language === 'he' ? 'הערכים שלנו' : 'Our Values'}
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                {[
                  { value: 3000, suffix: '+', labelEn: 'Community Members', labelHe: 'חברי קהילה', color: '#478c0b' },
                  { value: 50, suffix: '+', labelEn: 'Years of Heritage', labelHe: 'שנות מורשת', color: '#f6af0d' },
                  { value: 100, suffix: '+', labelEn: 'Community Businesses', labelHe: 'עסקים קהילתיים', color: '#c23c09' },
                  { value: 40, suffix: '+', labelEn: 'Countries Reached', labelHe: 'מדינות שהגענו אליהן', color: '#478c0b' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={shouldReduceMotion ? {} : { y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: stat.color }}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-gray-500 text-sm font-medium">{language === 'he' ? stat.labelHe : stat.labelEn}</div>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="story" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-[#478c0b]/10 px-4 py-2 rounded-full text-[#478c0b] text-sm font-semibold mb-4">
                    <BookOpen className="w-4 h-4 stroke-[1.5]" />
                    {language === 'he' ? 'הסיפור שלנו' : 'Our Story'}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-[#3a3a1d] mb-6">
                    {language === 'he' ? 'סיפור הקהילה' : 'The Community Story'}
                  </h2>
                </div>
              </ScrollReveal>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <ScrollReveal>
                  <div className="space-y-6">
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {language === 'he'
                        ? 'כפר השלום (קפר שלום) הוקם ב-1967 כאשר העברים הישראלים האפריקאים, בהובלת בן עמי בן-ישראל, עשו את ההגירה ההיסטורית שלהם מאמריקה לישראל. הקהילה שלנו מייצגת שילוב ייחודי של מורשת אפריקאית, תרבות עברית ויזמות ישראלית מודרנית.'
                        : 'The Village of Peace (Kfar Shalom) was established in 1967 when African Hebrew Israelites, led by Ben Ammi Ben-Israel, made their historic migration from America to Israel. Our community represents a unique blend of African heritage, Hebrew culture, and modern Israeli entrepreneurship.'}
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {language === 'he'
                        ? 'במשך למעלה מ-50 שנה, בנינו קהילה משגשגת המבוססת על עקרונות של בריאות, שלום ועסקים בני קיימא. אורח החיים הטבעוני שלנו, הנוהגים הירוקים ומחויבותנו לאיכות הפכו אותנו לחלוצים במוצרים מהצומח ובמסחר בר קיימא.'
                        : 'For over 50 years, we have built a thriving community based on principles of health, peace, and sustainable business. Our vegan lifestyle, eco-friendly practices, and commitment to quality have made us pioneers in plant-based products and sustainable commerce.'}
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {language === 'he'
                        ? 'כיום, הקהילה שלנו היא ביתם של למעלה מ-3,000 תושבים וממשיכה לקבל בברכה לקוחות מכל העולם שבאים ליהנות מהמוצרים האותנטיים שלנו ולחוות את מודל העסקים הבר-קיימא שלנו.'
                        : 'Today, our community is home to over 3,000 residents and continues to welcome customers from around the world who come to enjoy our authentic products and experience our sustainable business model.'}
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                    <Image
                      src="/images/community/1.jpg"
                      alt="Community Life"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#f6af0d]/10 px-4 py-2 rounded-full text-[#f6af0d] text-sm font-semibold mb-4">
                  <History className="w-4 h-4 stroke-[1.5]" />
                  {language === 'he' ? 'ציר הזמן' : 'Our Timeline'}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#3a3a1d]">
                  {language === 'he' ? 'ציר הזמן הקהילתי' : 'Community Timeline'}
                </h2>
              </div>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto space-y-0">
              {timeline.map((event, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { x: isRTL ? -8 : 8 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex gap-6 pb-10 last:pb-0 group"
                  >
                    {/* Timeline line */}
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[23px] top-14 bottom-0 w-0.5 bg-[#478c0b]/15" style={isRTL ? { right: '23px', left: 'auto' } : {}} />
                    )}

                    {/* Year dot */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-[#478c0b] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-[#478c0b]/20 group-hover:scale-110 transition-transform">
                      {event.year.replace('s', '')}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-6 group-hover:bg-white group-hover:shadow-md transition-all">
                      <h4 className="text-xl font-bold text-[#3a3a1d] mb-2">
                        {language === 'he' ? event.titleHe : event.titleEn}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {language === 'he' ? event.descHe : event.descEn}
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section id="values" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#c23c09]/10 px-4 py-2 rounded-full text-[#c23c09] text-sm font-semibold mb-4">
                  <Heart className="w-4 h-4 stroke-[1.5]" />
                  {language === 'he' ? 'הערכים שלנו' : 'Our Values'}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#3a3a1d] mb-4">
                  {language === 'he' ? 'הערכים המנחים אותנו' : 'Our Core Values'}
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                  {language === 'he'
                    ? 'העקרונות שמנחים את הקהילה שלנו למעלה מ-50 שנה'
                    : 'The principles that have guided our community for over 50 years'}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <ScrollReveal key={i} delay={i * 0.08}>
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 cursor-default group h-full"
                    >
                      <motion.div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${value.color}12` }}
                      >
                        <Icon className="w-7 h-7 stroke-[1.5]" style={{ color: value.color }} />
                      </motion.div>
                      <h3 className="text-xl font-bold text-[#3a3a1d] mb-3">
                        {language === 'he' ? value.titleHe : value.titleEn}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {language === 'he' ? value.descHe : value.descEn}
                      </p>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visitor Information Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#478c0b]/10 px-4 py-2 rounded-full text-[#478c0b] text-sm font-semibold mb-4">
                  <MapPin className="w-4 h-4 stroke-[1.5]" />
                  {language === 'he' ? 'מידע למבקרים' : 'Visitor Info'}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#3a3a1d]">
                  {language === 'he' ? 'בואו לבקר' : 'Come Visit Us'}
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              <ScrollReveal>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-[#478c0b] mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'איך להגיע' : 'Getting Here'}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { icon: MapPin, textEn: 'Village of Peace, Dimona, Israel', textHe: 'כפר השלום, דימונה, ישראל' },
                      { icon: Car, textEn: '1 hour drive from Beer Sheva', textHe: 'שעה נסיעה מבאר שבע' },
                      { icon: Bus, textEn: 'Public transport from Dimona', textHe: 'תחבורה ציבורית מדימונה' },
                      { icon: Plane, textEn: '2 hours from Ben Gurion Airport', textHe: 'שעתיים מנמל התעופה בן גוריון' }
                    ].map((info, i) => {
                      const InfoIcon = info.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <InfoIcon className="w-5 h-5 stroke-[1.5] text-[#478c0b] shrink-0" />
                          <span className="text-gray-600">{language === 'he' ? info.textHe : info.textEn}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-[#f6af0d] mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'הזמן הטוב לבקר' : 'Best Time to Visit'}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { icon: Sun, textEn: 'Spring (Mar-May): Perfect weather', textHe: 'אביב (מרץ-מאי): מזג אוויר מושלם', color: '#f6af0d' },
                      { icon: TreePine, textEn: 'Fall (Sep-Nov): Harvest season', textHe: 'סתיו (ספט-נוב): עונת הקציר', color: '#478c0b' },
                      { icon: Snowflake, textEn: 'Winter (Dec-Feb): Mild climate', textHe: 'חורף (דצמ-פבר): אקלים נוח', color: '#3b82f6' },
                      { icon: Star, textEn: 'Holidays: Special celebrations', textHe: 'חגים: חגיגות מיוחדות', color: '#8b5cf6' }
                    ].map((info, i) => {
                      const InfoIcon = info.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <InfoIcon className="w-5 h-5 stroke-[1.5] shrink-0" style={{ color: info.color }} />
                          <span className="text-gray-600">{language === 'he' ? info.textHe : info.textEn}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div
                className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #478c0b, #2D5A27)' }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#f6af0d]/10 blur-2xl" />

                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {language === 'he' ? 'מוכנים לחוות את כפר השלום?' : 'Ready to Experience Village of Peace?'}
                  </h2>
                  <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                    {language === 'he'
                      ? 'גלו מוצרים ייחודיים, תרבות עשירה וקהילה חמה'
                      : 'Discover unique products, rich culture, and a welcoming community'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/shop">
                      <motion.span
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#478c0b] rounded-full font-semibold text-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        {language === 'he' ? 'גלו את החנות' : 'Explore the Shop'}
                        <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                      </motion.span>
                    </Link>
                    <Link href="/contact">
                      <motion.span
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/25 transition-all cursor-pointer border border-white/20"
                      >
                        {language === 'he' ? 'צרו קשר' : 'Contact Us'}
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </Layout>
  );
}
