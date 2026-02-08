'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CustomerLogin() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [roleHint, setRoleHint] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  // Check for role parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    setRoleHint(role || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For demo, just simulate login
      if (mode === 'login') {
        // Check for special logins
        if (formData.email === 'admin@kfar.com' && formData.password === 'admin123') {
          // Admin login
          localStorage.setItem('customerToken', 'admin-token-' + Date.now());
          localStorage.setItem('customerName', 'Admin User');
          localStorage.setItem('customerId', 'admin-001');
          localStorage.setItem('userRole', 'admin');
          
          toast({
            title: "Admin access granted!",
            description: "Redirecting to admin dashboard...",
          });

          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 1000);
        } else if (formData.email === 'vendor@tevadeli.com' && formData.password === 'vendor123') {
          // Vendor login
          localStorage.setItem('customerToken', 'vendor-token-' + Date.now());
          localStorage.setItem('customerName', 'Teva Deli');
          localStorage.setItem('customerId', 'vendor-tevadeli');
          localStorage.setItem('userRole', 'vendor');
          
          toast({
            title: "Vendor access granted!",
            description: "Redirecting to vendor dashboard...",
          });

          setTimeout(() => {
            window.location.href = '/vendor/dashboard';
          }, 1000);
        } else {
          // Regular customer login
          localStorage.setItem('customerToken', 'demo-token-123');
          localStorage.setItem('customerName', formData.email.split('@')[0]);
          localStorage.setItem('customerId', 'customer-' + Date.now());
          localStorage.setItem('userRole', 'customer');
          
          toast({
            title: "Welcome back!",
            description: "Redirecting to your dashboard...",
          });

          setTimeout(() => {
            window.location.href = '/customer/dashboard';
          }, 1000);
        }
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
      } else {
        // Simulate registration
        localStorage.setItem('customerToken', 'demo-token-123');
        localStorage.setItem('customerName', formData.name || formData.email.split('@')[0]);
        localStorage.setItem('customerId', 'customer-' + Date.now());
        localStorage.setItem('userRole', 'customer');
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
        
        toast({
          title: "Account created!",
          description: "Redirecting to onboarding...",
        });

        setTimeout(() => {
          window.location.href = '/customer/onboarding';
        }, 1000);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('customerToken', 'demo-token-123');
    localStorage.setItem('customerName', 'Sarah Cohen');
    localStorage.setItem('customerId', 'customer-demo');
    localStorage.setItem('userRole', 'customer');
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    
    toast({
      title: "Demo Login",
      description: "Logged in as Sarah Cohen",
    });
    router.push('/customer/dashboard');
  };

  return (
    <>
      {/* Hero Header - KFAR Design System Aligned */}
      <div className="relative h-[300px] overflow-hidden" style={{ backgroundColor: '#fef9ef' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(71, 140, 11, 0.1) 35px, rgba(71, 140, 11, 0.1) 70px)'
          }}></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full animate-pulse" style={{ backgroundColor: '#f6af0d', opacity: 0.2 }}></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full animate-pulse" style={{ backgroundColor: '#478c0b', opacity: 0.2, animationDelay: '1s' }}></div>
        
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-2xl px-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg mb-4 animate-fade-in" style={{ backgroundColor: '#478c0b' }}>
              <i className="fas fa-shopping-bag"></i>
              <span>Customer Portal</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              {t('Welcome to KFAR')}
            </h1>
            <p className="text-lg md:text-xl" style={{ color: '#478c0b' }}>
              {t('Join the Village of Peace Community')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#fef9ef' }}>
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2"
            style={{ borderColor: '#478c0b' }}
          >
            {/* Header */}
            <div className="relative p-8 text-white text-center" style={{ backgroundColor: '#478c0b' }}>
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full" style={{ backgroundColor: '#f6af0d' }}></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full" style={{ backgroundColor: '#cfe7c1' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <i className={`fas ${mode === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'} text-2xl`}></i>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {mode === 'login' ? t('Welcome Back!') : t('Join KFAR')}
                </h2>
                <p className="opacity-90 text-lg">
                  {mode === 'login' 
                    ? t('Access your personalized dashboard') 
                    : t('Start your journey with us')}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex p-3 gap-2" style={{ backgroundColor: '#cfe7c1' }}>
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  mode === 'login'
                    ? 'text-white shadow-xl transform -translate-y-1'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  backgroundColor: mode === 'login' ? '#478c0b' : 'transparent'
                }}
              >
                {t('Login')}
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  mode === 'register'
                    ? 'text-white shadow-xl transform -translate-y-1'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  backgroundColor: mode === 'register' ? '#478c0b' : 'transparent'
                }}
              >
                {t('Register')}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Full Name')}
                  </label>
                  <input
                    type="text"
                    required={mode === 'register'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-2xl transition-all duration-300 focus:ring-0 focus:outline-none"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: 'white',
                      color: '#3a3a1d'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#478c0b'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder={t('Your name')}
                  />
                </div>
              )}

              {/* Role-specific demo credentials */}
              {roleHint && mode === 'login' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    {roleHint === 'admin' && '👑 Admin Demo Credentials:'}
                    {roleHint === 'vendor' && '🏪 Vendor Demo Credentials:'}
                    {roleHint === 'customer' && '🛒 Customer Demo:'}
                  </div>
                  <div className="text-xs text-blue-700">
                    {roleHint === 'admin' && 'admin@kfar.com / admin123'}
                    {roleHint === 'vendor' && 'vendor@tevadeli.com / vendor123'}
                    {roleHint === 'customer' && 'Use any email/password to create account'}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-2xl transition-all duration-300 focus:ring-0 focus:outline-none"
                  style={{
                    borderColor: '#d1d5db',
                    backgroundColor: 'white',
                    color: '#3a3a1d'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#478c0b'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder={roleHint === 'admin' ? 'admin@kfar.com' : 
                              roleHint === 'vendor' ? 'vendor@tevadeli.com' : 
                              'your@email.com'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Password')}
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-2xl transition-all duration-300 focus:ring-0 focus:outline-none"
                  style={{
                    borderColor: '#d1d5db',
                    backgroundColor: 'white',
                    color: '#3a3a1d'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#478c0b'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="••••••••"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Phone (Optional)')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-2xl transition-all duration-300 focus:ring-0 focus:outline-none"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: 'white',
                      color: '#3a3a1d'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#478c0b'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="+972-50-123-4567"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">{t('Remember me')}</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                    {t('Forgot password?')}
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
                  loading
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
                style={{
                  backgroundColor: loading ? '#d1d5db' : '#478c0b',
                  color: loading ? '#6b7280' : 'white'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('Processing...')}
                  </span>
                ) : (
                  mode === 'login' ? t('Login') : t('Create Account')
                )}
              </button>

              {/* Demo Login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 border-2"
                style={{ 
                  backgroundColor: '#fef9ef',
                  borderColor: '#f6af0d',
                  color: '#3a3a1d'
                }}
              >
                <i className="fas fa-user-astronaut" />
                {t('Try Demo Account')}
              </button>
            </form>

            {/* Social Login */}
            <div className="px-6 pb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('Or continue with')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 border-2 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  style={{ 
                    borderColor: '#f6af0d',
                    backgroundColor: 'white',
                    color: '#3a3a1d'
                  }}
                >
                  <i className="fab fa-google" style={{ color: '#c23c09' }} />
                  <span className="text-sm">{t('Google')}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border-2 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  style={{ 
                    borderColor: '#478c0b',
                    backgroundColor: 'white',
                    color: '#3a3a1d'
                  }}
                >
                  <i className="fab fa-facebook" style={{ color: '#478c0b' }} />
                  <span className="text-sm">{t('Facebook')}</span>
                </button>
              </div>
            </div>

            {/* Demo Credentials Info */}
            {mode === 'login' && (
              <div className="px-6 pb-4">
                <div className="rounded-2xl p-4 border-2" style={{ backgroundColor: '#cfe7c1', borderColor: '#478c0b' }}>
                  <p className="font-bold mb-3" style={{ color: '#3a3a1d' }}>Demo Credentials:</p>
                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl p-3 font-mono" style={{ backgroundColor: 'rgba(194, 60, 9, 0.1)', color: '#3a3a1d' }}>
                      <strong>Admin:</strong> admin@kfar.com / admin123
                    </div>
                    <div className="rounded-xl p-3 font-mono" style={{ backgroundColor: 'rgba(246, 175, 13, 0.1)', color: '#3a3a1d' }}>
                      <strong>Vendor:</strong> vendor@tevadeli.com / vendor123
                    </div>
                    <div className="rounded-xl p-3 font-mono" style={{ backgroundColor: 'rgba(71, 140, 11, 0.1)', color: '#3a3a1d' }}>
                      <strong>Customer:</strong> Any email / Any password
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 pb-6 text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <p>
                  {t('New to KFAR?')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    {t('Create an account')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('Already have an account?')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    {t('Login')}
                  </button>
                </p>
              )}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <h3 className="text-lg font-semibold mb-4">{t('Why Create an Account?')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <i className="fas fa-coins text-green-600" />
                <span>{t('Earn loyalty points')}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-percentage text-green-600" />
                <span>{t('Exclusive discounts')}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-history text-green-600" />
                <span>{t('Order history')}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-heart text-green-600" />
                <span>{t('Save favorites')}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-microphone text-green-600" />
                <span>{t('Voice shopping')}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-robot text-green-600" />
                <span>{t('AI assistance')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}