'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type StatusVariant = 'pending' | 'active' | 'processing' | 'completed' | 'cancelled' | 'draft' | 'shipped' | 'delivered' | 'refunded' | 'inactive';

const statusConfig: Record<StatusVariant, { dot: string; bg: string; text: string; labelEn: string; labelHe: string }> = {
  pending: { dot: 'bg-amber-400', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', labelEn: 'Pending', labelHe: 'ממתין' },
  active: { dot: 'bg-emerald-400', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', labelEn: 'Active', labelHe: 'פעיל' },
  processing: { dot: 'bg-blue-400', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', labelEn: 'Processing', labelHe: 'בעיבוד' },
  completed: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', labelEn: 'Completed', labelHe: 'הושלם' },
  cancelled: { dot: 'bg-red-400', bg: 'bg-red-50 border-red-200', text: 'text-red-700', labelEn: 'Cancelled', labelHe: 'בוטל' },
  draft: { dot: 'bg-gray-400', bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', labelEn: 'Draft', labelHe: 'טיוטה' },
  shipped: { dot: 'bg-indigo-400', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', labelEn: 'Shipped', labelHe: 'נשלח' },
  delivered: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', labelEn: 'Delivered', labelHe: 'נמסר' },
  refunded: { dot: 'bg-orange-400', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', labelEn: 'Refunded', labelHe: 'הוחזר' },
  inactive: { dot: 'bg-gray-300', bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', labelEn: 'Inactive', labelHe: 'לא פעיל' },
};

interface StatusBadgeProps {
  status: StatusVariant;
  language?: 'en' | 'he';
  customLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, language = 'en', customLabel, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const label = customLabel || (language === 'he' ? config.labelHe : config.labelEn);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className={cn('rounded-full', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {label}
    </span>
  );
}
