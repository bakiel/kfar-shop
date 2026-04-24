'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearVendorAuth() {
  const router = useRouter();
  
  useEffect(() => {
    // Clear vendor auth from localStorage
    localStorage.removeItem('vendorAuth');
    
    // Redirect to vendor login
    setTimeout(() => {
      router.push('/vendor/login');
    }, 2000);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef9ef]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#478c0b] mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Clearing vendor session...</h2>
        <p className="text-gray-600">Redirecting to login page...</p>
      </div>
    </div>
  );
}