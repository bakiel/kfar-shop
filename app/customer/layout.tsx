'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, Home } from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/customer/profile', label: 'My Profile', icon: User },
    { href: '/customer/orders', label: 'Order History', icon: ShoppingBag },
    { href: '/customer/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/customer/addresses', label: 'Addresses', icon: MapPin },
    { href: '/customer/preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full mx-auto mb-4" style={{ backgroundColor: '#478c0b' }}>
                  <User className="w-12 h-12 text-white mx-auto mt-4" />
                </div>
                <h2 className="text-xl font-bold text-center" style={{ color: '#3a3a1d' }}>
                  My Account
                </h2>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-leaf-green/10 text-leaf-green' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      style={isActive ? { backgroundColor: '#478c0b15', color: '#478c0b' } : {}}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}