'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { Gift, Star, Trophy, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface PointTransaction {
  id: string;
  date: string;
  description: string;
  descriptionHe: string;
  points: string;
  balance: string;
  type: string;
  [key: string]: unknown;
}

const mockTransactions: PointTransaction[] = [
  { id: 'PT-001', date: '2025-02-06', description: 'Purchase - Teva Deli', descriptionHe: 'רכישה - טבע דלי', points: '+45', balance: '2,450', type: 'earned' },
  { id: 'PT-002', date: '2025-02-03', description: 'Review bonus', descriptionHe: 'בונוס ביקורת', points: '+50', balance: '2,405', type: 'earned' },
  { id: 'PT-003', date: '2025-01-29', description: 'Coupon redeemed', descriptionHe: 'קופון מומש', points: '-200', balance: '2,355', type: 'redeemed' },
  { id: 'PT-004', date: '2025-01-24', description: "Purchase - Queen's Cuisine", descriptionHe: 'רכישה - המטבח של המלכה', points: '+95', balance: '2,555', type: 'earned' },
  { id: 'PT-005', date: '2025-01-19', description: 'Referral bonus', descriptionHe: 'בונוס הפניה', points: '+500', balance: '2,460', type: 'earned' },
  { id: 'PT-006', date: '2025-01-12', description: 'Purchase - Garden of Light', descriptionHe: 'רכישה - גן האור', points: '+30', balance: '1,960', type: 'earned' },
  { id: 'PT-007', date: '2025-01-07', description: 'Free shipping redeemed', descriptionHe: 'משלוח חינם מומש', points: '-150', balance: '1,930', type: 'redeemed' },
  { id: 'PT-008', date: '2025-01-02', description: 'Purchase - People Store', descriptionHe: 'רכישה - חנות העם', points: '+80', balance: '2,080', type: 'earned' },
  { id: 'PT-009', date: '2024-12-28', description: 'Birthday bonus', descriptionHe: 'בונוס יום הולדת', points: '+200', balance: '2,000', type: 'earned' },
  { id: 'PT-010', date: '2024-12-20', description: 'Purchase - Gahn Delight', descriptionHe: 'רכישה - גן תענוג', points: '+55', balance: '1,800', type: 'earned' },
];

const tiers = [
  { name: 'Bronze', nameHe: 'ברונזה', min: 0, max: 499, color: '#CD7F32', bgColor: '#CD7F32' },
  { name: 'Silver', nameHe: 'כסף', min: 500, max: 1499, color: '#A0A0A0', bgColor: '#A0A0A0' },
  { name: 'Gold', nameHe: 'זהב', min: 1500, max: 4999, color: '#C4A265', bgColor: '#C4A265' },
  { name: 'Platinum', nameHe: 'פלטינה', min: 5000, max: Infinity, color: '#478c0b', bgColor: '#478c0b' },
];

const CURRENT_POINTS = 2450;
const CURRENT_TIER_INDEX = 2; // Gold

export default function CustomerRewards() {
  const { language, t, isRTL } = useLanguage();
  const [displayPoints, setDisplayPoints] = useState(0);

  // Animate points counter on mount
  useEffect(() => {
    const controls = animate(0, CURRENT_POINTS, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayPoints(Math.round(v)),
    });
    return () => controls.stop();
  }, []);

  const currentTier = tiers[CURRENT_TIER_INDEX];
  const nextTier = tiers[CURRENT_TIER_INDEX + 1];
  const progressPercent = nextTier
    ? ((CURRENT_POINTS - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const columns: Column<PointTransaction>[] = [
    {
      key: 'date',
      header: isRTL ? 'תאריך' : 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'description',
      header: isRTL ? 'תיאור' : 'Description',
      render: (row) => (
        <span className="text-sm font-medium text-gray-800">
          {isRTL ? row.descriptionHe : row.description}
        </span>
      ),
    },
    {
      key: 'points',
      header: isRTL ? 'נקודות' : 'Points',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.type === 'earned' ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 stroke-[1.5]" />
          )}
          <span className={cn('text-sm font-semibold', row.type === 'earned' ? 'text-emerald-600' : 'text-red-600')}>
            {row.points}
          </span>
        </div>
      ),
    },
    {
      key: 'balance',
      header: isRTL ? 'יתרה' : 'Balance',
      render: (row) => (
        <span className="text-sm text-gray-700 font-medium">{row.balance}</span>
      ),
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariant}>
        <PageHeader
          title={isRTL ? 'הפרסים שלי' : 'My Rewards'}
          subtitle={isRTL ? 'צבור נקודות על כל רכישה ופתח פרסים בלעדיים' : 'Earn points on every purchase and unlock exclusive rewards'}
          breadcrumbs={[
            { label: isRTL ? 'לוח בקרה' : 'Dashboard', href: '/customer/dashboard' },
            { label: isRTL ? 'פרסים' : 'Rewards' },
          ]}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Animated Points Counter */}
      <motion.div
        variants={itemVariant}
        className="bg-white rounded-2xl border border-gray-100 p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Points Display */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTier.color}15` }}>
                <Gift className="w-6 h-6 stroke-[1.5]" style={{ color: currentTier.color }} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{isRTL ? 'נקודות זמינות' : 'Available Points'}</p>
                <motion.p
                  className="text-4xl font-bold text-gray-900"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                >
                  {displayPoints.toLocaleString()}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <TrendingUp className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
              <span className="text-sm text-emerald-600 font-medium">
                {isRTL ? '+345 נקודות החודש' : '+345 points this month'}
              </span>
            </div>
          </div>

          {/* Current Tier Badge */}
          <motion.div
            className="flex flex-col items-center p-6 rounded-2xl"
            style={{ backgroundColor: `${currentTier.color}10` }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Trophy className="w-10 h-10 mb-2 stroke-[1.5]" style={{ color: currentTier.color }} />
            <p className="text-lg font-bold" style={{ color: currentTier.color }}>
              {isRTL ? currentTier.nameHe : currentTier.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{isRTL ? 'רמה נוכחית' : 'Current Tier'}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tier Visualization */}
      <motion.div variants={itemVariant} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h3 className={cn('text-lg font-semibold text-gray-900 mb-6', isRTL && 'text-right')}>
          {isRTL ? 'רמות נאמנות' : 'Loyalty Tiers'}
        </h3>

        {/* Tier Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {tiers.map((tier, index) => (
              <div key={tier.name} className="flex flex-col items-center" style={{ flex: 1 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2',
                    index <= CURRENT_TIER_INDEX ? 'border-transparent' : 'border-gray-200 bg-gray-50'
                  )}
                  style={index <= CURRENT_TIER_INDEX ? { backgroundColor: tier.color } : {}}
                >
                  {index <= CURRENT_TIER_INDEX ? (
                    <Star className="w-5 h-5 text-white stroke-[1.5]" />
                  ) : (
                    <Star className="w-5 h-5 text-gray-300 stroke-[1.5]" />
                  )}
                </motion.div>
                <p className={cn(
                  'text-xs font-semibold',
                  index === CURRENT_TIER_INDEX ? 'text-gray-900' : 'text-gray-400'
                )}>
                  {isRTL ? tier.nameHe : tier.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {tier.max === Infinity ? `${tier.min.toLocaleString()}+` : `${tier.min.toLocaleString()}-${tier.max.toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mx-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: currentTier.color }}
            />
          </div>

          {nextTier && (
            <div className={cn('flex items-center justify-between mt-3 px-4', isRTL && 'flex-row-reverse')}>
              <p className="text-xs text-gray-500">
                {isRTL ? `${CURRENT_POINTS.toLocaleString()} נקודות` : `${CURRENT_POINTS.toLocaleString()} points`}
              </p>
              <p className="text-xs font-medium" style={{ color: nextTier.color }}>
                {isRTL
                  ? `${(nextTier.min - CURRENT_POINTS).toLocaleString()} נקודות לרמת ${nextTier.nameHe}`
                  : `${(nextTier.min - CURRENT_POINTS).toLocaleString()} points to ${nextTier.name}`
                }
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Points History Table */}
      <motion.div variants={itemVariant}>
        <div className={cn('flex items-center justify-between mb-4', isRTL && 'flex-row-reverse')}>
          <h3 className="text-lg font-semibold text-gray-900">
            {isRTL ? 'היסטוריית נקודות' : 'Points History'}
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={mockTransactions}
          searchable={true}
          searchPlaceholder={isRTL ? 'חפש בהיסטוריה...' : 'Search history...'}
          pageSize={8}
          emptyTitle={isRTL ? 'אין היסטוריית נקודות' : 'No points history'}
          emptyDescription={isRTL ? 'צבור נקודות על ידי רכישות וביקורות' : 'Earn points through purchases and reviews'}
          emptyIcon="package"
          isRTL={isRTL}
        />
      </motion.div>
    </motion.div>
  );
}
