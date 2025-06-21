'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { 
      href: '/', 
      icon: 'fa-home', 
      label: 'Home',
      activeOn: ['/']
    },
    { 
      href: '/marketplace', 
      icon: 'fa-store', 
      label: 'Marketplace',
      activeOn: ['/marketplace', '/store/']
    },
    { 
      href: '/shop', 
      icon: 'fa-th', 
      label: 'Shop',
      activeOn: ['/shop', '/product/']
    },
    { 
      href: '/cart', 
      icon: 'fa-shopping-cart', 
      label: 'Cart', 
      badge: totalItems,
      activeOn: ['/cart', '/checkout']
    },
    { 
      href: '/account', 
      icon: 'fa-user', 
      label: 'Account',
      activeOn: ['/account']
    }
  ];

  // Determine active state more intelligently
  const isActive = (item: typeof navItems[0]) => {
    return item.activeOn.some(path => {
      if (path.endsWith('/')) {
        return pathname.startsWith(path.slice(0, -1));
      }
      return pathname === path;
    });
  };

  // Don't show on certain pages
  const hideOnPages = ['/vendor/', '/admin'];
  const shouldHide = hideOnPages.some(page => pathname.includes(page));
  
  if (shouldHide) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all ${
                active 
                  ? 'text-[#478c0b] scale-105' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <i className={`fas ${item.icon} text-xl mb-1 ${
                  active ? 'font-bold' : ''
                }`}></i>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#c23c09] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
              {active && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#478c0b]" />
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#478c0b]" />
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}