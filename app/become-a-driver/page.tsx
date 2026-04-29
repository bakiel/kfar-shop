'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Truck, Clock, Users, DollarSign, MapPin, ArrowRight, CheckCircle, FileText } from 'lucide-react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { useLanguage } from '@/lib/context/LanguageContext';
import DriverApplicationForm from '@/components/delivery/DriverApplicationForm';
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
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const benefits = [
  {
    icon: Clock,
    titleEn: 'Flexible Hours',
    titleHe: 'שעות גמישות',
    descEn: 'Choose your own schedule. Work mornings, afternoons, or evenings — whatever fits your life.',
    descHe: 'בחר את הלוח זמנים שלך. עבוד בבקרים, אחר הצהריים או בערבים — מה שמתאים לך.'
  },
  {
    icon: Users,
    titleEn: 'Serve Your Community',
    titleHe: 'שרת את הקהילה שלך',
    descEn: 'Deliver to your neighbors in Dimona and the Village of Peace. Build real connections.',
    descHe: 'משלוחים לשכנים שלך בדימונה וכפר השלום. בנה קשרים אמיתיים.'
  },
  {
    icon: DollarSign,
    titleEn: 'Competitive Pay',
    titleHe: 'תשלום תחרותי',
    descEn: 'Earn competitive rates per delivery plus tips. Same-day payouts available.',
    descHe: 'הרוויח תעריפים תחרותיים למשלוח בתוספת טיפים. תשלום באותו יום.'
  }
];

const requirements = [
  { en: 'Valid Israeli driver\'s license', he: 'רישיון נהיגה ישראלי בתוקף' },
  { en: 'Reliable vehicle (car, scooter, or bicycle)', he: 'רכב אמין (מכונית, קטנוע או אופניים)' },
  { en: 'Smartphone with GPS', he: 'סמארטפון עם GPS' },
  { en: 'Friendly and professional attitude', he: 'גישה ידידותית ומקצועית' },
  { en: 'Knowledge of Dimona and surrounding areas', he: 'היכרות עם דימונה והסביבה' }
];

function scrollToForm() {
  document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
}

export default function BecomeADriverPage() {
  const { language, isRTL } = useLanguage();

  return (
    <EnhancedLayout>
      <div className="min-h-screen bg-[#fef9ef]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section
          className="relative py-24 md:py-32 text-white overflow-hidden"
        >
          <Image
            src="/images/community/delivery_driver_2.jpg"
            alt="KFAR delivery driver handing fresh produce to a family"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D5A27]/95 via-[#2D5A27]/70 to-[#478c0b]/50" />
          <motion.div
            className="container mx-auto px-4 relative z-10 text-center"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <Truck className="w-10 h-10 stroke-[1.5] text-[#f6af0d]" />
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold mb-4">
              {language === 'he' ? 'הפוך לנהג כפר' : 'Become a KFAR Driver'}
            </motion.h1>
            <motion.p variants={item} className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
              {language === 'he'
                ? 'הצטרף לצוות המשלוחים שלנו ועזור להביא מוצרים טריים לקהילה'
                : 'Join our delivery team and help bring fresh products to the community'}
            </motion.p>
            <motion.button
              variants={item}
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg cursor-pointer"
              style={{ background: '#f6af0d', color: '#3a3a1d' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(246,175,13,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'he' ? 'הגש מועמדות עכשיו' : 'Apply Now'}
              <ArrowRight className="w-5 h-5 stroke-[1.5]" />
            </motion.button>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-[#3a3a1d] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {language === 'he' ? 'למה לנהוג עם כפר?' : 'Why Drive with KFAR?'}
            </motion.h2>
            <motion.p
              className="text-center text-[#3a3a1d]/60 mb-12 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {language === 'he'
                ? 'משלוחים מקומיים שעושים הבדל אמיתי בקהילה שלך'
                : 'Local deliveries that make a real difference in your community'}
            </motion.p>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-[#478c0b]/10"
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(71,140,11,0.15)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' as const }}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: '#478c0b15' }}>
                      <Icon className="w-7 h-7 stroke-[1.5] text-[#478c0b]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3a3a1d] mb-3">
                      {language === 'he' ? benefit.titleHe : benefit.titleEn}
                    </h3>
                    <p className="text-[#3a3a1d]/60 leading-relaxed">
                      {language === 'he' ? benefit.descHe : benefit.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-center text-[#3a3a1d] mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {language === 'he' ? 'דרישות' : 'Requirements'}
              </motion.h2>
              <motion.div
                className="space-y-4"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {requirements.map((req, i) => (
                  <motion.div
                    key={i}
                    variants={item}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#fef9ef] border border-[#478c0b]/10"
                  >
                    <CheckCircle className="w-6 h-6 stroke-[1.5] text-[#478c0b] shrink-0" />
                    <span className="text-[#3a3a1d] font-medium">
                      {language === 'he' ? req.he : req.en}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-[#3a3a1d] mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {language === 'he' ? 'איך זה עובד' : 'How It Works'}
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { step: '1', titleEn: 'Apply', titleHe: 'הגש מועמדות', descEn: 'Fill out a quick application and tell us about yourself.', descHe: 'מלא טופס קצר וספר לנו על עצמך.' },
                { step: '2', titleEn: 'Get Approved', titleHe: 'קבל אישור', descEn: 'We review your application and get you onboarded.', descHe: 'אנחנו בודקים את המועמדות שלך ומכינים אותך.' },
                { step: '3', titleEn: 'Start Delivering', titleHe: 'התחל לבצע משלוחים', descEn: 'Pick up orders from vendors and deliver to happy customers.', descHe: 'אסוף הזמנות מספקים ומסור ללקוחות מרוצים.' }
              ].map((s, i) => (
                <motion.div key={i} variants={item} className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold" style={{ background: '#478c0b' }}>
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#3a3a1d] mb-2">
                    {language === 'he' ? s.titleHe : s.titleEn}
                  </h3>
                  <p className="text-[#3a3a1d]/60">
                    {language === 'he' ? s.descHe : s.descEn}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Application Form Section */}
        <section id="application-form" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#478c0b]/10 mb-4">
                <FileText className="w-7 h-7 stroke-[1.5] text-[#478c0b]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3a3a1d] mb-3">
                {language === 'he' ? 'טופס הגשת מועמדות' : 'Application Form'}
              </h2>
              <p className="text-[#3a3a1d]/60 max-w-xl mx-auto">
                {language === 'he'
                  ? 'מלא את הטופס ונחזור אליך תוך 2-3 ימי עסקים'
                  : 'Fill out the form and we\'ll get back to you within 2-3 business days'}
              </p>
            </motion.div>
            <DriverApplicationForm />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #478c0b, #2D5A27)' }}>
          <motion.div
            className="container mx-auto px-4 text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MapPin className="w-10 h-10 stroke-[1.5] mx-auto mb-4 text-[#f6af0d]" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'he' ? 'מוכן להתחיל?' : 'Ready to Get Started?'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              {language === 'he'
                ? 'הצטרף לצוות הנהגים שלנו היום והתחל להרוויח תוך שירות הקהילה'
                : 'Join our driver team today and start earning while serving the community'}
            </p>
            <motion.button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg cursor-pointer"
              style={{ background: '#f6af0d', color: '#3a3a1d' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'he' ? 'הגש מועמדות עכשיו' : 'Apply Now'}
              <ArrowRight className="w-5 h-5 stroke-[1.5]" />
            </motion.button>
          </motion.div>
        </section>
      </div>
    </EnhancedLayout>
  );
}
