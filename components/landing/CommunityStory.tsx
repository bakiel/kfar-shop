'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Leaf, Users, Heart, Sun } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

/* -------------------------------------------------------------------------- */
/*  Photo grid data                                                            */
/* -------------------------------------------------------------------------- */

const communityPhotos = [
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_03.jpg',
    caption: 'Community gathering',
    captionHe: 'מפגש קהילתי',
    span: 'row-span-2', // tall
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_08.jpg',
    caption: 'Fresh from the garden',
    captionHe: 'טרי מהגינה',
    span: '',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_12.jpg',
    caption: 'Heritage traditions',
    captionHe: 'מסורות מורשת',
    span: '',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_20.jpg',
    caption: 'Community life',
    captionHe: 'חיי קהילה',
    span: 'row-span-2', // tall
  },
  {
    src: '/images/community/agriculture/1.jpg',
    caption: 'Organic farming',
    captionHe: 'חקלאות אורגנית',
    span: '',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_25.jpg',
    caption: 'Cultural celebration',
    captionHe: 'חגיגה תרבותית',
    span: '',
  },
  {
    src: '/images/community/food/1.jpg',
    caption: 'Plant-based cuisine',
    captionHe: 'מטבח צמחוני',
    span: '',
  },
  {
    src: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_35.jpg',
    caption: 'Village life',
    captionHe: 'חיי הכפר',
    span: '',
  },
];

/* -------------------------------------------------------------------------- */
/*  Value cards                                                               */
/* -------------------------------------------------------------------------- */

const valueCards = [
  {
    icon: Leaf,
    titleEn: 'Plant-Based',
    titleHe: 'צמחוני',
    descEn: '100% vegan products from our community',
    descHe: 'מוצרים טבעוניים 100% מהקהילה שלנו',
    color: 'text-kfar-mint',
    bg: 'bg-kfar-mint/8',
    border: 'border-kfar-mint/20',
  },
  {
    icon: Users,
    titleEn: 'Community First',
    titleHe: 'קהילה ראשית',
    descEn: 'Supporting local families & artisans',
    descHe: 'תמיכה במשפחות ובאומנים מקומיים',
    color: 'text-kfar-gold-dark',
    bg: 'bg-kfar-gold/8',
    border: 'border-kfar-gold/20',
  },
  {
    icon: Heart,
    titleEn: 'African Heritage',
    titleHe: 'מורשת אפריקאית',
    descEn: '50+ years preserving culture & tradition',
    descHe: '50+ שנים של שימור תרבות ומסורת',
    color: 'text-earth-flame',
    bg: 'bg-earth-flame/8',
    border: 'border-earth-flame/20',
  },
  {
    icon: Sun,
    titleEn: 'Healthy Living',
    titleHe: 'חיים בריאים',
    descEn: 'Wholesome foods for body & spirit',
    descHe: 'מזונות מזינים לגוף ולנפש',
    color: 'text-sun-gold',
    bg: 'bg-sun-gold/8',
    border: 'border-sun-gold/20',
  },
];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CommunityStory() {
  const { language, isRTL } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="py-12 sm:py-20 lg:py-24 bg-kfar-warm-white relative overflow-hidden"
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #C4A265 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kfar-mint/10 text-kfar-mint text-xs font-semibold mb-4 border border-kfar-mint/20">
            <Heart className="w-3.5 h-3.5 stroke-[1.5]" />
            {language === 'he' ? 'הסיפור שלנו' : 'Our Story'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-soil-brown leading-tight">
            {language === 'he' ? (
              <>
                +50 שנות
                <span className="text-leaf-green"> קהילה</span>
              </>
            ) : (
              <>
                50+ Years of
                <span className="text-leaf-green"> Community</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {language === 'he'
              ? 'כפר השלום בדימונה הוא ביתם של העברים האפריקאים מאז 1969. קהילה צמחונית, מלאת חיים ומורשת עשירה -- עכשיו גם אונליין.'
              : 'The Village of Peace in Dimona has been home to the African Hebrew Israelites since 1969. A vibrant, plant-based community with rich heritage -- now online.'}
          </p>
        </motion.div>

        {/* Photo masonry grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-14 sm:mb-16 auto-rows-[140px] sm:auto-rows-[180px]"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {communityPhotos.map((photo, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${photo.span}`}
            >
              <Image
                src={photo.src}
                alt={language === 'he' ? photo.captionHe : photo.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={60}
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Hover caption overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                <span className="text-white text-sm font-medium">
                  {language === 'he' ? photo.captionHe : photo.caption}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Value cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {valueCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={shouldReduceMotion ? {} : { y: -4, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.08)' }}
                className={`rounded-2xl ${card.bg} border ${card.border} p-5 sm:p-6 transition-shadow`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className={`w-5 h-5 ${card.color} stroke-[1.5]`} />
                </div>
                <h3 className="font-bold text-soil-brown text-sm sm:text-base mb-1">
                  {language === 'he' ? card.titleHe : card.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {language === 'he' ? card.descHe : card.descEn}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link href="/about">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-kfar-gold text-kfar-gold-dark font-semibold hover:bg-kfar-gold/10 transition-colors cursor-pointer"
            >
              {language === 'he' ? 'למדו עוד על הקהילה שלנו' : 'Learn More About Our Community'}
              <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
