'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCheckResult {
  path: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

export default function ImageDiagnostic() {
  const [imageChecks, setImageChecks] = useState<ImageCheckResult[]>([]);
  
  // Critical homepage images to check
  const criticalImages = [
    // Hero images
    '/images/hero/13.jpg',
    '/images/hero/21.jpg',
    '/images/hero/19.jpg',
    // Vendor logos
    '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
    '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
    '/images/vendors/queens-cuisine-logo.png',
    '/images/vendors/people_store_logo_community_retail.jpg',
    '/images/vendors/vop-shop-logo.png',
    '/images/vendors/gahn-delight-logo.png',
    // Product images samples
    '/images/vendors/teva-deli/schnitzel-classic.jpg',
    '/images/vendors/garden-of-light/spread-cashew-cream.jpg',
    // Backgrounds
    '/images/backgrounds/1.jpg',
  ];
  
  useEffect(() => {
    // Initialize checks
    setImageChecks(criticalImages.map(path => ({
      path,
      status: 'loading'
    })));
    
    // Check each image
    criticalImages.forEach((path, index) => {
      const img = new window.Image();
      img.onload = () => {
        setImageChecks(prev => {
          const newChecks = [...prev];
          newChecks[index] = { path, status: 'success' };
          return newChecks;
        });
      };
      img.onerror = () => {
        setImageChecks(prev => {
          const newChecks = [...prev];
          newChecks[index] = { path, status: 'error', error: 'Failed to load' };
          return newChecks;
        });
      };
      img.src = path;
    });
  }, []);
  
  const successCount = imageChecks.filter(c => c.status === 'success').length;
  const errorCount = imageChecks.filter(c => c.status === 'error').length;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl p-4 max-w-md">
      <h3 className="font-bold mb-2">Image Diagnostic</h3>
      <div className="text-sm space-y-1">
        <p>✅ Loaded: {successCount}/{imageChecks.length}</p>
        {errorCount > 0 && <p>❌ Failed: {errorCount}</p>}
      </div>
      
      {errorCount > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-red-600">Show errors</summary>
          <ul className="mt-2 text-xs space-y-1">
            {imageChecks.filter(c => c.status === 'error').map((check, i) => (
              <li key={i} className="text-red-600">
                {check.path}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}