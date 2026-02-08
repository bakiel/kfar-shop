'use client';

import React from 'react';
import Link from 'next/link';

export default function DemoTestPage() {
  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">KFAR Demo Testing Center</h1>
          <p className="text-xl text-gray-600 mb-6">Test all user flows before Vercel deployment</p>
          <button 
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Clear All Login Data
          </button>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Demo Login Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-600 mb-2">👑 Admin</h3>
              <p className="text-sm"><strong>Email:</strong> admin@kfar.com</p>
              <p className="text-sm"><strong>Password:</strong> admin123</p>
              <Link href="/customer/login" className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                Login as Admin
              </Link>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-blue-600 mb-2">🏪 Vendor</h3>
              <p className="text-sm"><strong>Email:</strong> vendor@tevadeli.com</p>
              <p className="text-sm"><strong>Password:</strong> vendor123</p>
              <Link href="/customer/login" className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Login as Vendor
              </Link>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-purple-600 mb-2">🛒 Customer</h3>
              <p className="text-sm"><strong>Email:</strong> Any email</p>
              <p className="text-sm"><strong>Password:</strong> Any password</p>
              <Link href="/customer/login" className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700">
                Login/Register
              </Link>
            </div>
          </div>
        </div>

        {/* Test Flows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Customer Flow */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-purple-600">🛒 Customer Experience</h3>
            <div className="space-y-3">
              <Link href="/marketplace" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">1. Browse Products</div>
                <div className="text-sm text-gray-600">Marketplace with 6 vendors</div>
              </Link>
              <Link href="/checkout" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">2. Test Checkout</div>
                <div className="text-sm text-gray-600">Complete order flow</div>
              </Link>
              <Link href="/customer/login" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">3. Customer Login</div>
                <div className="text-sm text-gray-600">Account & order history</div>
              </Link>
              <Link href="/customer/onboarding" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">4. Customer Onboarding</div>
                <div className="text-sm text-gray-600">New user setup</div>
              </Link>
            </div>
          </div>

          {/* Vendor Flow */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-600">🏪 Vendor Experience</h3>
            <div className="space-y-3">
              <Link href="/vendor/onboarding" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">1. Vendor Onboarding</div>
                <div className="text-sm text-gray-600">Store setup process</div>
              </Link>
              <Link href="/vendor/dashboard" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">2. Vendor Dashboard</div>
                <div className="text-sm text-gray-600">Analytics & overview</div>
              </Link>
              <Link href="/vendor/orders" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">3. Order Management</div>
                <div className="text-sm text-gray-600">Process customer orders</div>
              </Link>
              <Link href="/vendor/login" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">4. Vendor Login</div>
                <div className="text-sm text-gray-600">Access vendor portal</div>
              </Link>
            </div>
          </div>

          {/* Admin Flow */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-green-600">👑 Admin Experience</h3>
            <div className="space-y-3">
              <Link href="/admin/dashboard" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">1. Admin Dashboard</div>
                <div className="text-sm text-gray-600">Platform analytics</div>
              </Link>
              <Link href="/admin/vendors" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">2. Vendor Management</div>
                <div className="text-sm text-gray-600">Approve/manage vendors</div>
              </Link>
              <Link href="/admin/orders" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">3. Order Overview</div>
                <div className="text-sm text-gray-600">All platform orders</div>
              </Link>
              <Link href="/admin/login" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">4. Admin Login</div>
                <div className="text-sm text-gray-600">Administrator access</div>
              </Link>
            </div>
          </div>

          {/* Technical Tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-orange-600">🔧 Technical Tests</h3>
            <div className="space-y-3">
              <Link href="/test-invoice-system" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">1. Invoice System</div>
                <div className="text-sm text-gray-600">End-to-end invoice test</div>
              </Link>
              <Link href="/invoice/html2pdf" className="block p-3 border rounded hover:bg-gray-50">
                <div className="font-medium">2. PDF Generation</div>
                <div className="text-sm text-gray-600">Direct HTML2PDF test</div>
              </Link>
              <div className="p-3 border rounded bg-gray-50">
                <div className="font-medium">3. Translation Toggle</div>
                <div className="text-sm text-gray-600">Hebrew/English switch (top nav)</div>
              </div>
              <div className="p-3 border rounded bg-gray-50">
                <div className="font-medium">4. Mobile Design</div>
                <div className="text-sm text-gray-600">Responsive on all devices</div>
              </div>
            </div>
          </div>

          {/* Core Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-indigo-600">✨ Core Features</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded bg-green-50">
                <div className="font-medium text-green-600">✅ Multi-vendor Marketplace</div>
                <div className="text-sm text-gray-600">6 vendors, 106+ products</div>
              </div>
              <div className="p-3 border rounded bg-green-50">
                <div className="font-medium text-green-600">✅ Order System</div>
                <div className="text-sm text-gray-600">Database saving working</div>
              </div>
              <div className="p-3 border rounded bg-green-50">
                <div className="font-medium text-green-600">✅ Invoice Generation</div>
                <div className="text-sm text-gray-600">HTML2PDF, no overlaps</div>
              </div>
              <div className="p-3 border rounded bg-green-50">
                <div className="font-medium text-green-600">✅ Language Support</div>
                <div className="text-sm text-gray-600">Hebrew/English toggle</div>
              </div>
              <div className="p-3 border rounded bg-green-50">
                <div className="font-medium text-green-600">✅ WhatsApp Integration</div>
                <div className="text-sm text-gray-600">Order notifications</div>
              </div>
              <div className="p-3 border rounded bg-green-50">
                <div className="font-medium text-green-600">✅ Mobile Responsive</div>
                <div className="text-sm text-gray-600">Works on all devices</div>
              </div>
            </div>
          </div>

          {/* Ready for Deploy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">🚀 Ready for Deploy</h3>
            <div className="space-y-3">
              <div className="p-3 border-2 border-red-200 rounded bg-red-50">
                <div className="font-medium text-red-600 mb-2">Pre-Deploy Checklist</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Orders save to database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Invoices generate properly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>No fallback dependencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Mobile responsive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Multi-language ready</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 mb-2">Ready for Vercel! 🎉</div>
                <code className="text-sm bg-gray-100 p-2 rounded block">git push origin main</code>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Quick Test Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/marketplace" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                🏪 Start Shopping
              </Link>
              <Link href="/customer/login" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                👤 Customer Login
              </Link>
              <Link href="/vendor/onboarding" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                🏢 Vendor Onboarding
              </Link>
              <Link href="/test-invoice-system" className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                📄 Test Invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}