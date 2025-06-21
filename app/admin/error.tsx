'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/kfar-style-system.css';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center kfar-bg-cream">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full kfar-bg-red-50 flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-3xl text-red-600"></i>
        </div>
        
        <h2 className="text-h3 font-bold kfar-text-soil mb-2">
          Oops! Something went wrong
        </h2>
        
        <p className="text-body kfar-text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred in the admin panel.'}
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="btn btn-outline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
