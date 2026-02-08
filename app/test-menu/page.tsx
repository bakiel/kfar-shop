'use client';

import React, { useState } from 'react';
import SimplifiedHeader from '@/components/layout/SimplifiedHeader';
import { useUserRole } from '@/hooks/useUserRole';
import { LanguageProvider } from '@/lib/context/LanguageContext';
import { CartProvider } from '@/lib/context/CartContext';

function TestMenuContent() {
  const { role, isGuest, isCustomer, isVendor, isAdmin } = useUserRole();
  const [testRole, setTestRole] = useState(role);

  const simulateRole = (newRole: 'guest' | 'customer' | 'vendor' | 'admin') => {
    // Clear all tokens
    localStorage.removeItem('customerToken');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('customerInfo');
    localStorage.removeItem('vendorInfo');

    // Set token based on role
    switch (newRole) {
      case 'customer':
        localStorage.setItem('customerToken', 'test-customer-token');
        localStorage.setItem('customerInfo', JSON.stringify({
          id: 'customer-001',
          name: 'Test Customer'
        }));
        break;
      case 'vendor':
        localStorage.setItem('vendorToken', 'test-vendor-token');
        localStorage.setItem('vendorInfo', JSON.stringify({
          id: 'vendor-001',
          name: 'Test Vendor'
        }));
        break;
      case 'admin':
        localStorage.setItem('adminToken', 'test-admin-token');
        break;
    }

    // Reload to apply changes
    window.location.reload();
  };

  return (
    <>
      <SimplifiedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
          New Menu System Test Page
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#478c0b' }}>
            Current User Role: {role.toUpperCase()}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center ${isGuest ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className="fas fa-user-circle text-2xl mb-2" style={{ color: isGuest ? '#478c0b' : '#9ca3af' }}></i>
              <p className="font-medium">Guest</p>
              <p className="text-sm text-gray-600">{isGuest ? 'Active' : 'Inactive'}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isCustomer ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className="fas fa-user text-2xl mb-2" style={{ color: isCustomer ? '#478c0b' : '#9ca3af' }}></i>
              <p className="font-medium">Customer</p>
              <p className="text-sm text-gray-600">{isCustomer ? 'Active' : 'Inactive'}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isVendor ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className="fas fa-store text-2xl mb-2" style={{ color: isVendor ? '#478c0b' : '#9ca3af' }}></i>
              <p className="font-medium">Vendor</p>
              <p className="text-sm text-gray-600">{isVendor ? 'Active' : 'Inactive'}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isAdmin ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className="fas fa-user-shield text-2xl mb-2" style={{ color: isAdmin ? '#478c0b' : '#9ca3af' }}></i>
              <p className="font-medium">Admin</p>
              <p className="text-sm text-gray-600">{isAdmin ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-3">Test Different Roles:</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => simulateRole('guest')}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <i className="fas fa-user-circle mr-2"></i>
                Simulate Guest
              </button>
              <button
                onClick={() => simulateRole('customer')}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-user mr-2"></i>
                Simulate Customer
              </button>
              <button
                onClick={() => simulateRole('vendor')}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <i className="fas fa-store mr-2"></i>
                Simulate Vendor
              </button>
              <button
                onClick={() => simulateRole('admin')}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                <i className="fas fa-user-shield mr-2"></i>
                Simulate Admin
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#478c0b' }}>
              Header Features
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Clean, simplified header design</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Search bar (desktop) / collapsible (mobile)</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>QR Scanner quick access</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Language toggle (EN/HE)</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Notification bell with count</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Cart with item count</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>User account icon (role-based)</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Floating voice assistant button</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#478c0b' }}>
              Menu Features
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Role-based menu sections</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Quick actions at top of menu</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Dynamic "My Account" section</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Order count badges for vendors</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Language preference in menu</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Currency selector in menu</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Smooth animations</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check text-green-500"></i>
                <span>Mobile responsive</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <i className="fas fa-info-circle text-yellow-600"></i>
            Testing Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click the menu button (hamburger icon) in the header to open the menu</li>
            <li>Try different user roles using the buttons above</li>
            <li>Notice how menu items change based on role</li>
            <li>Test the search bar functionality</li>
            <li>Click the QR scanner icon</li>
            <li>Toggle the language (EN/HE)</li>
            <li>Check notification and cart badges</li>
            <li>Resize the window to test mobile responsiveness</li>
          </ol>
        </div>
      </div>
    </>
  );
}

export default function TestMenuPage() {
  return (
    <LanguageProvider>
      <CartProvider>
        <TestMenuContent />
      </CartProvider>
    </LanguageProvider>
  );
}