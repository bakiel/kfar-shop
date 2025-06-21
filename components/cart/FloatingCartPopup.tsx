'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FloatingCartPopupProps {
  items: any[];
  onClose: () => void;
}

export default function FloatingCartPopup({ items, onClose }: FloatingCartPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const recentItems = items.slice(-3).reverse(); // Show last 3 added items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-96' : 'w-80'
        }`}
        style={{ border: '3px solid #478c0b' }}
      >
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <i className="fas fa-shopping-cart text-2xl"></i>
                <span className="absolute -top-2 -right-2 bg-white text-[#c23c09] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="font-bold">Cart Updated!</p>
                <p className="text-sm opacity-90">₪{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${isExpanded ? 'max-h-96' : 'max-h-48'} overflow-y-auto transition-all duration-300`}>
          <div className="p-4 space-y-3">
            {recentItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="flex items-center gap-3 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name || "Image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.vendorName}</p>
                  <p className="text-xs text-gray-600">
                    {item.quantity} × ₪{item.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: '#478c0b' }}>
                    ₪{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            
            {items.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{items.length - 3} more items in cart
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Link
              href="/cart"
              className="flex-1 text-center px-4 py-2 border-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              style={{ borderColor: '#478c0b', color: '#478c0b' }}
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              className="flex-1 text-center px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all"
              style={{ backgroundColor: '#478c0b' }}
            >
              Checkout
            </Link>
          </div>
        </div>

        {/* Success Animation */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-bounce">
            <i className="fas fa-check mr-1"></i>
            Added to cart!
          </div>
        </div>
      </div>
    </div>
  );
}