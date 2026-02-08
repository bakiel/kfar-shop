'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import BulkProductImport from '@/components/vendor/BulkProductImport';

interface ProductRow {
  name: string;
  nameHe?: string;
  description?: string;
  descriptionHe?: string;
  price: number;
  category: string;
  inStock: boolean;
  ingredients?: string;
  dietaryInfo?: string;
  preparationTime?: string;
  servingSize?: string;
  imageUrl?: string;
}

export default function BulkImportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorId = searchParams.get('vendorId') || 'demo-vendor';
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImportComplete = async (products: ProductRow[]) => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would call an API to save products
      console.log('Importing products:', products);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would save to PostgreSQL database
      // For now, we'll save to localStorage and prepare for API integration
      const existingProducts = JSON.parse(localStorage.getItem(`vendor_${vendorId}_products`) || '[]');
      const newProducts = products.map((product, index) => ({
        id: `${vendorId}-bulk-${Date.now()}-${index}`,
        vendorId,
        ...product,
        isVegan: true, // VOP compliance
        isKosher: true, // VOP compliance
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Store locally for demo
      localStorage.setItem(
        `vendor_${vendorId}_products`,
        JSON.stringify([...existingProducts, ...newProducts])
      );
      
      // TODO: When database is ready, use this API call:
      // await fetch('/api/vendor/products/bulk-import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ vendorId, products: newProducts })
      // });
      
      // Redirect to products page
      router.push(`/vendor/products?vendorId=${vendorId}&imported=${products.length}`);
    } catch (error) {
      console.error('Error importing products:', error);
      alert('Failed to import products. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(`/vendor/products?vendorId=${vendorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/vendor/products?vendorId=${vendorId}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Products
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Bulk Product Import</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Package className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">
                  Import Multiple Products at Once
                </h2>
                <p className="text-blue-800 mb-3">
                  Save time by uploading all your products in a single CSV file. Our AI will 
                  automatically enhance descriptions, add Hebrew translations, and suggest pricing.
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Download our CSV template with example products</li>
                  <li>• Fill in your product information</li>
                  <li>• Upload the file and let AI enhance your listings</li>
                  <li>• Review and import all products at once</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bulk Import Component */}
          <BulkProductImport
            vendorId={vendorId}
            onImportComplete={handleImportComplete}
            onCancel={handleCancel}
          />
          
          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="w-16 h-16 border-4 border-leaf-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Importing Products...</p>
                <p className="text-gray-600 mt-1">This may take a moment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}