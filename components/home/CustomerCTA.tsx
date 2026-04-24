'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrCode, Mic, Gift, Brain, ShoppingBag, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

export default function CustomerCTA() {
  const [isHovered, setIsHovered] = useState(false)
  const { t } = useLanguage()

  const features = [
    {
      icon: <QrCode className="h-5 w-5" />,
      title: t("Personal QR Code"),
      description: t("Quick checkout & loyalty tracking")
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: t("Voice Shopping"), 
      description: t("Order in your preferred language")
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: t("Earn Rewards"),
      description: t("Get points on every purchase")
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: t("AI Assistant"),
      description: t("Personalized recommendations")
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              {t('New Customer Experience')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('Shop Smarter with')}
              <span className="text-green-600"> {t('AI-Powered Features')}</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('Join KFAR marketplace and experience the future of community shopping with personalized QR codes, voice commands, rewards, and AI recommendations.')}
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                    <div className="text-green-600">{feature.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/customer/register"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {t('Get Your QR Code')}
                <QrCode className={`ml-2 h-5 w-5 transition-transform ${isHovered ? 'rotate-12' : ''}`} />
              </Link>
              <Link
                href="/join-kfar"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {t('Learn More')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              {/* QR Code Preview */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-gray-50 rounded-xl">
                  <QrCode className="h-32 w-32 text-gray-800" />
                </div>
                <p className="mt-4 text-sm text-gray-600">{t('Your unique shopping identity')}</p>
              </div>

              {/* Points Preview */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{t('Welcome Bonus')}</p>
                    <p className="text-2xl font-bold text-gray-900">500 {t('Points')}</p>
                  </div>
                  <Gift className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Status badges */}
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {t('Bronze Member')}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {t('AI Enhanced')}
                </span>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>
            </div>

            {/* Floating feature badges */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12">
              {t('New!')}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-green-600">4</p>
            <p className="text-sm text-gray-600">{t('Loyalty Tiers')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">200</p>
            <p className="text-sm text-gray-600">{t('Points per Review')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">3</p>
            <p className="text-sm text-gray-600">{t('Languages')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">24/7</p>
            <p className="text-sm text-gray-600">{t('AI Support')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
