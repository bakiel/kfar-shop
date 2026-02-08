'use client';

import React from 'react';
import Link from 'next/link';
import '@/styles/kfar-style-system.css';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center kfar-bg-cream">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6">
          <div className="text-display font-bold kfar-text-gray-300">404</div>
        </div>
        
        <h2 className="text-h3 font-bold kfar-text-soil mb-2">
          Page Not Found
        </h2>
        
        <p className="text-body kfar-text-gray-600 mb-6">
          The admin page you're looking for doesn't exist.
        </p>
        
        <Link href="/admin/dashboard">
          <button className="btn btn-primary">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
