'use client';

import { useEffect } from 'react';
import NewStoreBadge from '@/components/ui/NewStoreBadge';
import VendorBrowseCard from '@/components/marketplace/VendorBrowseCard';
import Image from 'next/image';

export default function NewStoreBadgeTestPage() {
  // Disable demo mode for this test page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoMode', 'false');
      // Force re-render of demo indicator
      window.dispatchEvent(new Event('storage'));
    }
  }, []);

  // Test data with working demo images
  const newVendor = {
    vendorId: 'test-new-vendor',
    vendorInfo: {
      name: 'Fresh Vegan Kitchen',
      logo: '/images/vendors/vop-shop.png', // Using existing image
      description: 'Brand new vegan restaurant with amazing dishes',
      tags: ['Vegan', 'Organic', 'Local'],
      createdAt: new Date().toISOString() // Created today
    },
    products: [
      { id: '1', name: 'Fresh Salad', image: '/images/products/vegan-food.jpg', featured: true },
      { id: '2', name: 'Smoothie Bowl', image: '/images/products/vegan-dish.jpg', featured: false },
      { id: '3', name: 'Veggie Wrap', image: '/images/products/placeholder.jpg', featured: true },
      { id: '4', name: 'Green Juice', image: '/images/products/placeholder.jpg', featured: false },
    ],
    index: 0
  };

  const oldVendor = {
    vendorId: 'test-old-vendor',
    vendorInfo: {
      name: 'Established Vegan Store',
      logo: '/images/vendors/teva-deli.png', // Using existing image
      description: 'Long-standing vegan store in the community',
      tags: ['Vegan', 'Established', 'Trusted'],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // Created 60 days ago
    },
    products: [
      { id: '5', name: 'Organic Bread', image: '/images/products/placeholder.jpg', featured: true },
      { id: '6', name: 'Vegan Cheese', image: '/images/products/placeholder.jpg', featured: true },
    ],
    index: 1
  };

  const recentVendor = {
    vendorId: 'test-recent-vendor',
    vendorInfo: {
      name: 'Recently Opened Cafe',
      logo: '/images/vendors/african-american-voices.png', // Using existing image
      description: 'Opened just 2 weeks ago!',
      tags: ['Cafe', 'Vegan', 'Coffee'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // Created 14 days ago
    },
    products: [
      { id: '7', name: 'Coffee', image: '/images/products/placeholder.jpg', featured: true },
      { id: '8', name: 'Pastry', image: '/images/products/placeholder.jpg', featured: false },
    ],
    index: 2
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <style jsx global>{`
        /* Hide demo mode indicator on this page */
        .demo-mode-indicator {
          display: none !important;
        }
      `}</style>
      
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          New Store Badge Test Page
        </h1>

        {/* Badge Variants Showcase */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Badge Variants
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Default Badge</h3>
              <NewStoreBadge createdAt={new Date().toISOString()} />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Small Badge</h3>
              <NewStoreBadge createdAt={new Date().toISOString()} variant="small" />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Large Badge</h3>
              <NewStoreBadge createdAt={new Date().toISOString()} variant="large" />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200 relative h-40">
              <h3 className="font-semibold mb-4 text-gray-800 pr-20">Corner Badge</h3>
              <p className="text-sm text-gray-600">Triangle style for cards</p>
              <NewStoreBadge createdAt={new Date().toISOString()} variant="corner" />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200 md:col-span-2">
              <h3 className="font-semibold mb-4 text-gray-800">Banner Badge</h3>
              <NewStoreBadge createdAt={new Date().toISOString()} variant="banner" />
            </div>
          </div>
        </section>

        {/* Badge Timing Tests */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Badge Timing (30-day threshold)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="font-semibold mb-2 text-gray-800">Created Today</h3>
              <p className="text-sm text-gray-600 mb-4">Should show badge</p>
              <NewStoreBadge createdAt={new Date().toISOString()} />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="font-semibold mb-2 text-gray-800">Created 20 Days Ago</h3>
              <p className="text-sm text-gray-600 mb-4">Should show badge</p>
              <NewStoreBadge createdAt={new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()} />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="font-semibold mb-2 text-gray-800">Created 40 Days Ago</h3>
              <p className="text-sm text-gray-600 mb-4">Should NOT show badge</p>
              <NewStoreBadge createdAt={new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()} />
              <p className="text-xs text-gray-400 mt-4">No badge displayed (as expected)</p>
            </div>
          </div>
        </section>

        {/* Corner Badge Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Corner Badge Positioning Examples
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Example 1: Product Card */}
            <div className="relative bg-white rounded-xl shadow-lg">
              <NewStoreBadge createdAt={new Date().toISOString()} variant="corner" />
              <div className="p-6 pt-8">
                <h3 className="font-bold text-lg mb-2">Product Card</h3>
                <p className="text-gray-600 text-sm">This shows how the corner badge looks on a product card.</p>
              </div>
            </div>

            {/* Example 2: Image Card */}
            <div className="relative bg-white rounded-xl shadow-lg">
              <NewStoreBadge createdAt={new Date().toISOString()} variant="corner" />
              <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-xl"></div>
              <div className="p-4">
                <h3 className="font-bold">With Image</h3>
                <p className="text-gray-600 text-sm">Corner badge over image</p>
              </div>
            </div>

            {/* Example 3: Minimal Card */}
            <div className="relative bg-gray-50 rounded-xl border-2 border-gray-200">
              <NewStoreBadge createdAt={new Date().toISOString()} variant="corner" />
              <div className="p-6 pt-8">
                <h3 className="font-bold text-lg">Minimal Style</h3>
                <p className="text-gray-600 text-sm mt-2">Clean corner badge presentation</p>
              </div>
            </div>
          </div>
        </section>

        {/* VendorBrowseCard Integration */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            VendorBrowseCard Integration
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <VendorBrowseCard {...newVendor} />
            <VendorBrowseCard {...recentVendor} />
            <VendorBrowseCard {...oldVendor} />
          </div>
        </section>

        {/* Store Page Preview */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Store Page Hero Section Preview
          </h2>
          
          <div className="relative h-64 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-600 to-yellow-500">
            <div className="absolute inset-0 bg-black/10" />
            <NewStoreBadge 
              createdAt={new Date().toISOString()} 
              variant="banner" 
            />
            <div className="relative z-10 p-8">
              <h3 className="text-3xl font-bold text-white mb-2">Fresh Vegan Kitchen</h3>
              <p className="text-white/90">Experience the newest addition to our marketplace!</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}