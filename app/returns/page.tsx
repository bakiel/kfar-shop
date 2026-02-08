'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Shield, Clock, MessageCircle, CreditCard, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
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

const policies = [
  {
    icon: Shield,
    titleEn: '30-Day Return Window',
    titleHe: 'חלון החזרה של 30 יום',
    descEn: 'Non-food items can be returned within 30 days of delivery in their original, unopened condition. Items must include original packaging and any tags.',
    descHe: 'מוצרים שאינם מזון ניתנים להחזרה תוך 30 יום מהמשלוח במצבם המקורי והסגור. הפריטים חייבים לכלול אריזה מקורית ותגיות.'
  },
  {
    icon: Leaf,
    titleEn: 'Freshness Guarantee',
    titleHe: 'אחריות טריות',
    descEn: 'All food products come with a freshness guarantee. If your order arrives damaged, spoiled, or not as described, contact us within 24 hours for a full refund or replacement.',
    descHe: 'כל מוצרי המזון מגיעים עם אחריות טריות. אם ההזמנה הגיעה פגומה, מקולקלת או לא כמתואר, צור קשר תוך 24 שעות להחזר מלא או החלפה.'
  },
  {
    icon: MessageCircle,
    titleEn: 'Contact the Vendor',
    titleHe: 'צור קשר עם הספק',
    descEn: 'To initiate a return, contact the vendor directly through your order page or use the KFAR chat support. The vendor will arrange pickup or provide drop-off instructions.',
    descHe: 'כדי להתחיל החזרה, צור קשר ישיר עם הספק דרך עמוד ההזמנה שלך או השתמש בצ\'אט התמיכה של כפר. הספק יתאם איסוף או יספק הנחיות למסירה.'
  },
  {
    icon: CreditCard,
    titleEn: 'Refund Timeline',
    titleHe: 'לוח זמנים להחזר',
    descEn: 'Credit card refunds are processed within 5-7 business days after the return is approved. Braysheet token refunds are instant. Bank transfers may take up to 10 business days.',
    descHe: 'החזרים לכרטיס אשראי מעובדים תוך 5-7 ימי עסקים לאחר אישור ההחזרה. החזרי טוקני בראשית מיידיים. העברות בנקאיות עשויות לקחת עד 10 ימי עסקים.'
  }
];

const steps = [
  {
    stepEn: '1. Report the Issue',
    stepHe: '1. דווח על הבעיה',
    descEn: 'Go to your order in the customer portal and select "Request Return" or contact the vendor directly.',
    descHe: 'עבור להזמנה שלך בפורטל הלקוחות ובחר "בקש החזרה" או צור קשר ישירות עם הספק.'
  },
  {
    stepEn: '2. Vendor Review',
    stepHe: '2. בדיקת הספק',
    descEn: 'The vendor reviews your request within 24 hours and approves or discusses alternatives with you.',
    descHe: 'הספק בודק את הבקשה שלך תוך 24 שעות ומאשר או דן בחלופות איתך.'
  },
  {
    stepEn: '3. Return the Item',
    stepHe: '3. החזר את הפריט',
    descEn: 'Ship the item back or arrange a pickup. For food items, photos are sufficient — no physical return needed.',
    descHe: 'שלח את הפריט בחזרה או תאם איסוף. למוצרי מזון, תמונות מספיקות — אין צורך בהחזרה פיזית.'
  },
  {
    stepEn: '4. Get Your Refund',
    stepHe: '4. קבל את ההחזר שלך',
    descEn: 'Once approved, your refund is processed to your original payment method within the stated timeline.',
    descHe: 'לאחר אישור, ההחזר מעובד לאמצעי התשלום המקורי שלך בהתאם ללוח הזמנים שצוין.'
  }
];

export default function ReturnsPage() {
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
              <RotateCcw className="w-8 h-8 stroke-[1.5] text-[#f6af0d]" />
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'he' ? 'החזרות והחזרי כסף' : 'Returns & Refunds'}
            </motion.h1>
            <motion.p variants={item} className="text-lg opacity-90 max-w-xl mx-auto">
              {language === 'he'
                ? 'שביעות רצונך חשובה לנו. הנה כל מה שצריך לדעת על מדיניות ההחזרות'
                : 'Your satisfaction matters to us. Here is everything you need to know about our return policy'}
            </motion.p>
          </motion.div>
        </section>

        {/* Policy Cards */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {policies.map((policy, i) => {
                const Icon = policy.icon;
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-[#478c0b]/10"
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(71,140,11,0.15)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: '#478c0b15' }}>
                      <Icon className="w-7 h-7 stroke-[1.5] text-[#478c0b]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3a3a1d] mb-3">
                      {language === 'he' ? policy.titleHe : policy.titleEn}
                    </h3>
                    <p className="text-[#3a3a1d]/60 leading-relaxed">
                      {language === 'he' ? policy.descHe : policy.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* How to Return - Steps */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-[#3a3a1d] mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {language === 'he' ? 'איך מחזירים' : 'How to Return'}
            </motion.h2>
            <motion.div
              className="max-w-2xl mx-auto space-y-6"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ background: '#478c0b' }}>
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-[#3a3a1d] mb-1">
                      {language === 'he' ? step.stepHe.replace(/^\d+\.\s/, '') : step.stepEn.replace(/^\d+\.\s/, '')}
                    </h3>
                    <p className="text-[#3a3a1d]/60 leading-relaxed">
                      {language === 'he' ? step.descHe : step.descEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-[#478c0b]/5 rounded-2xl p-8 border border-[#478c0b]/10">
              <h3 className="text-xl font-bold text-[#3a3a1d] mb-4">
                {language === 'he' ? 'הערות חשובות' : 'Important Notes'}
              </h3>
              <ul className="space-y-3">
                {[
                  { en: 'Perishable food items cannot be physically returned. Provide photos of the issue for a refund.', he: 'מוצרי מזון מתכלים לא ניתנים להחזרה פיזית. ספק תמונות של הבעיה לקבלת החזר.' },
                  { en: 'Custom or personalized orders are non-refundable unless defective.', he: 'הזמנות מותאמות אישית אינן ניתנות להחזר אלא אם פגומות.' },
                  { en: 'Delivery fees are non-refundable unless the issue was caused by a delivery error.', he: 'דמי משלוח אינם ניתנים להחזר אלא אם הבעיה נגרמה על ידי שגיאת משלוח.' },
                  { en: 'Braysheet token refunds are processed instantly to your wallet balance.', he: 'החזרי טוקני בראשית מעובדים מיידית ליתרת הארנק שלך.' }
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 stroke-[1.5] text-[#478c0b] shrink-0 mt-0.5" />
                    <span className="text-[#3a3a1d]/70">
                      {language === 'he' ? note.he : note.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-white">
          <motion.div
            className="container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] mb-4">
              {language === 'he' ? 'צריכים עזרה עם החזרה?' : 'Need Help with a Return?'}
            </h2>
            <p className="text-[#3a3a1d]/60 mb-8 max-w-md mx-auto">
              {language === 'he'
                ? 'צוות התמיכה שלנו כאן כדי לעזור בכל שאלה'
                : 'Our support team is here to assist with any questions'}
            </p>
            <motion.a
              href="mailto:support@kfrmarketplace.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold cursor-pointer text-white"
              style={{ background: '#478c0b' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'he' ? 'צור קשר עם התמיכה' : 'Contact Support'}
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </motion.a>
          </motion.div>
        </section>
      </div>
    </EnhancedLayout>
  );
}
