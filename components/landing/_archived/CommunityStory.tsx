'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Users, Leaf, Sun } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

// Real community photos from the inventory
const communityPhotos = [
  '/images/community/1.jpg',
  '/images/community/2.jpg',
  '/images/community/3.jpg',
  '/images/community/4.jpg',
  '/images/community/5.jpg',
  '/images/community/6.jpg',
  '/images/community/7.jpg',
  '/images/community/8.jpg',
];

// Values that define the community
const values = [
  {
    icon: Leaf,
    title: 'Plant-Based Living',
    titleHe: 'חיים צמחוניים',
    description: '100% vegan lifestyle for over 50 years',
    descriptionHe: 'אורח חיים טבעוני מלא למעלה מ-50 שנה',
    color: '#478c0b'
  },
  {
    icon: Heart,
    title: 'Community First',
    titleHe: 'קהילה קודמת',
    description: 'Supporting each other through cooperative economics',
    descriptionHe: 'תמיכה הדדית דרך כלכלה שיתופית',
    color: '#c23c09'
  },
  {
    icon: Sun,
    title: 'African Heritage',
    titleHe: 'מורשת אפריקאית',
    description: 'Preserving and celebrating our cultural roots',
    descriptionHe: 'שימור וחגיגת השורשים התרבותיים שלנו',
    color: '#f6af0d'
  },
  {
    icon: Users,
    title: 'Healthy Living',
    titleHe: 'חיים בריאים',
    description: 'Mind, body, and spirit in harmony',
    descriptionHe: 'נפש, גוף ורוח בהרמוניה',
    color: '#478c0b'
  },
];

const CommunityStory = () => {
  const { language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, #fef9ef 0%, #fff 50%, #f8faf5 100%)' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23478c0b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' as const }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Africa heritage badge */}
          <motion.div
            initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <div className="relative">
              <Image
                src="/images/logos/kfar_icon_africa_gold.png"
                alt="Africa Heritage"
                width={60}
                height={60}
                className="w-14 h-14"
              />
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid #f6af0d' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-soil-brown mb-6 font-display">
            {language === 'he' ? (
              <>
                <span className="block">הסיפור שלנו</span>
                <span className="block text-leaf-green">50 שנה של קהילה</span>
              </>
            ) : (
              <>
                <span className="block">Our Story</span>
                <span className="block text-leaf-green">50 Years of Community</span>
              </>
            )}
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-body leading-relaxed">
            {language === 'he'
              ? 'הקהילה העברית-אפריקאית בדימונה מייצגת חזון של חיים בריאים, קיימות וקהילתיות. כל מוצר שלנו נושא את המסורת והערכים שלנו.'
              : 'The African Hebrew Israelite community in Dimona represents a vision of healthy living, sustainability, and togetherness. Every product carries our tradition and values.'
            }
          </p>
        </motion.div>

        {/* Photo grid - masonry style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 md:mb-20">
          {communityPhotos.map((photo, index) => {
            // Create varied heights for masonry effect
            const isLarge = index === 0 || index === 5;
            const isMedium = index === 2 || index === 7;

            return (
              <motion.div
                key={photo}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.6,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                  ease: 'easeOut' as const
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                className={`relative overflow-hidden rounded-2xl cursor-pointer ${
                  isLarge ? 'row-span-2' : isMedium ? 'row-span-1' : ''
                }`}
                style={{
                  aspectRatio: isLarge ? '3/4' : '1/1',
                }}
                onMouseEnter={() => setHoveredPhoto(index)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                <Image
                  src={photo}
                  alt="Village of Peace Community"
                  fill
                  className="object-cover transition-transform duration-700"
                  style={{
                    transform: hoveredPhoto === index ? 'scale(1.1)' : 'scale(1)'
                  }}
                />

                {/* Hover overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPhoto === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Gold border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ border: '3px solid #f6af0d' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPhoto === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                  ease: 'easeOut' as const
                }}
                className="text-center group"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: `${value.color}15`,
                  }}
                  whileHover={shouldReduceMotion ? {} : {
                    scale: 1.1,
                    backgroundColor: `${value.color}25`,
                  }}
                >
                  <Icon
                    className="w-8 h-8 transition-colors duration-300"
                    style={{ color: value.color }}
                  />
                </motion.div>
                <h3 className="font-bold text-soil-brown mb-2 font-display">
                  {language === 'he' ? value.titleHe : value.title}
                </h3>
                <p className="text-sm text-gray-500 font-body">
                  {language === 'he' ? value.descriptionHe : value.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' as const }}
          className="text-center"
        >
          <Link href="/about">
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white cursor-pointer font-accent"
              style={{
                background: 'linear-gradient(135deg, #f6af0d 0%, #e09b00 100%)',
                boxShadow: '0 15px 40px -10px rgba(246, 175, 13, 0.4)'
              }}
              whileHover={shouldReduceMotion ? {} : {
                scale: 1.02,
                y: -2,
                boxShadow: '0 20px 50px -10px rgba(246, 175, 13, 0.5)'
              }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {language === 'he' ? 'למדו עוד על הקהילה' : 'Learn More About Our Community'}
              <motion.span
                className={isRTL ? 'rotate-180' : ''}
                whileHover={shouldReduceMotion ? {} : { x: 4 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityStory;
