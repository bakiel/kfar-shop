'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Globe, Eye, EyeOff, Loader2, AlertCircle, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

export default function AdminLoginPage() {
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || (isRTL ? 'פרטי התחברות שגויים' : 'Invalid credentials'));
        setLoading(false);
        return;
      }

      if (result.user?.role !== 'admin') {
        await logout();
        setError(isRTL ? 'חשבון זה אינו חשבון מנהל' : 'This account is not an admin account');
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
    } catch {
      setError(isRTL ? 'שגיאת חיבור' : 'Connection error');
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
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
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
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('Email')}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5] ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? 'הזן אימייל' : 'Enter admin email'}
                  className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] transition-all ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('Password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? 'הזן סיסמה' : 'Enter password'}
                  className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] transition-all ${isRTL ? 'pr-4 pl-10 text-right' : 'pl-4 pr-10'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? (isRTL ? 'הסתר סיסמה' : 'Hide password') : (isRTL ? 'הצג סיסמה' : 'Show password')}
                  aria-pressed={showPassword}
                  className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer ${isRTL ? 'left-2' : 'right-2'}`}
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
