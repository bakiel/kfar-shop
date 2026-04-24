'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronDown, HelpCircle, ShoppingCart, Truck, CreditCard, RotateCcw,
  Store, Leaf, Mic, QrCode, Search, X, MessageCircle, ArrowRight, Sparkles
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/lib/context/LanguageContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

interface FAQItem {
  icon: React.ElementType;
  category: string;
  categoryHe: string;
  questionEn: string;
  questionHe: string;
  answerEn: string;
  answerHe: string;
}

const faqItems: FAQItem[] = [
  {
    icon: ShoppingCart,
    category: 'Shopping',
    categoryHe: 'קניות',
    questionEn: 'How do I place an order?',
    questionHe: 'איך מבצעים הזמנה?',
    answerEn: 'Browse products from our vendors, add items to your cart, and proceed to checkout. You can shop as a guest or create an account for order tracking and rewards.',
    answerHe: 'עיין במוצרים מהספקים שלנו, הוסף פריטים לעגלה והמשך לתשלום. אפשר לקנות כאורח או ליצור חשבון למעקב הזמנות ותגמולים.'
  },
  {
    icon: Truck,
    category: 'Delivery',
    categoryHe: 'משלוח',
    questionEn: 'What are the delivery options?',
    questionHe: 'מהן אפשרויות המשלוח?',
    answerEn: 'We offer same-day delivery for orders placed before 2:00 PM within Dimona and surrounding areas. You can also pick up your order at the Village of Peace. Delivery is free for orders over 100 ILS.',
    answerHe: 'אנו מציעים משלוח באותו יום להזמנות שבוצעו לפני 14:00 בדימונה והסביבה. אפשר גם לאסוף את ההזמנה בכפר השלום. משלוח חינם בהזמנות מעל 100 ש"ח.'
  },
  {
    icon: CreditCard,
    category: 'Payments',
    categoryHe: 'תשלומים',
    questionEn: 'What payment methods do you accept?',
    questionHe: 'אילו אמצעי תשלום מקבלים?',
    answerEn: 'We accept credit cards (Visa, Mastercard, Isracard), Braysheet community tokens, and bank transfers. Braysheet tokens can be earned through community participation and redeemed at checkout.',
    answerHe: 'אנו מקבלים כרטיסי אשראי (ויזה, מאסטרקארד, ישראכרט), טוקני בראשית קהילתיים והעברות בנקאיות. טוקני בראשית נצברים דרך השתתפות בקהילה וניתנים למימוש בקופה.'
  },
  {
    icon: RotateCcw,
    category: 'Returns',
    categoryHe: 'החזרות',
    questionEn: 'What is your return policy?',
    questionHe: 'מהי מדיניות ההחזרות?',
    answerEn: 'We offer a 30-day return policy for non-food items in original condition. For food products, we have a freshness guarantee -- if an item arrives damaged or spoiled, contact us within 24 hours for a full refund.',
    answerHe: 'אנו מציעים מדיניות החזרות של 30 יום למוצרים שאינם מזון במצב מקורי. למוצרי מזון יש אחריות טריות -- אם פריט הגיע פגום או מקולקל, צור קשר תוך 24 שעות להחזר מלא.'
  },
  {
    icon: Store,
    category: 'Vendors',
    categoryHe: 'ספקים',
    questionEn: 'How do I become a vendor on KFAR?',
    questionHe: 'איך נהיים ספק בכפר?',
    answerEn: 'If you are a member of the Village of Peace community or a local Dimona business, reach out to us through the vendor application on our website. We will review your application and help you set up your store.',
    answerHe: 'אם אתה חבר בקהילת כפר השלום או עסק מקומי בדימונה, פנה אלינו דרך טופס הספקים באתר. נבדוק את הבקשה שלך ונעזור לך להקים את החנות.'
  },
  {
    icon: Leaf,
    category: 'Products',
    categoryHe: 'מוצרים',
    questionEn: 'Are all products vegan and kosher?',
    questionHe: 'האם כל המוצרים טבעוניים וכשרים?',
    answerEn: 'The majority of our products are vegan, reflecting the Village of Peace lifestyle. Each product listing clearly indicates dietary information. Many vendors specialize in plant-based alternatives to traditional foods.',
    answerHe: 'רוב המוצרים שלנו טבעוניים, בהתאם לאורח החיים של כפר השלום. כל מוצר מציין בבירור מידע תזונתי. ספקים רבים מתמחים בחלופות צמחיות למזונות מסורתיים.'
  },
  {
    icon: Mic,
    category: 'Features',
    categoryHe: 'תכונות',
    questionEn: 'How does voice shopping work?',
    questionHe: 'איך עובדת קנייה קולית?',
    answerEn: 'Our AI Shopping Assistant lets you search and shop using your voice in Hebrew or English. Tap the microphone icon in the chat widget to start. You can ask for products, get recommendations, and add items to your cart hands-free.',
    answerHe: 'עוזר הקניות החכם שלנו מאפשר חיפוש וקנייה בקול בעברית או אנגלית. לחצו על סמל המיקרופון בחלון הצ\'אט כדי להתחיל. אפשר לחפש מוצרים, לקבל המלצות ולהוסיף פריטים לעגלה ללא ידיים.'
  },
  {
    icon: QrCode,
    category: 'Features',
    categoryHe: 'תכונות',
    questionEn: 'How do QR codes work in the marketplace?',
    questionHe: 'איך עובדים קודי QR בשוק?',
    answerEn: 'Each vendor and product has a unique QR code. Scan with your phone camera to instantly view product details, vendor profiles, or add items to your cart. QR codes are also used for Braysheet token transactions.',
    answerHe: 'לכל ספק ומוצר יש קוד QR ייחודי. סרקו עם מצלמת הטלפון כדי לראות פרטי מוצר, פרופילי ספקים או להוסיף פריטים לעגלה. קודי QR משמשים גם לעסקאות בטוקני בראשית.'
  },
  {
    icon: ShoppingCart,
    category: 'Shopping',
    categoryHe: 'קניות',
    questionEn: 'Is there a minimum order amount?',
    questionHe: 'האם יש סכום הזמנה מינימלי?',
    answerEn: 'There is no minimum order for pickup. For delivery, the minimum order is 30 ILS. Orders over 100 ILS qualify for free delivery within the standard delivery area.',
    answerHe: 'אין מינימום הזמנה לאיסוף עצמי. למשלוח, המינימום הוא 30 ש"ח. הזמנות מעל 100 ש"ח זכאיות למשלוח חינם באזור המשלוח הרגיל.'
  },
  {
    icon: HelpCircle,
    category: 'Support',
    categoryHe: 'תמיכה',
    questionEn: 'How can I contact customer support?',
    questionHe: 'איך אפשר ליצור קשר עם שירות לקוחות?',
    answerEn: 'You can reach us through the AI Chat Assistant on any page, via WhatsApp, or by email. Our support team is available Sunday through Thursday from 8:00 AM to 8:00 PM.',
    answerHe: 'אפשר לפנות אלינו דרך עוזר הצ\'אט החכם בכל עמוד, דרך וואטסאפ או באימייל. צוות התמיכה שלנו זמין ראשון עד חמישי בין 8:00 ל-20:00.'
  }
];

const categories = ['All', 'Shopping', 'Delivery', 'Payments', 'Returns', 'Vendors', 'Products', 'Features', 'Support'];
const categoriesHe: Record<string, string> = {
  'All': 'הכל', 'Shopping': 'קניות', 'Delivery': 'משלוח', 'Payments': 'תשלומים',
  'Returns': 'החזרות', 'Vendors': 'ספקים', 'Products': 'מוצרים', 'Features': 'תכונות', 'Support': 'תמיכה'
};

export default function FAQPage() {
  const { language, isRTL } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const accordionRef = useRef(null);
  const isAccordionInView = useInView(accordionRef, { once: true, margin: '-50px' });

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = useMemo(() => {
    return faqItems.filter(faq => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch = !searchQuery ||
        faq.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answerEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.questionHe.includes(searchQuery) ||
        faq.answerHe.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Only show categories that have items
  const activeCategories = useMemo(() => {
    const usedCategories = new Set(faqItems.map(f => f.category));
    return categories.filter(c => c === 'All' || usedCategories.has(c));
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-[#fef9ef]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero */}
        <section
          className="relative py-24 md:py-32 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #478c0b 0%, #2D5A27 60%, #1a3a10 100%)' }}
        >
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#f6af0d]/10 blur-2xl" />

          <motion.div
            className="container mx-auto px-4 text-center relative z-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <HelpCircle className="w-8 h-8 stroke-[1.5] text-[#f6af0d]" />
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold text-white mb-5">
              {language === 'he' ? 'שאלות נפוצות' : 'Frequently Asked Questions'}
            </motion.h1>
            <motion.p variants={item} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              {language === 'he'
                ? 'מצאו תשובות לשאלות הנפוצות ביותר על כפר מרקטפלייס'
                : 'Find answers to the most common questions about KFAR Marketplace'}
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={item} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 stroke-[1.5] text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'he' ? 'חפשו שאלה...' : 'Search questions...'}
                  className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-[#3a3a1d] text-base focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl"
                  style={{ fontSize: '16px' }}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Category Tabs */}
        <section className="py-6 bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-4xl mx-auto pb-1">
              {activeCategories.map(cat => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(null);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#478c0b] text-white shadow-md shadow-[#478c0b]/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {language === 'he' ? categoriesHe[cat] : cat}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 md:py-24" ref={accordionRef}>
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto space-y-3"
              variants={container}
              initial="hidden"
              animate={isAccordionInView ? 'show' : 'hidden'}
            >
              {filteredFAQs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 stroke-[1.5]" />
                  <h3 className="text-xl font-bold text-[#3a3a1d] mb-2">
                    {language === 'he' ? 'לא נמצאו תוצאות' : 'No Results Found'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'he'
                      ? 'נסו לחפש עם מילים אחרות או בחרו קטגוריה אחרת'
                      : 'Try different search terms or select another category'}
                  </p>
                </motion.div>
              ) : (
                filteredFAQs.map((faq, i) => {
                  const Icon = faq.icon;
                  const isOpen = openIndex === i;
                  return (
                    <motion.div
                      key={`${faq.questionEn}-${activeCategory}`}
                      variants={item}
                      className="bg-white rounded-2xl overflow-hidden transition-shadow duration-200"
                      style={{
                        boxShadow: isOpen
                          ? '0 8px 30px rgba(71, 140, 11, 0.1)'
                          : '0 1px 3px rgba(0, 0, 0, 0.04)',
                        border: isOpen ? '1px solid rgba(71, 140, 11, 0.15)' : '1px solid rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <button
                        onClick={() => toggle(i)}
                        className="w-full flex items-center gap-4 p-5 md:p-6 text-left cursor-pointer group"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                          style={{ background: isOpen ? '#478c0b' : '#478c0b12' }}
                        >
                          <Icon className="w-5 h-5 stroke-[1.5]" style={{ color: isOpen ? '#fff' : '#478c0b' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#478c0b]/60 block mb-1">
                            {language === 'he' ? faq.categoryHe : faq.category}
                          </span>
                          <span className="font-semibold text-[#3a3a1d] text-base block">
                            {language === 'he' ? faq.questionHe : faq.questionEn}
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="shrink-0"
                        >
                          <ChevronDown className="w-5 h-5 stroke-[1.5] text-[#3a3a1d]/30" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 md:px-6 pb-6" style={{ paddingLeft: isRTL ? '1.5rem' : '5rem', paddingRight: isRTL ? '5rem' : '1.5rem' }}>
                              <div className="pt-1 border-t border-gray-100">
                                <p className="text-gray-600 leading-relaxed pt-4 text-[15px]">
                                  {language === 'he' ? faq.answerHe : faq.answerEn}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="py-20 md:py-24 bg-white">
          <motion.div
            className="container mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="max-w-3xl mx-auto rounded-3xl p-10 md:p-14 text-center text-white overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #478c0b, #2D5A27)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/15 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {language === 'he' ? 'עדיין יש שאלות?' : 'Still Have Questions?'}
                </h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto text-lg">
                  {language === 'he'
                    ? 'צוות התמיכה שלנו כאן לעזור. פנו אלינו בכל זמן ונשמח לסייע.'
                    : 'Our support team is here to help. Reach out to us anytime and we will be happy to assist.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#478c0b] rounded-full font-semibold text-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                      {language === 'he' ? 'צרו קשר' : 'Contact Us'}
                      <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                    </motion.span>
                  </Link>
                  <motion.a
                    href="https://wa.me/97286557700"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 stroke-[1.5]" />
                    WhatsApp
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
}
