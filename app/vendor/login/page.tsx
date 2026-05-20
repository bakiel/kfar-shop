'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Store, Lock, ChevronDown, Eye, EyeOff, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

const VENDOR_OPTIONS = [
  { id: 'teva-deli', name: 'Teva Deli', nameHe: 'טבע דלי', logo: '/images/vendors/teva_deli_logo_vegan_factory.jpg', email: 'teva@kfarapp.com' },
  { id: 'queens-cuisine', name: "Queen's Cuisine", nameHe: 'המטבח של המלכה', logo: '/images/vendors/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg', email: 'queens@kfarapp.com' },
  { id: 'people-store', name: "People's Store", nameHe: 'חנות העם', logo: '/images/vendors/people_store_logo_community_retail.jpg', email: 'people@kfarapp.com' },
  { id: 'garden-of-light', name: 'Garden of Light', nameHe: 'גן האור', logo: '/images/vendors/Garden of Light Logo.jpg', email: 'garden@kfarapp.com' },
  { id: 'vop-shop', name: 'VOP Shop', nameHe: 'חנות כפר השלום', logo: '/images/vendors/vop_shop_official_logo_master_brand_village_of_peace.jpg', email: 'vop@kfarapp.com' },
  { id: 'gahn-delight', name: 'Gahn Delight', nameHe: 'גן תענוג', logo: '/images/vendors/gahn_delight_official_logo_master_brand_ice_cream.jpg', email: 'gahn@kfarapp.com' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function VendorLoginPage() {
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const { login, logout } = useAuth();

  const [vendorId, setVendorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedVendor = VENDOR_OPTIONS.find(v => v.id === vendorId);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!vendorId) {
      setError(isRTL ? 'יש לבחור חנות' : 'Please select a store');
      return;
    }
    if (!password) {
      setError(isRTL ? 'יש להזין סיסמה' : 'Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // Map vendorId to email
      const vendor = VENDOR_OPTIONS.find(v => v.id === vendorId);
      if (!vendor) {
        setError(isRTL ? 'חנות לא נמצאה' : 'Store not found');
        setLoading(false);
        return;
      }

      const result = await login(vendor.email, password);

      if (!result.success) {
        setError(result.error || (isRTL ? 'פרטים שגויים' : 'Invalid credentials'));
        setLoading(false);
        return;
      }

      if (result.user?.role !== 'vendor' || result.user.vendorId !== vendor.id) {
        await logout();
        setError(isRTL ? 'חשבון זה אינו מחובר לחנות שנבחרה' : 'This account is not connected to the selected store');
        setLoading(false);
        return;
      }

      // Redirect to vendor dashboard
      window.location.href = '/vendor/dashboard';
    } catch {
      setError(isRTL ? 'שגיאת חיבור - נסה שוב' : 'Connection error - please try again');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7eb] via-[#fefcf6] to-[#fef3cd] flex items-center justify-center p-4">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-white transition-colors cursor-pointer z-50"
      >
        <Globe className="w-4 h-4 stroke-[1.5]" />
        {language === 'en' ? 'עברית' : 'English'}
      </button>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Logo */}
        <motion.div variants={item} className="text-center mb-8">
          <Image
            src="/images/logos/kfar_logo_primary_horizontal.png"
            alt="KFAR Marketplace"
            width={200}
            height={60}
            className="h-12 w-auto mx-auto mb-3"
          />
          <p className="text-gray-500 text-sm">
            {isRTL ? 'פורטל ספקים' : 'Vendor Portal'}
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#478c0b] via-[#C4A265] to-[#2D5A27]" />

          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#3a3a1d] mb-1">
              {isRTL ? 'ברוכים השבים' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isRTL ? 'הזן את פרטי ההתחברות שלך' : 'Enter your credentials to continue'}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Vendor Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 stroke-[1.5] text-gray-400" />
                    {isRTL ? 'בחר חנות' : 'Select Store'}
                  </div>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-gray-300 rounded-lg text-left hover:border-[#478c0b] focus:outline-none focus:ring-2 focus:ring-[#478c0b]/20 focus:border-[#478c0b] transition-colors cursor-pointer bg-white"
                  >
                    {selectedVendor ? (
                      <div className="flex items-center gap-3">
                        <Image
                          src={selectedVendor.logo}
                          alt={selectedVendor.name}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {isRTL ? selectedVendor.nameHe : selectedVendor.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {isRTL ? 'בחר חנות...' : 'Choose a store...'}
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 stroke-[1.5] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-64 overflow-y-auto"
                    >
                      {VENDOR_OPTIONS.map((vendor) => (
                        <button
                          key={vendor.id}
                          type="button"
                          onClick={() => { setVendorId(vendor.id); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                            vendorId === vendor.id ? 'bg-[#478c0b]/5' : ''
                          }`}
                        >
                          <Image
                            src={vendor.logo}
                            alt={vendor.name}
                            width={32}
                            height={32}
                            className="rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {isRTL ? vendor.nameHe : vendor.name}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 stroke-[1.5] text-gray-400" />
                    {isRTL ? 'סיסמה' : 'Password'}
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#478c0b]/20 focus:border-[#478c0b] transition-colors ${isRTL ? 'pr-4 pl-11' : 'pl-4 pr-11'}`}
                    placeholder={isRTL ? 'הזן סיסמה' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? (isRTL ? 'הסתר סיסמה' : 'Hide password') : (isRTL ? 'הצג סיסמה' : 'Show password')}
                    aria-pressed={showPassword}
                    className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer ${isRTL ? 'left-2' : 'right-2'}`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.5]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a7209] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isRTL ? 'מתחבר...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {isRTL ? 'התחבר' : 'Sign In'}
                    <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Back link */}
        <motion.div variants={item} className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-[#478c0b] transition-colors cursor-pointer">
            {isRTL ? 'חזרה לשוק' : 'Back to Marketplace'}
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
