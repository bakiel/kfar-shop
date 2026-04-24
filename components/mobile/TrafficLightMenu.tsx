'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import Image from 'next/image';
import { Mic, SlidersHorizontal, ShoppingCart } from 'lucide-react';

interface TrafficLightMenuProps {
  onFilterClick: () => void;
  onCartClick: () => void;
  onVoiceClick: () => void;
  filterCount?: number;
}

export default function TrafficLightMenu({
  onFilterClick,
  onCartClick,
  onVoiceClick,
  filterCount = 0
}: TrafficLightMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-collapse after 5 seconds
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Collapse on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isExpanded) setIsExpanded(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Menu Container - Right side (exact position of old chat button) */}
      <div className="fixed right-8 bottom-8 z-40">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* Compact Leaf Logo Button */
            <motion.button
              key="compact"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(true)}
              className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center relative border-2 border-[#478c0b]"
            >
              <Image
                src="/images/logos/kfar_eats_icon_leaf_green_vertical.png"
                alt="KFar Menu"
                width={36}
                height={36}
                className="object-contain"
              />
              {/* Total indicators */}
              {(cartCount + filterCount) > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c23c09] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {cartCount + filterCount}
                </span>
              )}
            </motion.button>
          ) : (
            /* Expanded Traffic Light Menu */
            <motion.div
              key="expanded"
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 20 }}
              className="flex flex-col gap-3"
            >
              {/* Voice Button (Red - Top) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  console.log('🔴 Red button clicked in leaf menu');
                  onVoiceClick();
                  setIsExpanded(false);
                }}
                className="w-14 h-14 bg-[#c23c09] text-white rounded-full shadow-lg flex items-center justify-center relative"
              >
                <Mic className="w-5 h-5 stroke-[1.5]" />
              </motion.button>

              {/* Filter Button (Yellow - Middle) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onFilterClick();
                  setIsExpanded(false);
                }}
                className="w-14 h-14 bg-[#f6af0d] text-white rounded-full shadow-lg flex items-center justify-center relative"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.5]" />
                {filterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c23c09] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {filterCount}
                  </span>
                )}
              </motion.button>

              {/* Cart Button (Green - Bottom) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onCartClick();
                  setIsExpanded(false);
                }}
                className="w-14 h-14 bg-[#478c0b] text-white rounded-full shadow-lg flex items-center justify-center relative"
              >
                <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c23c09] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              {/* Close hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -left-20 top-1/2 -translate-y-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap"
              >
                Tap to close
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}