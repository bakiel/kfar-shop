'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Gift, Store, QrCode, Users } from 'lucide-react'

interface Banner {
  id: string
  type: 'customer' | 'vendor'
  title: string
  subtitle: string
  cta: string
  link: string
  bgGradient: string
  icon: React.ReactNode
}

export default function PromotionalBanners() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([])

  const banners: Banner[] = [
    {
      id: 'customer-welcome',
      type: 'customer',
      title: 'New to KFAR? Get 500 Welcome Points!',
      subtitle: 'Join today and start earning rewards on every purchase',
      cta: 'Get Your QR Code',
      link: '/join-as-customer',
      bgGradient: 'from-green-600 to-emerald-600',
      icon: <Gift className="h-8 w-8" />
    },
    {
      id: 'vendor-signup',
      type: 'vendor',
      title: 'Grow Your Business Online',
      subtitle: 'Join 50+ vendors already selling on KFAR Marketplace',
      cta: 'Become a Vendor',
      link: '/become-a-vendor',
      bgGradient: 'from-orange-600 to-amber-600',
      icon: <Store className="h-8 w-8" />
    },
    {
      id: 'customer-qr',
      type: 'customer',
      title: 'Shop Faster with Personal QR',
      subtitle: 'Skip the queue, earn points, get personalized deals',
      cta: 'Learn More',
      link: '/join-kfar',
      bgGradient: 'from-purple-600 to-pink-600',
      icon: <QrCode className="h-8 w-8" />
    },
    {
      id: 'vendor-community',
      type: 'vendor',
      title: 'Join the Village of Peace Digital Revolution',
      subtitle: 'Professional tools, analytics, and multi-language support',
      cta: 'Start Selling',
      link: '/become-a-vendor',
      bgGradient: 'from-teal-600 to-cyan-600',
      icon: <Users className="h-8 w-8" />
    }
  ]

  // Filter out dismissed banners
  const activeBanners = banners.filter(banner => !dismissedBanners.includes(banner.id))

  useEffect(() => {
    // Load dismissed banners from localStorage
    const dismissed = localStorage.getItem('kfar-dismissed-banners')
    if (dismissed) {
      setDismissedBanners(JSON.parse(dismissed))
    }
  }, [])

  useEffect(() => {
    // Auto-rotate banners every 8 seconds
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % activeBanners.length)
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [activeBanners.length])

  const handleDismiss = (bannerId: string) => {
    const newDismissed = [...dismissedBanners, bannerId]
    setDismissedBanners(newDismissed)
    localStorage.setItem('kfar-dismissed-banners', JSON.stringify(newDismissed))
  }

  if (activeBanners.length === 0) return null

  const banner = activeBanners[currentBanner % activeBanners.length]

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className={`bg-gradient-to-r ${banner.bgGradient} text-white py-4 px-4 sm:px-6 lg:px-8`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className="hidden sm:block">
                  {banner.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold">
                    {banner.title}
                  </h3>
                  <p className="text-sm opacity-90 hidden sm:block">
                    {banner.subtitle}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href={banner.link}
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all text-sm font-medium"
                >
                  {banner.cta}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
                
                <button
                  onClick={() => handleDismiss(banner.id)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress indicators */}
            {activeBanners.length > 1 && (
              <div className="flex justify-center gap-1 mt-3">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === currentBanner % activeBanners.length
                        ? 'w-8 bg-white'
                        : 'w-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Slim version for mobile
export function PromotionalBannersMobile() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('kfar-mobile-banner-dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('kfar-mobile-banner-dismissed', 'true')
  }

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-2">
          <p className="text-sm font-medium">
            Get your personal QR code!
          </p>
          <p className="text-xs opacity-90">
            Join KFAR for exclusive benefits
          </p>
        </div>
        <Link
          href="/join-as-customer"
          className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded text-xs font-medium whitespace-nowrap"
        >
          Join Now
        </Link>
        <button
          onClick={handleDismiss}
          className="ml-2 p-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}