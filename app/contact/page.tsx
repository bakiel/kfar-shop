'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Phone, Mail, MapPin, Clock, Send, MessageCircle, ChevronRight,
  CheckCircle, Headphones, Users, Shield, Star, ArrowRight,
  Upload, Tag, AlertTriangle, Info, AlertCircle, X
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

interface ContactCard {
  icon: React.ElementType;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  valueEn: string;
  valueHe: string;
  color: string;
  bgColor: string;
}

const contactCards: ContactCard[] = [
  {
    icon: Phone,
    titleEn: 'Call Us',
    titleHe: 'התקשרו אלינו',
    descriptionEn: 'Speak with our community support team',
    descriptionHe: 'דברו עם צוות התמיכה הקהילתי שלנו',
    valueEn: '+972-8-655-7700',
    valueHe: '08-655-7700',
    color: '#478c0b',
    bgColor: '#478c0b10'
  },
  {
    icon: Mail,
    titleEn: 'Email Us',
    titleHe: 'שלחו אימייל',
    descriptionEn: 'We reply within 24 hours',
    descriptionHe: 'נשיב תוך 24 שעות',
    valueEn: 'support@kfrmarketplace.com',
    valueHe: 'support@kfrmarketplace.com',
    color: '#f6af0d',
    bgColor: '#f6af0d10'
  },
  {
    icon: MapPin,
    titleEn: 'Visit Us',
    titleHe: 'בקרו אותנו',
    descriptionEn: 'Village of Peace, Dimona',
    descriptionHe: 'כפר השלום, דימונה',
    valueEn: 'Village of Peace, Dimona, Israel',
    valueHe: 'כפר השלום, דימונה, ישראל',
    color: '#c23c09',
    bgColor: '#c23c0910'
  }
];

interface Tag {
  id: string;
  name: string;
  color: string;
}

const supportTags: Tag[] = [
  { id: 'urgent', name: 'Urgent', color: '#c23c09' },
  { id: 'payment', name: 'Payment Issue', color: '#f6af0d' },
  { id: 'vendor', name: 'Vendor Inquiry', color: '#478c0b' },
  { id: 'shipping', name: 'Shipping', color: '#3a3a1d' },
  { id: 'technical', name: 'Technical', color: '#6366f1' },
  { id: 'feedback', name: 'Feedback', color: '#8b5cf6' }
];

export default function ContactPage() {
  const { language, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const isCardsInView = useInView(cardsRef, { once: true, margin: '-80px' });
  const isFormInView = useInView(formRef, { once: true, margin: '-80px' });
  const isInfoInView = useInView(infoRef, { once: true, margin: '-80px' });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const getPriority = (): { level: string; color: string; time: string } => {
    if (selectedTags.includes('urgent')) return { level: 'Urgent', color: '#c23c09', time: '< 1 hour' };
    if (selectedTags.includes('payment')) return { level: 'High', color: '#f6af0d', time: '2-4 hours' };
    if (selectedTags.includes('technical')) return { level: 'Medium', color: '#478c0b', time: '24 hours' };
    return { level: 'Standard', color: '#6b7280', time: '48 hours' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#fef9ef]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative py-24 md:py-32 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #478c0b 0%, #2D5A27 50%, #1a3a10 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#f6af0d]/10 blur-2xl" />

          <motion.div
            className="container mx-auto px-4 text-center relative z-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-white/10 backdrop-blur-sm p-4 mb-6">
              <Headphones className="w-10 h-10 stroke-[1.5] text-[#f6af0d]" />
            </motion.div>
            <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold text-white mb-5">
              {language === 'he' ? 'צרו קשר' : 'Get in Touch'}
            </motion.h1>
            <motion.p variants={item} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {language === 'he'
                ? 'צוות התמיכה הקהילתי שלנו כאן בשבילכם. שלחו שאלה, דווחו על בעיה, או סתם אמרו שלום.'
                : 'Our community support team is here for you. Ask a question, report an issue, or just say hello.'}
            </motion.p>
            <motion.div variants={item} className="flex items-center justify-center gap-3 text-white/60 text-sm">
              <Clock className="w-4 h-4 stroke-[1.5]" />
              <span>{language === 'he' ? 'ראשון-חמישי 8:00-20:00 | שישי 8:00-14:00' : 'Sun-Thu 8:00-20:00 | Fri 8:00-14:00'}</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Contact Method Cards */}
        <section className="py-16 md:py-20" ref={cardsRef}>
          <div className="container mx-auto px-4">
            <motion.div
              className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto -mt-24 relative z-20"
              variants={container}
              initial="hidden"
              animate={isCardsInView ? 'show' : 'hidden'}
            >
              {contactCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    variants={item}
                    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-pointer group"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: card.bgColor }}
                    >
                      <Icon className="w-7 h-7 stroke-[1.5]" style={{ color: card.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#3a3a1d] mb-2">
                      {language === 'he' ? card.titleHe : card.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {language === 'he' ? card.descriptionHe : card.descriptionEn}
                    </p>
                    <p className="font-semibold text-[#3a3a1d] text-sm flex items-center gap-2">
                      {language === 'he' ? card.valueHe : card.valueEn}
                      <ArrowRight className="w-4 h-4 stroke-[1.5] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: card.color }} />
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Contact Form + Info */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                ref={formRef}
                className="lg:col-span-3"
                initial={{ opacity: 0, y: 40 }}
                animate={isFormInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] mb-2">
                    {language === 'he' ? 'שלחו לנו הודעה' : 'Send Us a Message'}
                  </h2>
                  <p className="text-gray-500 mb-8">
                    {language === 'he' ? 'מלאו את הטופס ונחזור אליכם בהקדם' : 'Fill out the form and we will get back to you soon'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#3a3a1d] mb-2">
                          {language === 'he' ? 'שם פרטי' : 'First Name'}
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors duration-200 text-base"
                          style={{ fontSize: '16px' }}
                          placeholder={language === 'he' ? 'השם שלך' : 'Your first name'}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a3a1d] mb-2">
                          {language === 'he' ? 'שם משפחה' : 'Last Name'}
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors duration-200 text-base"
                          style={{ fontSize: '16px' }}
                          placeholder={language === 'he' ? 'שם המשפחה' : 'Your last name'}
                          required
                        />
                      </div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#3a3a1d] mb-2">
                          {language === 'he' ? 'אימייל' : 'Email'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 stroke-[1.5] text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors duration-200 text-base"
                            style={{ fontSize: '16px' }}
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a3a1d] mb-2">
                          {language === 'he' ? 'טלפון' : 'Phone'}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 stroke-[1.5] text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors duration-200 text-base"
                            style={{ fontSize: '16px' }}
                            placeholder="+972-XX-XXX-XXXX"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3a3a1d] mb-2">
                        {language === 'he' ? 'קטגוריה' : 'Category'}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors duration-200 text-base bg-white cursor-pointer"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">{language === 'he' ? 'בחר קטגוריה...' : 'Select category...'}</option>
                        <option>{language === 'he' ? 'שאלה כללית' : 'General Inquiry'}</option>
                        <option>{language === 'he' ? 'תמיכת הזמנות' : 'Order Support'}</option>
                        <option>{language === 'he' ? 'בעיית תשלום' : 'Payment Issue'}</option>
                        <option>{language === 'he' ? 'בעיה טכנית' : 'Technical Problem'}</option>
                        <option>{language === 'he' ? 'הצטרפות כספק' : 'Vendor Application'}</option>
                        <option>{language === 'he' ? 'שאלה קהילתית' : 'Community Question'}</option>
                        <option>{language === 'he' ? 'החזרת מוצר' : 'Product Return'}</option>
                        <option>{language === 'he' ? 'משוב/הצעה' : 'Feedback / Suggestion'}</option>
                      </select>
                    </div>

                    {/* Smart Tags */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3a3a1d] mb-3">
                        {language === 'he' ? 'תגיות (עוזרות לנו לנתב מהר יותר)' : 'Tags (help us route faster)'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {supportTags.map(tag => (
                          <motion.button
                            key={tag.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTagToggle(tag.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                              selectedTags.includes(tag.id)
                                ? 'text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                          >
                            <Tag className="w-3.5 h-3.5 stroke-[1.5]" />
                            {tag.name}
                          </motion.button>
                        ))}
                      </div>

                      {/* Priority Indicator */}
                      <AnimatePresence>
                        {selectedTags.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getPriority().color }}
                              />
                              <span className="text-sm font-medium text-[#3a3a1d]">
                                {language === 'he' ? 'רמת עדיפות:' : 'Priority:'} {getPriority().level}
                              </span>
                              <span className="text-sm text-gray-500">
                                {language === 'he' ? 'זמן תגובה:' : 'Response:'} {getPriority().time}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3a3a1d] mb-2">
                        {language === 'he' ? 'הודעה' : 'Message'}
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#478c0b] transition-colors duration-200 text-base resize-none"
                        style={{ fontSize: '16px' }}
                        rows={5}
                        placeholder={language === 'he' ? 'תארו את השאלה או הבעיה שלכם בפירוט...' : 'Describe your question or issue in detail...'}
                        required
                      />
                    </div>

                    {/* Attachment Area */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#478c0b]/40 transition-colors duration-200 cursor-pointer group">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300 group-hover:text-[#478c0b] transition-colors stroke-[1.5]" />
                      <p className="text-sm text-gray-500">
                        {language === 'he' ? 'גררו קבצים לכאן או לחצו לבחירה' : 'Drag & drop files or click to browse'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {language === 'he' ? 'תמונות, PDF, מסמכים (עד 10MB)' : 'Images, PDFs, Documents (max 10MB)'}
                      </p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(71, 140, 11, 0.25)' }}
                      whileTap={{ scale: 0.98 }}
                      disabled={formStatus === 'submitting'}
                      className="w-full py-4 rounded-xl font-semibold text-lg text-white transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
                      style={{ background: 'linear-gradient(135deg, #478c0b, #2D5A27)' }}
                    >
                      {formStatus === 'submitting' ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Send className="w-5 h-5 stroke-[1.5]" />
                          </motion.div>
                          {language === 'he' ? 'שולח...' : 'Sending...'}
                        </>
                      ) : formStatus === 'success' ? (
                        <>
                          <CheckCircle className="w-5 h-5 stroke-[1.5]" />
                          {language === 'he' ? 'נשלח בהצלחה!' : 'Message Sent!'}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 stroke-[1.5]" />
                          {language === 'he' ? 'שלח הודעה' : 'Send Message'}
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>

              {/* Sidebar Info */}
              <motion.div
                ref={infoRef}
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: 30 }}
                animate={isInfoInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* WhatsApp CTA */}
                <motion.a
                  href="https://wa.me/97286557700"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(37, 211, 102, 0.2)' }}
                  className="block bg-[#25D366] text-white rounded-2xl p-6 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {language === 'he' ? 'שלחו וואטסאפ' : 'Chat on WhatsApp'}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {language === 'he' ? 'תגובה מהירה תוך דקות' : 'Quick response in minutes'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 stroke-[1.5] ml-auto" />
                  </div>
                </motion.a>

                {/* Support Hours */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-bold text-lg text-[#3a3a1d] mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
                    {language === 'he' ? 'שעות פעילות' : 'Support Hours'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { dayEn: 'Sunday - Thursday', dayHe: 'ראשון - חמישי', time: '8:00 - 20:00' },
                      { dayEn: 'Friday', dayHe: 'שישי', time: '8:00 - 14:00' },
                      { dayEn: 'Saturday (Shabbat)', dayHe: 'שבת', time: language === 'he' ? 'סגור' : 'Closed' }
                    ].map((schedule, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-600">
                          {language === 'he' ? schedule.dayHe : schedule.dayEn}
                        </span>
                        <span className="text-sm font-semibold text-[#3a3a1d]">{schedule.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-bold text-lg text-[#3a3a1d] mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 stroke-[1.5] text-[#f6af0d]" />
                    {language === 'he' ? 'סטטיסטיקות תמיכה' : 'Support Stats'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { labelEn: 'Average Response', labelHe: 'זמן תגובה ממוצע', value: '2.5h' },
                      { labelEn: 'Satisfaction', labelHe: 'שביעות רצון', value: '4.8/5' },
                      { labelEn: 'Resolved This Month', labelHe: 'פתרונות החודש', value: '156' },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{language === 'he' ? stat.labelHe : stat.labelEn}</span>
                        <span className="font-bold text-[#478c0b]">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Benefits */}
                <div
                  className="rounded-2xl p-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #478c0b 0%, #2D5A27 100%)' }}
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 stroke-[1.5]" />
                    {language === 'he' ? 'הטבות קהילה' : 'Community Benefits'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      language === 'he' ? 'תור עדיפות לתמיכה' : 'Priority Support Queue',
                      language === 'he' ? 'משלוח החזרות חינם' : 'Free Return Shipping',
                      language === 'he' ? 'אחריות מורחבת' : 'Extended Warranty',
                      language === 'he' ? 'גישה לאירועי VIP' : 'VIP Event Access'
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 stroke-[1.5] text-[#f6af0d] shrink-0" />
                        <span className="text-sm text-white/90">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#478c0b]/5 to-[#f6af0d]/5 rounded-2xl p-8 md:p-12 border border-[#478c0b]/10"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] mb-4">
                      {language === 'he' ? 'בואו לבקר אותנו' : 'Come Visit Us'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {language === 'he'
                        ? 'כפר השלום, דימונה, ישראל. חוו את הקהילה, טעמו את האוכל, הכירו את האנשים.'
                        : 'Village of Peace, Dimona, Israel. Experience the community, taste the food, meet the people.'}
                    </p>
                    <div className="space-y-3">
                      {[
                        { icon: MapPin, textEn: 'Village of Peace, Dimona, Israel', textHe: 'כפר השלום, דימונה, ישראל' },
                        { icon: Phone, textEn: '+972-8-655-7700', textHe: '08-655-7700' },
                        { icon: Mail, textEn: 'support@kfrmarketplace.com', textHe: 'support@kfrmarketplace.com' }
                      ].map((info, i) => {
                        const InfoIcon = info.icon;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <InfoIcon className="w-5 h-5 stroke-[1.5] text-[#478c0b] shrink-0" />
                            <span className="text-[#3a3a1d]">{language === 'he' ? info.textHe : info.textEn}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 stroke-[1.5]" />
                      <p className="font-medium">{language === 'he' ? 'מפה בקרוב' : 'Map Coming Soon'}</p>
                      <p className="text-sm">{language === 'he' ? 'דימונה, ישראל' : 'Dimona, Israel'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
