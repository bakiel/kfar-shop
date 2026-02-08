'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message,
  fullScreen = false 
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div 
          className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin`}
          style={{ borderColor: '#478c0b', borderTopColor: 'transparent' }}
        ></div>
      </div>
      {message && (
        <p className="text-sm font-medium" style={{ color: '#3a3a1d' }}>
          {t(message)}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(254, 249, 239, 0.9)' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;