'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';

interface MobileCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCartDrawer({ isOpen, onClose }: MobileCartDrawerProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
            Your Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600 text-center mb-4">Your cart is empty</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#478c0b] text-white rounded-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name || "Image"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1" style={{ color: '#3a3a1d' }}>
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">{item.vendorName}</p>
                      
                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <i className="fas fa-minus text-xs"></i>
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <i className="fas fa-plus text-xs"></i>
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: '#478c0b' }}>
                            ₪{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold" style={{ color: '#c23c09' }}>
                ₪{getCartTotal().toFixed(2)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-[#478c0b] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}