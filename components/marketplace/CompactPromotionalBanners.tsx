'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Gift, Store, QrCode, Users, ChevronDown } from 'lucide-react'
import { useMobileDetect } from '@/hooks/useMobileDetect'

interface Banner {
  id: string
  type: 'customer' | 'vendor'
  title: string
  subtitle: string
  cta: string
  link: string
  bgGradient: string
  icon: React.ReactNode
  priority: number
}

export default function CompactPromotionalBanners() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { isMobile } = useMobileDetect()

  const banners: Banner[] = [
    {
      id: 'customer-welcome',
      type: 'customer',
      title: 'New? Get 500 Points!',
      subtitle: 'Join & earn rewards',
      cta: 'Join',
      link: '/join-as-customer',
      bgGradient: 'from-green-600 to-emerald-600',
      icon: <Gift className="h-5 w-5" />,
      priority: 1
    },
    {
      id: 'vendor-signup',
      type: 'vendor',
      title: 'Sell Online',
      subtitle: 'Join 50+ vendors',
      cta: 'Start',
      link: '/become-a-vendor',
      bgGradient: 'from-orange-600 to-amber-600',
      icon: <Store className="h-5 w-5" />,
      priority: 2
    },
    {
      id: 'customer-qr',
      type: 'customer',
      title: 'Get Your QR',
      subtitle: 'Shop faster',
      cta: 'Learn',
      link: '/join-kfar',
      bgGradient: 'from-purple-600 to-pink-600',
      icon: <QrCode className="h-5 w-5" />,
      priority: 3
    }
  ]

  useEffect(() => {
    // Check if user has dismissed for today
    const dismissedDate = localStorage.getItem('kfar-banner-dismissed-date')
    const today = new Date().toDateString()
    
    if (dismissedDate === today) {
      setIsDismissed(true)
    }
  }, [])

  useEffect(() => {
    // Auto-rotate only when not expanded
    if (!isExpanded && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [isExpanded, isDismissed, banners.length])

  const handleDismiss = () => {
    setIsDismissed(true)
    // Dismiss for today only
    localStorage.setItem('kfar-banner-dismissed-date', new Date().toDateString())
  }

  if (isDismissed) return null

  const banner = banners[currentBanner % banners.length]

  // Mobile View - Minimal Strip
  if (isMobile) {
    return (
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${banner.bgGradient} text-white`}>
              <div className="px-4 py-2">
                {!isExpanded ? (
                  // Collapsed View
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="flex items-center gap-2 flex-1"
                    >
                      {banner.icon}
                      <span className="text-sm font-medium">{banner.title}</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="p-1 ml-2"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  // Expanded View
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {banner.icon}
                        <div>
                          <h4 className="text-sm font-bold">{banner.title}</h4>
                          <p className="text-xs opacity-90">{banner.subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={banner.link}
                        className="flex-1 text-center py-1.5 bg-white/20 backdrop-blur-sm rounded text-sm font-medium"
                      >
                        {banner.cta} →
                      </Link>
                      <button
                        onClick={handleDismiss}
                        className="px-3 py-1.5 bg-white/10 rounded text-sm"
                      >
                        Not now
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mini Progress Dots */}
              <div className="flex justify-center gap-1 pb-1">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`h-0.5 rounded-full transition-all ${
                      index === currentBanner ? 'w-4 bg-white' : 'w-1 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Desktop/Tablet View - Slim Bar
  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${banner.bgGradient} text-white py-2`}>
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {banner.icon}
                  <div className="flex items-center gap-2 md:gap-4">
                    <h4 className="font-semibold text-sm md:text-base">{banner.title}</h4>
                    <span className="hidden md:inline text-sm opacity-90">•</span>
                    <p className="hidden md:inline text-sm opacity-90">{banner.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Other banners preview */}
                  <div className="hidden lg:flex items-center gap-1 mr-4">
                    {banners.map((b, index) => (
                      <button
                        key={b.id}
                        onClick={() => setCurrentBanner(index)}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          index === currentBanner
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {React.cloneElement(b.icon as React.ReactElement, { className: 'h-3 w-3' })}
                      </button>
                    ))}
                  </div>
                  
                  <Link
                    href={banner.link}
                    className="inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-all text-sm font-medium"
                  >
                    {banner.cta}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                  
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    aria-label="Dismiss banner"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Sticky Bottom Banner for Mobile (Alternative)
export function StickyMobileBanner() {
  const [isDismissed, setIsDismissed] = useState(false)
  const { isMobile } = useMobileDetect()

  useEffect(() => {
    const dismissed = sessionStorage.getItem('kfar-sticky-banner-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('kfar-sticky-banner-dismissed', 'true')
  }

  if (!isMobile || isDismissed) return null

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-16 left-0 right-0 z-40 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Get 500 Welcome Points!</p>
            <p className="text-xs opacity-90">Join KFAR today</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/join-as-customer"
            className="px-4 py-1.5 bg-white text-green-600 rounded-md text-sm font-semibold"
          >
            Join
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}