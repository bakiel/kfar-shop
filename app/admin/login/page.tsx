'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Globe, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'kfar-admin-2024';

    if (password === adminPassword) {
      const authData = {
        role: 'admin',
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('adminAuth', JSON.stringify(authData));
      localStorage.setItem('customerToken', 'admin-token');
      localStorage.setItem('customerName', 'Administrator');
      localStorage.setItem('customerId', 'admin-1');
      localStorage.setItem('userRole', 'admin');
      document.cookie = `adminAuth=${JSON.stringify(authData)}; path=/; max-age=${60 * 60 * 24}`;

      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
    } else {
      setError(isRTL ? 'סיסמה שגויה' : 'Invalid password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2D5A27] via-[#1a3517] to-[#3a3a1d] relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C4A265]/10 blur-3xl pointer-events-none" />

      {/* Language Toggle */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={toggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer text-sm"
      >
        <Globe className="w-4 h-4 stroke-[1.5]" />
        {language === 'en' ? 'עברית' : 'English'}
      </motion.button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md mx-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#2D5A27] to-[#478c0b] flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-3xl">K</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isRTL ? 'פורטל ניהול' : 'Admin Portal'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRTL ? 'ניהול שוק כפר' : 'KFAR Marketplace Administration'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('Admin Password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? 'הזן סיסמת מנהל' : 'Enter admin password'}
                  className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] transition-all ${isRTL ? 'pr-4 pl-10 text-right' : 'pl-4 pr-10'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer ${isRTL ? 'left-2' : 'right-2'}`}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4 stroke-[1.5]" />
                    : <Eye className="w-4 h-4 stroke-[1.5]" />
                  }
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 stroke-[1.5] flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#2D5A27] to-[#478c0b] text-white font-medium rounded-xl hover:from-[#234A1F] hover:to-[#3a7509] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#2D5A27]/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 stroke-[1.5] animate-spin" />
                  {isRTL ? 'מתחבר...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[1.5]" />
                  {isRTL ? 'התחבר לפורטל ניהול' : 'Login to Admin Portal'}
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {isRTL ? 'אתה ספק?' : 'Are you a vendor?'}{' '}
              <a href="/vendor/login" className="text-[#2D5A27] hover:underline font-medium cursor-pointer">
                {isRTL ? 'התחבר לפורטל ספקים' : 'Login to Vendor Portal'}
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
