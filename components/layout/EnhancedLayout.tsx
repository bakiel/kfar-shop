'use client';

import React from 'react';
import SimplifiedHeader from './SimplifiedHeader';
import Footer from './Footer';
import { useLanguage } from '@/lib/context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const EnhancedLayout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <SimplifiedHeader />
      <main className="flex-1">
        {/* Add padding-top to account for fixed header */}
        <div className="pt-16">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedLayout;
