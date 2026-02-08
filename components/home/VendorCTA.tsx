'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Store, TrendingUp, Shield, Globe, ChevronRight, BarChart, Users, CreditCard } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function VendorCTA() {
  const [isHovered, setIsHovered] = useState(false)
  const { t } = useLanguage()

  const benefits = [
    {
      icon: <Store className="h-5 w-5" />,
      title: t("Digital Storefront"),
      description: t("Professional online presence")
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      title: t("Analytics Dashboard"), 
      description: t("Track sales & customer insights")
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: t("Secure Payments"),
      description: t("QR & traditional checkout")
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: t("Multi-Language"),
      description: t("Reach diverse customers")
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Visual */}
          <div className="relative order-2 md:order-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              {/* Dashboard Preview */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">{t("Today's Performance")}</h3>
                    <span className="text-green-600 text-sm font-medium">+23% ↑</span>
                  </div>
                  
                  {/* Mini chart bars */}
                  <div className="flex items-end justify-between h-20 mb-4">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <div key={i} className="flex-1 mx-1">
                        <div 
                          className="bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₪3,450</p>
                      <p className="text-xs text-gray-600">{t('Revenue')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">47</p>
                      <p className="text-xs text-gray-600">{t('Orders')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">4.8★</p>
                      <p className="text-xs text-gray-600">{t('Rating')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Templates Preview */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{t('6 Professional Banner Templates')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { color: '#478c0b', label: 'Sale' },
                    { color: '#f6af0d', label: 'Event' },
                    { color: '#c23c09', label: 'New' },
                    { color: '#3a3a1d', label: 'Special' },
                    { color: '#8B4513', label: 'Season' },
                    { color: '#2ECC71', label: 'Fresh' }
                  ].map((template, i) => (
                    <div key={i} className="relative group">
                      <div 
                        className="w-full h-8 rounded shadow-sm transition-transform group-hover:scale-105" 
                        style={{ backgroundColor: template.color }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                        {template.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-100 rounded-full opacity-20"></div>
            </div>

            {/* Success badge */}
            <div className="absolute -top-4 -left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12">
              {t('Success!')}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="order-1 md:order-2">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-4">
              {t('Vendor Opportunity')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('Grow Your Business with')}
              <span className="text-orange-600"> {t('KFAR Marketplace')}</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t("Join Village of Peace's digital transformation. Get professional tools, analytics, and multi-channel sales to reach more customers and grow revenue.")}
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                    <div className="text-orange-600">{benefit.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                    <p className="text-xs text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/become-a-vendor"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {t('Start Selling Today')}
                <Store className={`ml-2 h-5 w-5 transition-transform ${isHovered ? 'scale-110' : ''}`} />
              </Link>
              <Link
                href="/vendor/demo"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {t('View Demo')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-orange-600">0%</p>
            <p className="text-sm text-gray-600">{t('Setup Fees')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">6</p>
            <p className="text-sm text-gray-600">{t('Banner Templates')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">24/7</p>
            <p className="text-sm text-gray-600">{t('Support')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">3</p>
            <p className="text-sm text-gray-600">{t('Payment Methods')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}