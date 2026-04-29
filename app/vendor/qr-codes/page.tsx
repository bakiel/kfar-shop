'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorQRGenerator from '@/components/vendor/VendorQRGenerator';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, QrCode } from 'lucide-react';

interface VendorData {
  id: string;
  storeName: string;
  storeNameHe?: string;
  description?: string;
  descriptionHe?: string;
  logo?: string;
  category: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export default function VendorQRCodesPage() {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        // Get vendor auth from localStorage (set by AuthContext on login)
        const authStr = localStorage.getItem('vendorAuth');
        if (!authStr) {
          setError('not_authenticated');
          setLoading(false);
          return;
        }

        const auth = JSON.parse(authStr);
        const vendorId = auth.vendorId || '';

        if (!vendorId) {
          setError('no_vendor_id');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/vendor/${vendorId}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Vendor feed failed: ${response.status}`);

        const data = await response.json();
        const store = data.vendor;
        const metadata = store?.metadata || {};

        setVendorData({
          id: store.id,
          storeName: store.name || auth.vendorName || auth.name || 'My Store',
          storeNameHe: store.nameHe,
          description: store.description,
          descriptionHe: store.descriptionHe,
          logo: store.logo,
          category: store.category || store.categories?.[0] || 'food',
          phone: metadata.phone || '',
          email: metadata.email || '',
          address: metadata.location || 'Village of Peace, Dimona, Israel',
        });

        setProducts(
          (store.products || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image,
          }))
        );
      } catch (err) {
        console.error('Error loading vendor data:', err);
        setError('load_failed');
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

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

  // Not authenticated
  if (error === 'not_authenticated' || error === 'no_vendor_id') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 stroke-[1.5] text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Vendor Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in as a vendor to access QR code marketing tools.
          </p>
          <Link
            href="/vendor/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#478c0b] text-white font-semibold rounded-lg hover:bg-[#3a7009] transition-colors"
          >
            Go to Vendor Login
          </Link>
        </div>
      </div>
    );
  }

  // Error loading data
  if (error === 'load_failed' || !vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 stroke-[1.5] text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-6">
            Could not load your vendor information. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#478c0b] text-white font-semibold rounded-lg hover:bg-[#3a7009] transition-colors cursor-pointer"
          >
            Retry
          </button>
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
                <QrCode className="w-7 h-7 stroke-[1.5] text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Instant Access</h3>
              <p className="text-sm text-gray-600">
                Customers scan to visit your store instantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-sun-gold/10 rounded-full flex items-center justify-center">
                <QrCode className="w-7 h-7 stroke-[1.5] text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-1">Track Performance</h3>
              <p className="text-sm text-gray-600">
                Monitor scans and customer engagement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-earth-flame/10 rounded-full flex items-center justify-center">
                <QrCode className="w-7 h-7 stroke-[1.5] text-orange-600" />
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

        {/* No Products Note */}
        {products.length === 0 && (
          <div className="bg-yellow-50 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              No Products Found
            </h3>
            <p className="text-sm text-yellow-700">
              You can still generate store-level QR codes. Add products to your store to generate product-specific QR codes.
            </p>
          </div>
        )}

        {/* Marketing Tips */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Marketing Best Practices
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Physical Marketing</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>- Add QR codes to business cards and flyers</li>
                <li>- Display at your physical store or market stall</li>
                <li>- Include on product packaging and labels</li>
                <li>- Place on delivery vehicles or uniforms</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-700 mb-2">Digital Marketing</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>- Share QR codes on social media posts</li>
                <li>- Add to email signatures and newsletters</li>
                <li>- Include in WhatsApp status updates</li>
                <li>- Use in online advertisements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
