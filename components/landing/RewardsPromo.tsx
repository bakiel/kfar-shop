'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Gift, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { Promotion } from '@/lib/types/landing';

interface RewardsPromoProps {
  promotions?: Promotion[];
}

export default function RewardsPromo({ promotions }: RewardsPromoProps) {
  const { t, language, isRTL } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const activePromotion = promotions?.find((p) => p.isActive);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const cards = [
    {
      id: 'first-purchase',
      icon: Gift,
      accentColor: 'kfar-gold',
      badgeBg: 'bg-kfar-gold/15',
      badgeText: 'text-kfar-gold-dark',
      iconBg: 'bg-kfar-gold/10',
      iconColor: 'text-kfar-gold-dark',
      borderHover: 'hover:border-kfar-gold/30',
      title: t('First Purchase Reward'),
      description: t('Get 50 bonus points on your first order'),
      badge: language === 'he' ? '50 נקודות' : '50 Points',
    },
    {
      id: 'founding-member',
      icon: Users,
      accentColor: 'leaf-green',
      badgeBg: 'bg-leaf-green/15',
      badgeText: 'text-leaf-green-dark',
      iconBg: 'bg-leaf-green/10',
      iconColor: 'text-leaf-green-dark',
      borderHover: 'hover:border-leaf-green/30',
      title: t('Founding Members Earn Double Points'),
      description:
        language === 'he'
          ? '100 החברים הראשונים מרוויחים נקודות כפולות'
          : 'First 100 members earn double loyalty points',
      badge: language === 'he' ? 'x2 נקודות' : '2x Points',
    },
    activePromotion
      ? {
          id: activePromotion.id,
          icon: Sparkles,
          accentColor: 'earth-flame',
          badgeBg: 'bg-earth-flame/15',
          badgeText: 'text-earth-flame-dark',
          iconBg: 'bg-earth-flame/10',
          iconColor: 'text-earth-flame',
          borderHover: 'hover:border-earth-flame/30',
          title:
            language === 'he' && activePromotion.titleHe
              ? activePromotion.titleHe
              : activePromotion.title,
          description:
            language === 'he' && activePromotion.descriptionHe
              ? activePromotion.descriptionHe
              : activePromotion.description,
          badge:
            language === 'he' && activePromotion.badgeTextHe
              ? activePromotion.badgeTextHe
              : activePromotion.badgeText || (language === 'he' ? 'מבצע' : 'Promo'),
        }
      : {
          id: 'join-earn',
          icon: Sparkles,
          accentColor: 'earth-flame',
          badgeBg: 'bg-earth-flame/15',
          badgeText: 'text-earth-flame-dark',
          iconBg: 'bg-earth-flame/10',
          iconColor: 'text-earth-flame',
          borderHover: 'hover:border-earth-flame/30',
          title: language === 'he' ? 'הצטרף וצבור' : 'Join & Earn',
          description:
            language === 'he'
              ? 'צבור נקודות על כל רכישה והמר אותן להנחות'
              : 'Earn points on every purchase and redeem for discounts',
          badge: language === 'he' ? 'חדש!' : 'New!',
        },
  ];

  return (
    <section
      ref={ref}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative overflow-hidden py-16 sm:py-20"
    >
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-kfar-cream via-kfar-warm-white to-kfar-cream" />
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #C4A265 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-soil-brown font-display">
            {t('Earn Rewards')}
          </h2>
          <p className="mt-2 text-gray-600 text-base sm:text-lg max-w-xl mx-auto">
            {language === 'he'
              ? 'צברו נקודות, קבלו הנחות וחסכו עם כל רכישה'
              : 'Earn points, unlock discounts, and save with every purchase'}
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`bg-white rounded-xl p-6 border border-gray-100 ${card.borderHover} transition-colors cursor-pointer`}
              >
                {/* Badge */}
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${card.badgeBg} ${card.badgeText} mb-4`}
                >
                  {card.badge}
                </span>

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} mb-4`}
                >
                  <Icon className={`w-6 h-6 ${card.iconColor} stroke-[1.5]`} />
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
          className="mt-10 text-center"
        >
          <Link href="/customer/login">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(71, 140, 11, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-leaf-green text-white font-bold text-base sm:text-lg rounded-xl shadow-md cursor-pointer"
            >
              {t('Create Account')}
              <ArrowRight
                className={`w-5 h-5 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`}
              />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
