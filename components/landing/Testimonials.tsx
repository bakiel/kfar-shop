'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

/* -------------------------------------------------------------------------- */
/*  Testimonial data                                                           */
/* -------------------------------------------------------------------------- */

const testimonials = [
  {
    nameEn: 'Ahmadiel Ben Yehuda',
    nameHe: 'אחמדיאל בן יהודה',
    roleEn: 'Community Elder',
    roleHe: 'זקן הקהילה',
    quoteEn: 'KFAR brings our village market into the digital age while keeping the community spirit alive. Every purchase supports a neighbour.',
    quoteHe: 'כפר מביא את שוק הכפר שלנו לעידן הדיגיטלי תוך שמירה על רוח הקהילה. כל רכישה תומכת בשכן.',
    avatar: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_05.jpg',
    rating: 5,
    date: '2025-01',
    borderColor: 'border-l-leaf-green',
  },
  {
    nameEn: 'Tamar Bat Israel',
    nameHe: 'תמר בת ישראל',
    roleEn: 'Home Chef',
    roleHe: 'שפית ביתית',
    quoteEn: 'The quality of plant-based food here is incredible. I order every week from Queen\'s Cuisine and it tastes exactly like home cooking.',
    quoteHe: 'האיכות של המזון הצמחוני כאן מדהימה. אני מזמינה כל שבוע ממטבח המלכה וזה בדיוק כמו בישול ביתי.',
    avatar: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_10.jpg',
    rating: 5,
    date: '2025-01',
    borderColor: 'border-l-sun-gold',
  },
  {
    nameEn: 'Gadiel Ben Israel',
    nameHe: 'גדיאל בן ישראל',
    roleEn: 'Fitness Coach',
    roleHe: 'מאמן כושר',
    quoteEn: 'As someone who cares deeply about nutrition, KFAR is a game-changer. Everything is plant-based, clean, and sourced locally.',
    quoteHe: 'כמי שדואג מאוד לתזונה, כפר הוא שינוי מהותי. הכל צמחוני, נקי, ומקומי.',
    avatar: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_15.jpg',
    rating: 5,
    date: '2024-12',
    borderColor: 'border-l-earth-flame',
  },
  {
    nameEn: 'Navah Bat Levi',
    nameHe: 'נאווה בת לוי',
    roleEn: 'Young Mother',
    roleHe: 'אם צעירה',
    quoteEn: 'Having delivery right to my door is amazing. With two little ones, KFAR saves me so much time while supporting our vendors.',
    quoteHe: 'משלוח ישירות לדלת זה מדהים. עם שני ילדים קטנים, כפר חוסך לי המון זמן תוך תמיכה בספקים שלנו.',
    avatar: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_19.jpg',
    rating: 5,
    date: '2024-12',
    borderColor: 'border-l-leaf-green',
  },
  {
    nameEn: 'Yonatan Ben David',
    nameHe: 'יונתן בן דוד',
    roleEn: 'Shop Owner',
    roleHe: 'בעל חנות',
    quoteEn: 'Since joining KFAR my customer base has grown by 40%. The platform is easy to manage and the community support is real.',
    quoteHe: 'מאז שהצטרפתי לכפר בסיס הלקוחות שלי גדל ב-40%. הפלטפורמה קלה לניהול והתמיכה הקהילתית אמיתית.',
    avatar: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_30.jpg',
    rating: 5,
    date: '2024-11',
    borderColor: 'border-l-sun-gold',
  },
  {
    nameEn: 'Emunah Bat Yah',
    nameHe: 'אמונה בת יה',
    roleEn: 'Community Organiser',
    roleHe: 'מארגנת קהילתית',
    quoteEn: 'KFAR is more than a marketplace. It\'s a lifeline connecting our community\'s producers directly to families who need them.',
    quoteHe: 'כפר הוא יותר ממרקטפלייס. זה קו חיים שמחבר את היצרנים של הקהילה ישירות למשפחות שזקוקות להם.',
    avatar: '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_40.jpg',
    rating: 5,
    date: '2024-11',
    borderColor: 'border-l-earth-flame',
  },
];

/* -------------------------------------------------------------------------- */
/*  Star rating                                                                */
/* -------------------------------------------------------------------------- */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 stroke-[1.5] ${
            i < rating ? 'fill-sun-gold text-sun-gold' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
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

export default function Testimonials() {
  const { language, isRTL } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="py-12 sm:py-20 lg:py-24 bg-white"
    >

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative quote */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-kfar-gold/10 flex items-center justify-center">
              <Quote className="w-6 h-6 text-kfar-gold stroke-[1.5]" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-soil-brown">
            {language === 'he' ? 'מה הקהילה אומרת' : 'What Our Community Says'}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
            {language === 'he'
              ? 'משפחות אמיתיות, חוויות אמיתיות'
              : 'Real families, real experiences'}
          </p>
        </motion.div>

        {/* Desktop: 3-column grid */}
        <motion.div
          className="hidden md:grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {testimonials.slice(0, 6).map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={shouldReduceMotion ? {} : { y: -4, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.08)' }}
              className={`bg-white rounded-2xl border border-gray-100 p-6 ${isRTL ? 'border-r-4' : 'border-l-4'} ${t.borderColor} transition-shadow`}
            >
              {/* Rating */}
              <StarRating rating={t.rating} />

              {/* Quote */}
              <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-4">
                &ldquo;{language === 'he' ? t.quoteHe : t.quoteEn}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-kfar-cream flex-shrink-0">
                  <Image
                    src={t.avatar}
                    alt={language === 'he' ? t.nameHe : t.nameEn}
                    fill
                    sizes="40px"
                    quality={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-soil-brown">
                    {language === 'he' ? t.nameHe : t.nameEn}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'he' ? t.roleHe : t.roleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4">
          <motion.div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className={`flex-shrink-0 w-[80vw] max-w-[320px] snap-start bg-white rounded-2xl border border-gray-100 p-5 ${isRTL ? 'border-r-4' : 'border-l-4'} ${t.borderColor}`}
              >
                <StarRating rating={t.rating} />
                <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-4">
                  &ldquo;{language === 'he' ? t.quoteHe : t.quoteEn}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-kfar-cream flex-shrink-0">
                    <Image
                      src={t.avatar}
                      alt={language === 'he' ? t.nameHe : t.nameEn}
                      fill
                      sizes="36px"
                      quality={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-soil-brown">
                      {language === 'he' ? t.nameHe : t.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">
                      {language === 'he' ? t.roleHe : t.roleEn}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
