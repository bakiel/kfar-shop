'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { X, Store, ShieldCheck, User, UserCircle, Languages, ChevronDown } from 'lucide-react';
import { useUserRole, useVendorOrderCount } from '@/hooks/useUserRole';
import { getMenuConfig } from '@/lib/config/menu-config';
import { usePathname } from 'next/navigation';
import { FaIcon } from '@/lib/utils/icon-map';

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDropdownFixed: React.FC<MenuDropdownProps> = ({ isOpen, onClose }) => {
  const { role } = useUserRole();
  const orderCount = useVendorOrderCount();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');
  const [mounted, setMounted] = useState(false);
  const menuSections = getMenuConfig(role, orderCount);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('kfar-language') || 'en';
    setLanguage(savedLang);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    // Delay to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleItemClick = (item: any) => {
    if (item.action) {
      item.action();
    }
    onClose();
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    setLanguage(newLang);
    localStorage.setItem('kfar-language', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    window.location.reload();
  };

  // Don't render anything if not mounted (SSR safety)
  if (!mounted) return null;

  const getRoleIcon = () => {
    switch (role) {
      case 'vendor': return <Store className="w-5 h-5 stroke-[1.5]" />;
      case 'admin': return <ShieldCheck className="w-5 h-5 stroke-[1.5]" />;
      case 'customer': return <User className="w-5 h-5 stroke-[1.5]" />;
      default: return <UserCircle className="w-5 h-5 stroke-[1.5]" />;
    }
  };

  // Portal content
  const menuContent = (
    <div
      className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Menu Header */}
        <div className="p-6 text-white" style={{ background: 'linear-gradient(to right, #478c0b, #f6af0d)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {getRoleIcon()}
            </div>
            <div>
              <p className="font-medium">
                {role === 'guest' ? 'Welcome Guest' :
                 role === 'vendor' ? 'Vendor Portal' :
                 role === 'admin' ? 'Admin Panel' :
                 'Customer Account'}
              </p>
              <p className="text-sm opacity-90">
                {role === 'guest' ? 'Sign in for more features' : `Logged in as ${role}`}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.id} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Title */}
              <div className="px-6 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  {section.icon && <FaIcon icon={section.icon} className="w-3 h-3 stroke-[1.5]" />}
                  {language === 'he' && section.titleHe ? section.titleHe : section.title}
                </h3>
              </div>

              {/* Section Items */}
              <div className="px-3">
                {section.items.map((item) => (
                  <div key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
                        onClick={() => onClose()}
                      >
                        {item.icon && (
                          <FaIcon icon={item.icon} className="w-4 h-4 stroke-[1.5] text-gray-600 group-hover:text-leaf-green transition-colors" />
                        )}
                        <span className="flex-1 text-gray-700 group-hover:text-leaf-green transition-colors">
                          {language === 'he' && item.labelHe ? item.labelHe : item.label}
                        </span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group text-left"
                      >
                        {item.icon && (
                          <FaIcon icon={item.icon} className="w-4 h-4 stroke-[1.5] text-gray-600 group-hover:text-leaf-green transition-colors" />
                        )}
                        <span className="flex-1 text-gray-700 group-hover:text-leaf-green transition-colors">
                          {language === 'he' && item.labelHe ? item.labelHe : item.label}
                        </span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Settings Section - Always at bottom */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="px-6 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Preferences
              </h3>

              {/* Language Toggle */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Language</span>
                <button
                  onClick={handleLanguageToggle}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Languages className="w-4 h-4 stroke-[1.5]" />
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'EN' : 'עב'}
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Currency</span>
                <div className="relative">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="text-sm px-3 py-1.5 pr-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border-0 focus:ring-2 focus:ring-leaf-green cursor-pointer appearance-none"
                  >
                    <option value="ILS">₪ ILS</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                  <ChevronDown className="w-3 h-3 stroke-[1.5] absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* Account Access */}
          <Link
            href="/login-portal"
            onClick={onClose}
            className="flex items-center justify-center gap-3 w-full mb-4 px-4 py-3 rounded-lg border transition-all duration-300 hover:shadow-lg relative"
            style={{
              borderColor: '#f6af0d',
              backgroundColor: 'rgba(246, 175, 13, 0.05)',
              color: '#3a3a1d'
            }}
          >
            <UserCircle className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
            <span className="font-medium">Account Access</span>
          </Link>

          <div className="text-center text-xs text-gray-500">
            <p>KFAR Marketplace</p>
            <p className="mt-1">Village of Peace, Dimona</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render at document body level
  return ReactDOM.createPortal(
    menuContent,
    document.body
  );
};

export default MenuDropdownFixed;
