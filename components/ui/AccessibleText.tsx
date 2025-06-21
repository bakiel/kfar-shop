'use client';

import React from 'react';
import { KFAR_COLORS, getAccessibleTextStyle } from '@/lib/utils/wcag-contrast';

interface AccessibleTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  variant?: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body' | 'bodyLarge' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';
  background?: keyof typeof KFAR_COLORS;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * WCAG AA Compliant Text Component
 * Automatically adjusts text color based on background for proper contrast
 */
export default function AccessibleText({
  as,
  variant = 'body',
  color,
  background,
  className = '',
  children,
  style = {},
  ...props
}: AccessibleTextProps) {
  // Variant to element mapping
  const variantElements = {
    heading1: 'h1',
    heading2: 'h2', 
    heading3: 'h3',
    heading4: 'h4',
    body: 'p',
    bodyLarge: 'p',
    caption: 'span',
    label: 'span'
  };

  const Element = as || variantElements[variant] || 'div';

  // Typography classes based on variant
  const variantClasses = {
    heading1: 'text-4xl md:text-5xl font-bold leading-tight',
    heading2: 'text-3xl md:text-4xl font-bold leading-tight',
    heading3: 'text-2xl md:text-3xl font-semibold',
    heading4: 'text-xl md:text-2xl font-semibold',
    body: 'text-base leading-relaxed',
    bodyLarge: 'text-lg leading-relaxed',
    caption: 'text-sm',
    label: 'text-sm font-medium'
  };

  // Color styles with WCAG compliant combinations
  const colorStyles = {
    primary: { color: KFAR_COLORS.soilBrown },
    secondary: { color: KFAR_COLORS.gray600 },
    success: { color: KFAR_COLORS.leafGreen },
    warning: { color: '#d97706' }, // Amber-600 for better contrast
    danger: { color: '#dc2626' }, // Red-600
    muted: { color: KFAR_COLORS.gray500 }
  };

  // If background is specified, get accessible text color
  let textStyle = style;
  if (background) {
    const accessibleColors = getAccessibleTextStyle(background);
    textStyle = {
      ...style,
      color: color === 'secondary' ? accessibleColors.secondary : accessibleColors.primary
    };
  } else if (color) {
    textStyle = {
      ...style,
      ...colorStyles[color]
    };
  }

  const classes = [
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <Element 
      className={classes}
      style={textStyle}
      {...props}
    >
      {children}
    </Element>
  );
}

// Pre-configured heading components with proper semantics and styling
export const H1 = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="h1" variant="heading1" {...props} />
);

export const H2 = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="h2" variant="heading2" {...props} />
);

export const H3 = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="h3" variant="heading3" {...props} />
);

export const H4 = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="h4" variant="heading4" {...props} />
);

export const Body = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="p" variant="body" {...props} />
);

export const Caption = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="span" variant="caption" {...props} />
);

export const Label = (props: Omit<AccessibleTextProps, 'as' | 'variant'>) => (
  <AccessibleText as="span" variant="label" {...props} />
);