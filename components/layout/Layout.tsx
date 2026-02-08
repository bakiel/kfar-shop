'use client';

import React from 'react';
import SimplifiedHeader from './SimplifiedHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
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

export default Layout;