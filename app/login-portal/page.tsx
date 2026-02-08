'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function LoginPortal() {
  const { t, isRTL } = useLanguage();
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      {/* Hero Section - KFAR Design System Aligned */}
      <div className="relative h-[300px] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(71, 140, 11, 0.1) 35px, rgba(71, 140, 11, 0.1) 70px)'
          }}></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full animate-pulse" style={{ backgroundColor: '#f6af0d', opacity: 0.2 }}></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full animate-pulse" style={{ backgroundColor: '#478c0b', opacity: 0.2, animationDelay: '1s' }}></div>
        
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg mb-4 animate-fade-in" style={{ backgroundColor: '#f6af0d' }}>
              <i className="fas fa-key"></i>
              <span>Secure Access</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              {t('KFAR Access Portal')}
            </h1>
            <p className="text-lg md:text-xl" style={{ color: '#478c0b' }}>
              {t('Choose your role to continue')}
            </p>
          </div>
        </div>
      </div>

      {/* Login Options */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Customer Login */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative p-8 text-center" style={{ backgroundColor: '#478c0b' }}>
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full" style={{ backgroundColor: '#f6af0d' }}></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full" style={{ backgroundColor: '#cfe7c1' }}></div>
              </div>
              
              <div className="relative z-10 text-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-shopping-bag text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('Customer')}</h3>
                <p className="opacity-90 text-lg">{t('Shop & track your orders')}</p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Link 
                    href="/customer/login?role=customer"
                    className="inline-block w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <i className="fas fa-shopping-bag mr-2"></i>
                    {t('Customer Login')}
                  </Link>
                </div>
                
                <div className="text-center">
                  <div className="rounded-2xl p-4 border-2" style={{ backgroundColor: '#cfe7c1', borderColor: '#478c0b' }}>
                    <div className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>{t('Demo Access:')}</div>
                    <div className="text-sm rounded-xl p-3" style={{ backgroundColor: 'rgba(71, 140, 11, 0.1)', color: '#3a3a1d' }}>
                      {t('Use any email/password')}<br/>
                      {t('to create a demo account')}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/customer/onboarding"
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors"
                    style={{ color: '#478c0b' }}
                  >
                    <i className="fas fa-user-plus"></i>
                    {t('New? Start onboarding →')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Login */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative p-8 text-center" style={{ backgroundColor: '#f6af0d' }}>
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full" style={{ backgroundColor: '#c23c09' }}></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full" style={{ backgroundColor: '#478c0b' }}></div>
              </div>
              
              <div className="relative z-10 text-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-store text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('Vendor')}</h3>
                <p className="opacity-90 text-lg">{t('Manage your store')}</p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Link 
                    href="/customer/login?role=vendor"
                    className="inline-block w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    style={{ backgroundColor: '#f6af0d' }}
                  >
                    <i className="fas fa-store mr-2"></i>
                    {t('Vendor Portal')}
                  </Link>
                </div>
                
                <div className="text-center">
                  <div className="rounded-2xl p-4 border-2" style={{ backgroundColor: '#fef9ef', borderColor: '#f6af0d' }}>
                    <div className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>{t('Demo Credentials:')}</div>
                    <div className="text-sm rounded-xl p-3 font-mono" style={{ backgroundColor: 'rgba(246, 175, 13, 0.1)', color: '#3a3a1d' }}>
                      vendor@tevadeli.com<br/>
                      vendor123
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/vendor/onboarding"
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors"
                    style={{ color: '#f6af0d' }}
                  >
                    <i className="fas fa-handshake"></i>
                    {t('New vendor? Join us →')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Login */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative p-8 text-center" style={{ backgroundColor: '#c23c09' }}>
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full" style={{ backgroundColor: '#f6af0d' }}></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full" style={{ backgroundColor: '#478c0b' }}></div>
              </div>
              
              <div className="relative z-10 text-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-crown text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('Admin')}</h3>
                <p className="opacity-90 text-lg">{t('Platform management')}</p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Link 
                    href="/customer/login?role=admin"
                    className="inline-block w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    style={{ backgroundColor: '#c23c09' }}
                  >
                    <i className="fas fa-crown mr-2"></i>
                    {t('Admin Access')}
                  </Link>
                </div>
                
                <div className="text-center">
                  <div className="rounded-2xl p-4 border-2" style={{ backgroundColor: '#fef9ef', borderColor: '#c23c09' }}>
                    <div className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>{t('Demo Credentials:')}</div>
                    <div className="text-sm rounded-xl p-3 font-mono" style={{ backgroundColor: 'rgba(194, 60, 9, 0.1)', color: '#3a3a1d' }}>
                      admin@kfar.com<br/>
                      admin123
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors"
                    style={{ color: '#c23c09' }}
                  >
                    <i className="fas fa-chart-line"></i>
                    {t('Platform overview →')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Demo Button */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#f6af0d' }}>
            <div className="relative p-8">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full animate-pulse" style={{ backgroundColor: '#cfe7c1', opacity: 0.5 }}></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: '#f6af0d', opacity: 0.3, animationDelay: '0.5s' }}></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#f6af0d' }}>
                  <i className="fas fa-flask text-2xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                  🧪 {t('Just Testing?')}
                </h3>
                <p className="mb-6 text-lg" style={{ color: '#6b7280' }}>
                  {t('Skip the login and test all features with our demo center')}
                </p>
                <Link 
                  href="/demo-test" 
                  className="inline-flex items-center gap-3 px-8 py-4 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundColor: '#f6af0d' }}
                >
                  <i className="fas fa-rocket"></i>
                  <span>{t('Open Demo Center')}</span>
                  <i className="fas fa-arrow-right text-sm"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}