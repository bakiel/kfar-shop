'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUserRole, useVendorOrderCount } from '@/hooks/useUserRole';
import { getMenuConfig } from '@/lib/config/menu-config';
import { usePathname } from 'next/navigation';

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDropdownSimple: React.FC<MenuDropdownProps> = ({ isOpen, onClose }) => {
  const { role } = useUserRole();
  const orderCount = useVendorOrderCount();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');
  const menuSections = getMenuConfig(role, orderCount);

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('kfar-language') || 'en';
    setLanguage(savedLang);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-[9998]"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-[9999] overflow-hidden flex flex-col transform transition-transform duration-300"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
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
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`fas ${
                role === 'vendor' ? 'fa-store' : 
                role === 'admin' ? 'fa-user-shield' : 
                role === 'customer' ? 'fa-user' : 
                'fa-user-circle'
              } text-xl`}></i>
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
                  {section.icon && <i className={`fas ${section.icon} text-xs`}></i>}
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
                          <i className={`fas ${item.icon} w-5 text-center text-gray-600 group-hover:text-leaf-green transition-colors`}></i>
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
                          <i className={`fas ${item.icon} w-5 text-center text-gray-600 group-hover:text-leaf-green transition-colors`}></i>
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
                  <i className="fas fa-language text-sm"></i>
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
                  <i className="fas fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-center text-xs text-gray-500">
            <p>KFAR Marketplace</p>
            <p className="mt-1">Village of Peace, Dimona</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuDropdownSimple;