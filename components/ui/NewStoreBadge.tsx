'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface NewStoreBadgeProps {
  createdAt: string | Date;
  variant?: 'default' | 'small' | 'large' | 'corner' | 'banner';
  showText?: boolean;
  className?: string;
}

export default function NewStoreBadge({ 
  createdAt, 
  variant = 'default',
  showText = true,
  className = ''
}: NewStoreBadgeProps) {
  // Check if store was created within last 30 days
  const isNewStore = () => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  };

  if (!isNewStore()) {
    return null;
  }

  // Calculate days since opening
  const daysSinceOpening = () => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = daysSinceOpening();

  // Corner badge variant - Triangle style
  if (variant === 'corner') {
    return (
      <div className="absolute top-0 right-0">
        <div className="relative">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            className="absolute top-0 right-0"
          >
            <polygon
              points="0,0 80,0 80,80"
              fill="url(#corner-gradient)"
            />
            <defs>
              <linearGradient id="corner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-3 right-3 text-white font-bold text-xs transform rotate-45 origin-center">
            NEW
          </div>
        </div>
      </div>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <p className="text-center font-semibold">
              🎉 New Store Alert! 
              {days === 0 
                ? ' Just opened today!' 
                : ` Open for ${days} days - welcome them to KFAR!`
              }
            </p>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Size variants for regular badges
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 
        bg-gradient-to-r from-red-600 to-orange-600 
        text-white font-semibold rounded-full
        shadow-lg animate-pulse
        ${sizeClasses[variant as keyof typeof sizeClasses] || sizeClasses.default}
        ${className}
      `}
      style={{
        animationDuration: '2s'
      }}
    >
      <Sparkles className={iconSizes[variant as keyof typeof iconSizes] || iconSizes.default} />
      {showText && (
        <span>
          {days === 0 ? 'NEW!' : days === 1 ? 'NEW (1 day)' : `NEW (${days} days)`}
        </span>
      )}
    </div>
  );
}

// Export standalone corner badge component - Simple triangle version
export function NewStoreCornerBadge({ createdAt }: { createdAt: string | Date }) {
  const isNewStore = () => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  };

  if (!isNewStore()) {
    return null;
  }

  return (
    <div 
      className="absolute top-0 right-0 w-0 h-0"
      style={{
        borderStyle: 'solid',
        borderWidth: '0 60px 60px 0',
        borderColor: 'transparent #dc2626 transparent transparent',
      }}
    >
      <span 
        className="absolute text-white text-xs font-bold"
        style={{
          top: '12px',
          right: '-45px',
          transform: 'rotate(45deg)',
        }}
      >
        NEW
      </span>
    </div>
  );
}

// Export banner component
export function NewStoreBanner({ createdAt, storeName }: { createdAt: string | Date; storeName: string }) {
  const isNewStore = () => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  };

  if (!isNewStore()) {
    return null;
  }

  const daysSinceOpening = () => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const days = daysSinceOpening();

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <p className="text-center font-semibold">
            🎉 Welcome {storeName} to KFAR Marketplace! 
            {days === 0 
              ? ' They just opened today!' 
              : ` They're new here (${days} days old) - show them some love!`
            }
          </p>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}