'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '@/styles/kfar-style-system.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple admin authentication (in production, this would be a proper API call)
    if (password === 'kfar-admin-2024') {
      localStorage.setItem('adminAuth', JSON.stringify({
        role: 'admin',
        loginTime: new Date().toISOString()
      }));
      router.push('/admin/dashboard');
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center kfar-bg-cream">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full kfar-gradient-primary flex items-center justify-center">
              <i className="fas fa-user-shield text-4xl text-white"></i>
            </div>
            <h1 className="text-h2 font-bold kfar-text-soil">Admin Portal</h1>
            <p className="text-body kfar-text-gray-600 mt-2">
              KiFar Marketplace Administration
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-body-sm font-medium kfar-text-soil mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input w-full"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg kfar-bg-red-50 text-red-600 text-body-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-lock"></i>
                  Login to Admin Portal
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-body-sm kfar-text-gray-600">
              Are you a vendor?{' '}
              <a href="/vendor/login" className="kfar-text-leaf-green hover:underline">
                Login to Vendor Portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
