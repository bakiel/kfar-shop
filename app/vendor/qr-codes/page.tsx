'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import VendorQRGenerator from '@/components/vendor/VendorQRGenerator';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Sample vendor data for demo
const SAMPLE_VENDOR = {
  id: 'demo-vendor',
  storeName: 'Sample Organic Store',
  storeNameHe: 'חנות אורגנית לדוגמה',
  description: 'Fresh organic produce and vegan products from the Village of Peace',
  descriptionHe: 'תוצרת אורגנית טרייה ומוצרים טבעוניים מכפר השלום',
  logo: '/images/vendors/sample-logo.jpg',
  category: 'food',
  phone: '+972-50-1234567',
  email: 'info@samplestore.com',
  address: 'Village of Peace, Dimona, Israel'
};

const SAMPLE_PRODUCTS = [
  { id: '1', name: 'Organic Hummus', price: 18, image: '/images/products/hummus.jpg' },
  { id: '2', name: 'Fresh Tahini', price: 25, image: '/images/products/tahini.jpg' },
  { id: '3', name: 'Vegan Cheese', price: 32, image: '/images/products/cheese.jpg' }
];

export default function VendorQRCodesPage() {
  const searchParams = useSearchParams();
  const [vendorData, setVendorData] = useState(SAMPLE_VENDOR);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [loading, setLoading] = useState(true);

  // Get vendor ID from URL params
  const vendorId = searchParams.get('vendorId') || 'demo-vendor';

  useEffect(() => {
    // In a real app, fetch vendor data from API
    const fetchVendorData = async () => {
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo, just use sample data
        setVendorData({
          ...SAMPLE_VENDOR,
          id: vendorId
        });
        setProducts(SAMPLE_PRODUCTS);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-leaf-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/vendor/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">QR Code Marketing Tools</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <img
                src="/images/logos/kfar_logo_primary_horizontal.png"
                alt="KFAR Marketplace"
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Introduction Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-soil-brown mb-4">
            QR Code Marketing for {vendorData.storeName}
          </h2>
          <p className="text-gray-600 mb-6">
            Create professional QR codes to promote your store, products, and special offers. 
            Use these QR codes on business cards, flyers, product packaging, and social media 
            to drive traffic to your KFAR Marketplace store.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-leaf-green/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-1">Instant Access</h3>
              <p className="text-sm text-gray-600">
                Customers scan to visit your store instantly
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-sun-gold/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-1">Track Performance</h3>
              <p className="text-sm text-gray-600">
                Monitor scans and customer engagement
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-earth-flame/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold mb-1">Custom Designs</h3>
              <p className="text-sm text-gray-600">
                Beautiful QR codes with KFAR branding
              </p>
            </div>
          </div>
        </div>

        {/* QR Generator Component */}
        <VendorQRGenerator
          vendorId={vendorData.id}
          vendorData={vendorData}
          products={products}
        />

        {/* Marketing Tips */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            💡 Marketing Best Practices
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Physical Marketing</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Add QR codes to business cards and flyers</li>
                <li>• Display at your physical store or market stall</li>
                <li>• Include on product packaging and labels</li>
                <li>• Place on delivery vehicles or uniforms</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Digital Marketing</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Share QR codes on social media posts</li>
                <li>• Add to email signatures and newsletters</li>
                <li>• Include in WhatsApp status updates</li>
                <li>• Use in online advertisements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}