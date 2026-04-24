'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, Zap, Store, ArrowRight } from 'lucide-react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { useLanguage } from '@/lib/context/LanguageContext';
import '@/styles/kfar-style-system.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const deliveryOptions = [
  {
    icon: Clock,
    titleEn: 'Same-Day Delivery',
    titleHe: 'משלוח באותו יום',
    descEn: 'Order before 2:00 PM and receive your items the same day. Available throughout Dimona and surrounding areas.',
    descHe: 'הזמן לפני 14:00 וקבל את הפריטים באותו יום. זמין בכל דימונה והסביבה.',
    priceEn: '15 ILS',
    priceHe: '15 ש"ח',
    color: '#478c0b'
  },
  {
    icon: Store,
    titleEn: 'Pickup at Village of Peace',
    titleHe: 'איסוף בכפר השלום',
    descEn: 'Pick up your order at our community center in the Village of Peace. Orders are ready within 2 hours of confirmation.',
    descHe: 'אסוף את ההזמנה במרכז הקהילתי בכפר השלום. ההזמנות מוכנות תוך שעתיים מהאישור.',
    priceEn: 'Free',
    priceHe: 'חינם',
    color: '#f6af0d'
  },
  {
    icon: Zap,
    titleEn: 'Express Delivery',
    titleHe: 'משלוח אקספרס',
    descEn: 'Need it fast? Express delivery within 1 hour for urgent orders. Available within central Dimona.',
    descHe: 'צריך מהר? משלוח אקספרס תוך שעה להזמנות דחופות. זמין במרכז דימונה.',
    priceEn: '25 ILS',
    priceHe: '25 ש"ח',
    color: '#c23c09'
  }
];

const infoSections = [
  {
    titleEn: 'Delivery Area',
    titleHe: 'אזור משלוח',
    icon: MapPin,
    contentEn: 'We deliver to Dimona, Arad, Yeruham, and the surrounding Negev communities. Our primary focus is the Dimona area with same-day service. Deliveries to Arad and Yeruham are available with next-day service.',
    contentHe: 'אנו מבצעים משלוחים לדימונה, ערד, ירוחם וקהילות הנגב הסובבות. המיקוד העיקרי שלנו הוא אזור דימונה עם שירות באותו יום. משלוחים לערד וירוחם זמינים עם שירות ביום למחרת.'
  },
  {
    titleEn: 'Free Delivery',
    titleHe: 'משלוח חינם',
    icon: Package,
    contentEn: 'Orders over 100 ILS within Dimona qualify for free standard delivery. This applies to same-day delivery when ordered before the 2:00 PM cutoff. Express delivery has a separate fee regardless of order total.',
    contentHe: 'הזמנות מעל 100 ש"ח בדימונה זכאיות למשלוח רגיל חינם. זה חל על משלוח באותו יום בהזמנות לפני 14:00. למשלוח אקספרס יש עלות נפרדת ללא קשר לסכום ההזמנה.'
  },
  {
    titleEn: 'Delivery Hours',
    titleHe: 'שעות משלוח',
    icon: Clock,
    contentEn: 'Deliveries are made Sunday through Thursday from 9:00 AM to 8:00 PM, and Friday from 9:00 AM to 2:00 PM. Saturday deliveries are not available. Express delivery is available from 10:00 AM to 6:00 PM.',
    contentHe: 'משלוחים מתבצעים ראשון עד חמישי מ-9:00 עד 20:00, ויום שישי מ-9:00 עד 14:00. אין משלוחים בשבת. משלוח אקספרס זמין מ-10:00 עד 18:00.'
  }
];

export default function ShippingPage() {
  const { language, isRTL } = useLanguage();

  return (
    <EnhancedLayout>
      <div className="min-h-screen bg-[#fef9ef]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <section
          className="relative py-20 md:py-28 text-white overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #478c0b 0%, #2D5A27 60%, #3a3a1d 100%)' }}
        >
          <motion.div
            className="container mx-auto px-4 text-center relative z-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
              <Truck className="w-8 h-8 stroke-[1.5] text-[#f6af0d]" />
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'he' ? 'משלוח ואספקה' : 'Shipping & Delivery'}
            </motion.h1>
            <motion.p variants={item} className="text-lg opacity-90 max-w-xl mx-auto">
              {language === 'he'
                ? 'מוצרים טריים מהקהילה ישירות לפתח הדלת שלך'
                : 'Fresh products from the community delivered straight to your door'}
            </motion.p>
          </motion.div>
        </section>

        {/* Delivery Options Cards */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-[#3a3a1d] mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {language === 'he' ? 'אפשרויות משלוח' : 'Delivery Options'}
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {deliveryOptions.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-[#478c0b]/10 relative overflow-hidden"
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(71,140,11,0.15)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: opt.color }} />
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: `${opt.color}15` }}>
                      <Icon className="w-7 h-7 stroke-[1.5]" style={{ color: opt.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#3a3a1d] mb-3">
                      {language === 'he' ? opt.titleHe : opt.titleEn}
                    </h3>
                    <p className="text-[#3a3a1d]/60 leading-relaxed mb-4">
                      {language === 'he' ? opt.descHe : opt.descEn}
                    </p>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold" style={{ background: `${opt.color}15`, color: opt.color }}>
                      {language === 'he' ? opt.priceHe : opt.priceEn}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Info Sections */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto space-y-8"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {infoSections.map((sec, i) => {
                const Icon = sec.icon;
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    className="flex gap-5"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#478c0b15' }}>
                      <Icon className="w-6 h-6 stroke-[1.5] text-[#478c0b]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#3a3a1d] mb-2">
                        {language === 'he' ? sec.titleHe : sec.titleEn}
                      </h3>
                      <p className="text-[#3a3a1d]/60 leading-relaxed">
                        {language === 'he' ? sec.contentHe : sec.contentEn}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <motion.div
            className="container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] mb-4">
              {language === 'he' ? 'מוכנים להזמין?' : 'Ready to Order?'}
            </h2>
            <p className="text-[#3a3a1d]/60 mb-8 max-w-md mx-auto">
              {language === 'he'
                ? 'גלו מוצרים טריים מספקים מקומיים וקבלו משלוח עד הדלת'
                : 'Discover fresh products from local vendors and get them delivered to your door'}
            </p>
            <motion.a
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold cursor-pointer text-white"
              style={{ background: '#478c0b' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'he' ? 'התחל לקנות' : 'Start Shopping'}
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </motion.a>
          </motion.div>
        </section>
      </div>
    </EnhancedLayout>
  );
}
