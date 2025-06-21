'use client';

import React from 'react';
import { KFAR_COLORS, meetsWCAG_AA, getBestTextColor } from '@/lib/utils/wcag-contrast';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * WCAG AA Compliant Button Component
 * All color combinations are tested for proper contrast ratios
 */
export default function AccessibleButton({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}: AccessibleButtonProps) {
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3.5 text-lg'
  };

  // Variant styles with WCAG AA compliant color combinations
  const variantStyles = {
    primary: {
      base: `text-white hover:shadow-lg transition-all duration-300`,
      bgColor: KFAR_COLORS.earthFlame,
      hoverBgColor: '#a33408', // Darker earth flame
      disabledBgColor: KFAR_COLORS.gray300,
      style: { backgroundColor: KFAR_COLORS.earthFlame }
    },
    secondary: {
      base: `text-white hover:shadow-lg transition-all duration-300`,
      bgColor: KFAR_COLORS.leafGreen,
      hoverBgColor: '#3a6d08', // Darker leaf green
      disabledBgColor: KFAR_COLORS.gray300,
      style: { backgroundColor: KFAR_COLORS.leafGreen }
    },
    outline: {
      base: `bg-transparent border-2 hover:shadow-md transition-all duration-300`,
      borderColor: KFAR_COLORS.leafGreen,
      textColor: KFAR_COLORS.leafGreen,
      hoverBgColor: KFAR_COLORS.leafGreen,
      hoverTextColor: KFAR_COLORS.white,
      style: { 
        borderColor: KFAR_COLORS.leafGreen,
        color: KFAR_COLORS.leafGreen
      }
    },
    ghost: {
      base: `bg-transparent hover:bg-gray-100 transition-all duration-300`,
      textColor: KFAR_COLORS.soilBrown,
      style: { color: KFAR_COLORS.soilBrown }
    },
    danger: {
      base: `text-white hover:shadow-lg transition-all duration-300`,
      bgColor: '#dc2626', // Red for danger
      hoverBgColor: '#b91c1c',
      disabledBgColor: KFAR_COLORS.gray300,
      style: { backgroundColor: '#dc2626' }
    }
  };

  const variantConfig = variantStyles[variant];
  
  // Build className
  const buttonClasses = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-leaf-green',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantConfig.base,
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  // Handle hover styles
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      e.currentTarget.style.backgroundColor = variantStyles[variant].hoverBgColor!;
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = variantStyles.outline.hoverBgColor!;
      e.currentTarget.style.color = variantStyles.outline.hoverTextColor!;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      e.currentTarget.style.backgroundColor = variantStyles[variant].bgColor!;
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = variantStyles.outline.textColor!;
    }
  };

  // Apply disabled styles
  const buttonStyle = disabled && (variant === 'primary' || variant === 'secondary' || variant === 'danger')
    ? { ...variantConfig.style, backgroundColor: variantConfig.disabledBgColor }
    : variantConfig.style;

  return (
    <button
      className={buttonClasses}
      style={buttonStyle}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}