'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    
    if (!adminAuth) {
      router.push('/admin/login');
    } else {
      // If authenticated, redirect to dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}