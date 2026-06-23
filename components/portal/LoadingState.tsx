'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  type?: 'cards' | 'table' | 'page';
  count?: number;
  className?: string;
  message?: string;
}

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gray-200 rounded animate-pulse', className)} />
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <ShimmerBar className="h-4 w-24" />
        <ShimmerBar className="h-10 w-10 rounded-lg" />
      </div>
      <ShimmerBar className="h-8 w-32" />
      <ShimmerBar className="h-3 w-20" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex gap-6">
        {['w-[120px]', 'w-[80px]', 'w-[100px]', 'w-[60px]', 'w-[80px]'].map((w, i) => (
          <ShimmerBar key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-gray-50 flex gap-6 items-center">
          <ShimmerBar className="h-4 w-28" />
          <ShimmerBar className="h-4 w-20" />
          <ShimmerBar className="h-4 w-24" />
          <ShimmerBar className="h-6 w-16 rounded-full" />
          <ShimmerBar className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerBar className="h-7 w-48" />
          <ShimmerBar className="h-4 w-32" />
        </div>
        <ShimmerBar className="h-10 w-28 rounded-lg" />
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      {/* Table */}
      <TableSkeleton rows={5} />
    </div>
  );
}

export default function LoadingState({ type = 'page', count = 4, className, message }: LoadingStateProps) {
  return (
    <div className={cn('', className)}>
      {message && <p className="sr-only">{message}</p>}
      {type === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      {type === 'table' && <TableSkeleton rows={count} />}
      {type === 'page' && <PageSkeleton />}
    </div>
  );
}
