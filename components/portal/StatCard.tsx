'use client';

import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; label: string };
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'purple' | 'emerald';
  className?: string;
}

const colorMap = {
  green: { bg: 'bg-[#2D5A27]/10', icon: 'text-[#2D5A27]', trend: 'text-emerald-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', trend: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', trend: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', trend: 'text-purple-600' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', trend: 'text-emerald-600' },
};

export default function StatCard({ title, value, prefix = '', suffix = '', trend, icon, color = 'green', className }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorMap[color];

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2, ease: 'easeOut' as const,
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  const formattedValue = value >= 1000
    ? `${prefix}${displayValue.toLocaleString()}${suffix}`
    : `${prefix}${displayValue}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2, ease: 'easeOut' as const }}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-6 cursor-pointer transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
          <span className={colors.icon}>{icon}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
        {trend && (
          <div className="flex items-center gap-1.5">
            {trend.value >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 stroke-[1.5]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500 stroke-[1.5]" />
            )}
            <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-400">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
