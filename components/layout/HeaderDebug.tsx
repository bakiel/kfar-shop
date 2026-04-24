'use client';

import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';

export default function HeaderDebug() {
  const pathname = usePathname();
  const { items } = useCart();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-xl font-bold" style={{ color: '#478c0b' }}>
            KFAR Debug
          </a>
          <span className="text-sm text-gray-600">Path: {pathname}</span>
        </div>
        
        <nav className="flex items-center gap-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/marketplace" className="hover:underline">Marketplace</a>
          <a href="/shop" className="hover:underline">Shop</a>
          <a href="/cart" className="hover:underline">
            Cart ({items.length})
          </a>
        </nav>
      </div>
    </header>
  );
}