'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { X, Store, ShoppingCart, Mic, Share2 } from 'lucide-react';

interface CompactFloatingMenuProps {
  onCartClick: () => void;
}

export default function CompactFloatingMenu({ onCartClick }: CompactFloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Africa Logo Button - Positioned with safe distance from footer */}
      <motion.button
        type="button"
        aria-label="Open KFAR quick actions"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(true)}
        className="fixed right-4 bottom-24 z-40 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center relative border-2 border-[#478c0b]"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Image
          src="/images/logos/kfar_icon_africa_gold.png"
          alt="KFar Menu"
          width={32}
          height={32}
          className="object-contain"
        />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#c23c09] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
            {cartCount}
          </span>
        )}
      </motion.button>

      {/* Modal Popup */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Centered Modal */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-6 pointer-events-auto">
                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close quick actions"
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 stroke-[1.5] text-gray-600" />
                </button>

                {/* Menu Title */}
                <h3 className="text-center font-bold text-gray-800 mb-4">Quick Actions</h3>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Store */}
                  <Link href="/marketplace">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 p-4 bg-[#f6af0d]/10 rounded-2xl"
                    >
                      <div className="w-14 h-14 bg-[#f6af0d] rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 stroke-[1.5] text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Store</span>
                    </motion.button>
                  </Link>

                  {/* Cart */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onCartClick();
                      setIsExpanded(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-[#478c0b]/10 rounded-2xl relative"
                  >
                    <div className="w-14 h-14 bg-[#478c0b] rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 stroke-[1.5] text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute top-2 right-2 bg-[#c23c09] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Voice Chat */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Dispatch event to open voice chat
                      const event = new CustomEvent('open-voice-chat');
                      window.dispatchEvent(event);
                      setIsExpanded(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-[#c23c09]/10 rounded-2xl"
                  >
                    <div className="w-14 h-14 bg-[#c23c09] rounded-full flex items-center justify-center">
                      <Mic className="w-6 h-6 stroke-[1.5] text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Voice</span>
                  </motion.button>

                  {/* Share */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Check out this product',
                          url: window.location.href
                        });
                      }
                      setIsExpanded(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-100 rounded-2xl"
                  >
                    <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center">
                      <Share2 className="w-6 h-6 stroke-[1.5] text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Share</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
