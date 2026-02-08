'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShoppingCart, Truck, CreditCard, RotateCcw, Store, Leaf, Mic, QrCode } from 'lucide-react';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { useLanguage } from '@/lib/context/LanguageContext';
import '@/styles/kfar-style-system.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

interface FAQItem {
  icon: React.ElementType;
  questionEn: string;
  questionHe: string;
  answerEn: string;
  answerHe: string;
}

const faqItems: FAQItem[] = [
  {
    icon: ShoppingCart,
    questionEn: 'How do I place an order?',
    questionHe: 'איך מבצעים הזמנה?',
    answerEn: 'Browse products from our vendors, add items to your cart, and proceed to checkout. You can shop as a guest or create an account for order tracking and rewards.',
    answerHe: 'עיין במוצרים מהספקים שלנו, הוסף פריטים לעגלה והמשך לתשלום. אפשר לקנות כאורח או ליצור חשבון למעקב הזמנות ותגמולים.'
  },
  {
    icon: Truck,
    questionEn: 'What are the delivery options?',
    questionHe: 'מהן אפשרויות המשלוח?',
    answerEn: 'We offer same-day delivery for orders placed before 2:00 PM within Dimona and surrounding areas. You can also pick up your order at the Village of Peace. Delivery is free for orders over 100 ILS.',
    answerHe: 'אנו מציעים משלוח באותו יום להזמנות שבוצעו לפני 14:00 בדימונה והסביבה. אפשר גם לאסוף את ההזמנה בכפר השלום. משלוח חינם בהזמנות מעל 100 ש"ח.'
  },
  {
    icon: CreditCard,
    questionEn: 'What payment methods do you accept?',
    questionHe: 'אילו אמצעי תשלום מקבלים?',
    answerEn: 'We accept credit cards (Visa, Mastercard, Isracard), Braysheet community tokens, and bank transfers. Braysheet tokens can be earned through community participation and redeemed at checkout.',
    answerHe: 'אנו מקבלים כרטיסי אשראי (ויזה, מאסטרקארד, ישראכרט), טוקני בראשית קהילתיים והעברות בנקאיות. טוקני בראשית נצברים דרך השתתפות בקהילה וניתנים למימוש בקופה.'
  },
  {
    icon: RotateCcw,
    questionEn: 'What is your return policy?',
    questionHe: 'מהי מדיניות ההחזרות?',
    answerEn: 'We offer a 30-day return policy for non-food items in original condition. For food products, we have a freshness guarantee — if an item arrives damaged or spoiled, contact us within 24 hours for a full refund.',
    answerHe: 'אנו מציעים מדיניות החזרות של 30 יום למוצרים שאינם מזון במצב מקורי. למוצרי מזון יש אחריות טריות — אם פריט הגיע פגום או מקולקל, צור קשר תוך 24 שעות להחזר מלא.'
  },
  {
    icon: Store,
    questionEn: 'How do I become a vendor on KFAR?',
    questionHe: 'איך נהיים ספק בכפר?',
    answerEn: 'If you are a member of the Village of Peace community or a local Dimona business, reach out to us through the vendor application on our website. We will review your application and help you set up your store.',
    answerHe: 'אם אתה חבר בקהילת כפר השלום או עסק מקומי בדימונה, פנה אלינו דרך טופס הספקים באתר. נבדוק את הבקשה שלך ונעזור לך להקים את החנות.'
  },
  {
    icon: Leaf,
    questionEn: 'Are all products vegan and kosher?',
    questionHe: 'האם כל המוצרים טבעוניים וכשרים?',
    answerEn: 'The majority of our products are vegan, reflecting the Village of Peace lifestyle. Each product listing clearly indicates dietary information. Many vendors specialize in plant-based alternatives to traditional foods.',
    answerHe: 'רוב המוצרים שלנו טבעוניים, בהתאם לאורח החיים של כפר השלום. כל מוצר מציין בבירור מידע תזונתי. ספקים רבים מתמחים בחלופות צמחיות למזונות מסורתיים.'
  },
  {
    icon: Mic,
    questionEn: 'How does voice shopping work?',
    questionHe: 'איך עובדת קנייה קולית?',
    answerEn: 'Our AI Shopping Assistant lets you search and shop using your voice in Hebrew or English. Tap the microphone icon in the chat widget to start. You can ask for products, get recommendations, and add items to your cart hands-free.',
    answerHe: 'עוזר הקניות החכם שלנו מאפשר חיפוש וקנייה בקול בעברית או אנגלית. לחץ על סמל המיקרופון בחלון הצ\'אט כדי להתחיל. אפשר לחפש מוצרים, לקבל המלצות ולהוסיף פריטים לעגלה ללא ידיים.'
  },
  {
    icon: QrCode,
    questionEn: 'How do QR codes work in the marketplace?',
    questionHe: 'איך עובדים קודי QR בשוק?',
    answerEn: 'Each vendor and product has a unique QR code. Scan with your phone camera to instantly view product details, vendor profiles, or add items to your cart. QR codes are also used for Braysheet token transactions.',
    answerHe: 'לכל ספק ומוצר יש קוד QR ייחודי. סרוק עם מצלמת הטלפון כדי לראות פרטי מוצר, פרופילי ספקים או להוסיף פריטים לעגלה. קודי QR משמשים גם לעסקאות בטוקני בראשית.'
  },
  {
    icon: ShoppingCart,
    questionEn: 'Is there a minimum order amount?',
    questionHe: 'האם יש סכום הזמנה מינימלי?',
    answerEn: 'There is no minimum order for pickup. For delivery, the minimum order is 30 ILS. Orders over 100 ILS qualify for free delivery within the standard delivery area.',
    answerHe: 'אין מינימום הזמנה לאיסוף עצמי. למשלוח, המינימום הוא 30 ש"ח. הזמנות מעל 100 ש"ח זכאיות למשלוח חינם באזור המשלוח הרגיל.'
  },
  {
    icon: HelpCircle,
    questionEn: 'How can I contact customer support?',
    questionHe: 'איך אפשר ליצור קשר עם שירות לקוחות?',
    answerEn: 'You can reach us through the AI Chat Assistant on any page, via WhatsApp, or by email. Our support team is available Sunday through Thursday from 8:00 AM to 8:00 PM.',
    answerHe: 'אפשר לפנות אלינו דרך עוזר הצ\'אט החכם בכל עמוד, דרך וואטסאפ או באימייל. צוות התמיכה שלנו זמין ראשון עד חמישי בין 8:00 ל-20:00.'
  }
];

export default function FAQPage() {
  const { language, isRTL } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
              <HelpCircle className="w-8 h-8 stroke-[1.5] text-[#f6af0d]" />
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'he' ? 'שאלות נפוצות' : 'Frequently Asked Questions'}
            </motion.h1>
            <motion.p variants={item} className="text-lg opacity-90 max-w-xl mx-auto">
              {language === 'he'
                ? 'מצא תשובות לשאלות הנפוצות ביותר על כפר מרקטפלייס'
                : 'Find answers to the most common questions about KFAR Marketplace'}
            </motion.p>
          </motion.div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto space-y-3"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {faqItems.map((faq, i) => {
                const Icon = faq.icon;
                const isOpen = openIndex === i;
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    className="bg-white rounded-xl border border-[#478c0b]/10 overflow-hidden"
                    style={{ boxShadow: isOpen ? '0 8px 30px rgba(71,140,11,0.1)' : '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center gap-4 p-5 text-left cursor-pointer"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#478c0b15' }}>
                        <Icon className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
                      </div>
                      <span className="flex-1 font-semibold text-[#3a3a1d]">
                        {language === 'he' ? faq.questionHe : faq.questionEn}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 stroke-[1.5] text-[#3a3a1d]/40" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5" style={{ paddingLeft: isRTL ? '1.25rem' : '4.25rem', paddingRight: isRTL ? '4.25rem' : '1.25rem' }}>
                            <p className="text-[#3a3a1d]/70 leading-relaxed">
                              {language === 'he' ? faq.answerHe : faq.answerEn}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 md:py-20 bg-white">
          <motion.div
            className="container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] mb-4">
              {language === 'he' ? 'עדיין יש שאלות?' : 'Still Have Questions?'}
            </h2>
            <p className="text-[#3a3a1d]/60 mb-8 max-w-md mx-auto">
              {language === 'he'
                ? 'צוות התמיכה שלנו כאן לעזור. פנו אלינו בכל זמן.'
                : 'Our support team is here to help. Reach out to us anytime.'}
            </p>
            <motion.a
              href="mailto:support@kfrmarketplace.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold cursor-pointer text-white"
              style={{ background: '#478c0b' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === 'he' ? 'צור קשר' : 'Contact Us'}
            </motion.a>
          </motion.div>
        </section>
      </div>
    </EnhancedLayout>
  );
}
