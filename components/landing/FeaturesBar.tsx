'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { QrCode, Mic, Truck, Star } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

const features = [
  { icon: QrCode, labelKey: 'QR Code Shopping' },
  { icon: Mic, labelKey: 'Voice Shopping' },
  { icon: Truck, labelKey: 'Free Delivery' },
  { icon: Star, labelKey: 'Loyalty Points' },
] as const;

export default function FeaturesBar() {
  const { t, isRTL } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section
      ref={ref}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-white border-t border-b border-gray-100"
    >
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.labelKey}
                variants={itemVariants}
                className="flex flex-col items-center gap-2 py-2"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-leaf-green/10">
                  <Icon className="w-5 h-5 text-leaf-green stroke-[1.5]" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                  {t(feature.labelKey)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
