'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, FileText, ShoppingCart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyIcon = 'package' | 'file' | 'cart' | 'users';

const iconMap: Record<EmptyIcon, React.ElementType> = {
  package: Package,
  file: FileText,
  cart: ShoppingCart,
  users: Users,
};

interface EmptyStateProps {
  icon?: EmptyIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ icon = 'package', title, description, action, className }: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-5 py-2.5 bg-[#2D5A27] text-white rounded-lg text-sm font-medium hover:bg-[#234A1F] transition-colors cursor-pointer"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
