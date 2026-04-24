'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import ExtensionWarning from './ExtensionWarning';
import CartSyncBridge from './cart/CartSyncBridge';

// Dynamically import ShoppingAssistant for AI-powered shopping experience
const ShoppingAssistant = dynamic(() => import('@/components/chat/ShoppingAssistant'), {
  ssr: false,
  loading: () => null, // Clean loading - button appears when ready
});

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Show new AI ShoppingAssistant on most pages
  // Hide on admin, vendor, and checkout pages
  const showShoppingAssistant = !pathname.startsWith('/admin/') &&
                                !pathname.startsWith('/vendor/') &&
                                !pathname.startsWith('/checkout');

  return (
    <>
      {/* Persist cart as shopping list for authenticated customers (Task #3) */}
      <CartSyncBridge />
      {children}
      <ExtensionWarning />
      {/* AI Shopping Assistant (Gemini-powered) */}
      {showShoppingAssistant && <ShoppingAssistant />}
    </>
  );
}
