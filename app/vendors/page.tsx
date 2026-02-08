'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Store, Star, Truck, Clock, Leaf, Search, SlidersHorizontal, Package, ChevronRight, Sparkles, Heart, Users } from 'lucide-react'
import { vendorStores } from '@/lib/data/wordpress-style-data-layer'
import { useLanguage } from '@/lib/context/LanguageContext'

// Local vendor interface
interface Vendor {
  id: string
  name: string
  description: string
  logo: string
  banner?: string
  category: string
  rating: number
  product_count: number
  tags?: string[]
}
import { listContainer, listItem, cardHover, cardTransition, scrollReveal } from '@/lib/animations/motion-variants'

const vendorBanners = {
  'teva-deli': '/images/banners/1.jpg',
  'queens-cuisine': '/images/banners/2.jpg',
  'people-store': '/images/banners/3.jpg',
  'atur-avior': '/images/banners/4.jpg',
  'vop-shop': '/images/banners/5.jpg',
  'gahn-delight': '/images/banners/6.jpg'
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [searchFocused, setSearchFocused] = useState(false)

  const { language, isRTL } = useLanguage()
  const prefersReducedMotion = useReducedMotion()
  const infoSectionRef = useRef(null)
  const infoInView = useInView(infoSectionRef, { once: true, margin: '-100px' })

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = () => {
    try {
      setLoading(true)
      // Use local data from wordpress-style-data-layer
      const vendorData: Vendor[] = Object.entries(vendorStores).map(([id, store]) => ({
        id,
        name: store.name,
        description: store.description,
        logo: store.logo,
        banner: vendorBanners[id as keyof typeof vendorBanners] || '/images/banners/1.jpg',
        category: store.tags?.includes('food') ? 'food' : store.tags?.includes('merchandise') ? 'merchandise' : 'wellness',
        rating: store.rating || 4.5,
        product_count: store.products?.length || 0,
        tags: store.tags
      }))
      setVendors(vendorData)
    } catch (error) {
      console.error('Failed to load vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'products':
        return (b.product_count || 0) - (a.product_count || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const categories = [
    { id: 'all', name: language === 'he' ? 'כל החנויות' : 'All Vendors', icon: Store },
    { id: 'food', name: language === 'he' ? 'מזון ומשקאות' : 'Food & Beverages', icon: Leaf },
    { id: 'merchandise', name: language === 'he' ? 'סחורות ומורשת' : 'Merchandise & Heritage', icon: Package },
    { id: 'wellness', name: language === 'he' ? 'בריאות ורווחה' : 'Health & Wellness', icon: Heart }
  ]

  return (
    <div className="min-h-screen bg-[var(--cream-base)]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a0a 0%, #2D5A27 40%, #478c0b 70%, #3a7209 100%)' }}>
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C4A265 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f6af0d 0%, transparent 70%)' }} />
        <div className="absolute inset-0 bg-black/5"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Subtle label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-5"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full font-medium tracking-wide" style={{ backgroundColor: 'rgba(196, 162, 101, 0.2)', color: '#F5F0E8', border: '1px solid rgba(196, 162, 101, 0.3)' }}>
                <Users className="w-3.5 h-3.5 stroke-[1.5]" />
                {language === 'he' ? 'קהילת ספקים' : 'Community Partners'}
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-5 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
            >
              {language === 'he' ? 'ספקי השוק של כפר' : 'Our Vendors'}
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl mb-10 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ color: 'rgba(245, 240, 232, 0.8)' }}
            >
              {language === 'he'
                ? 'גלה עסקים קהילתיים אותנטיים מכפר השלום'
                : 'Discover authentic community businesses from the Village of Peace'}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="max-w-lg mx-auto relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                animate={{
                  boxShadow: searchFocused
                    ? '0 0 0 3px rgba(196, 162, 101, 0.4)'
                    : '0 0 0 0px rgba(196, 162, 101, 0)'
                }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl"
              >
                <input
                  type="text"
                  placeholder={language === 'he' ? 'חיפוש ספקים...' : 'Search vendors...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full px-6 py-4 rounded-2xl text-gray-800 text-base transition-all duration-200 border-0 focus:outline-none focus:ring-0 ${
                    isRTL ? 'pl-14 pr-6 text-right' : 'pr-14 pl-6'
                  }`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
                />
              </motion.div>
              <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 stroke-[1.5] ${
                isRTL ? 'left-5' : 'right-5'
              }`} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="sticky top-0 z-40 py-4 border-b border-gray-100"
        style={{ backgroundColor: 'rgba(253, 251, 247, 0.95)', backdropFilter: 'blur(16px)' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat, index) => {
                const IconComponent = cat.icon
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[var(--leaf-green)] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 stroke-[1.5]" />
                    <span>{cat.name}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {language === 'he' ? 'מיין לפי:' : 'Sort by:'}
              </span>
              <motion.select
                whileHover={{ scale: 1.02 }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-[var(--leaf-green)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--leaf-green)] focus:ring-opacity-20 cursor-pointer"
              >
                <option value="featured">{language === 'he' ? 'מומלצים' : 'Featured'}</option>
                <option value="rating">{language === 'he' ? 'דירוג גבוה' : 'Highest Rated'}</option>
                <option value="products">{language === 'he' ? 'הכי הרבה מוצרים' : 'Most Products'}</option>
                <option value="name">{language === 'he' ? 'אלפביתי' : 'Alphabetical'}</option>
              </motion.select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vendors Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedVendors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Store className="w-16 h-16 stroke-[1.5] text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">
              {language === 'he' ? 'לא נמצאו ספקים' : 'No vendors found'}
            </h3>
            <p className="text-gray-500">
              {language === 'he' ? 'נסה לשנות את החיפוש או הסינון' : 'Try adjusting your search or filters'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sortedVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                variants={listItem}
                whileHover={{ y: -6, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Link href={`/store/${vendor.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden cursor-pointer group h-full border border-gray-100/80" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)' }}>
                    {/* Vendor Banner */}
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={vendorBanners[vendor.id as keyof typeof vendorBanners] || '/images/banners/1.jpg'}
                        alt={vendor.name || "Image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                      {/* Vendor Logo - Floating above card content */}
                      {vendor.logo && (
                        <motion.div
                          className={`absolute -bottom-8 w-16 h-16 bg-white rounded-2xl p-1.5 shadow-lg border-2 border-white ${
                            isRTL ? 'right-5' : 'left-5'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          style={{ zIndex: 2 }}
                        >
                          <Image
                            src={vendor.logo}
                            alt={vendor.name ? `${vendor.name} logo` : "Image"}
                            fill
                            className="object-contain rounded-xl"
                          />
                        </motion.div>
                      )}

                      {/* Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`absolute top-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide uppercase ${
                          isRTL ? 'left-3' : 'right-3'
                        }`}
                        style={{ backgroundColor: 'rgba(71, 140, 11, 0.9)', color: 'white', backdropFilter: 'blur(8px)' }}
                      >
                        {language === 'he' ? 'פתוח' : 'Open'}
                      </motion.div>

                      {/* Vendor Name on banner */}
                      <div className={`absolute bottom-3 ${isRTL ? 'right-24' : 'left-24'}`}>
                        <h3 className="text-lg font-bold text-white drop-shadow-lg">{vendor.name}</h3>
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="p-5 pt-12">
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{vendor.description}</p>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 stroke-[1.5] fill-[#f6af0d] text-[#f6af0d]" />
                          <span className="font-semibold text-gray-800">{vendor.rating || 4.5}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 stroke-[1.5] text-gray-400" />
                          <span className="text-gray-500">{vendor.product_count || 0} {language === 'he' ? 'מוצרים' : 'products'}</span>
                        </div>
                      </div>

                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(71, 140, 11, 0.06)', color: '#478c0b' }}>
                          <Truck className="w-3 h-3 stroke-[1.5]" />
                          {language === 'he' ? 'איסוף' : 'Pickup'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(196, 162, 101, 0.08)', color: '#C4A265' }}>
                          <Users className="w-3 h-3 stroke-[1.5]" />
                          {language === 'he' ? 'קהילתי' : 'Community'}
                        </span>
                        {vendor.category === 'food' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(71, 140, 11, 0.06)', color: '#2D5A27' }}>
                            <Leaf className="w-3 h-3 stroke-[1.5]" />
                            {language === 'he' ? 'טבעוני' : 'Vegan'}
                          </span>
                        )}
                      </div>

                      {/* Visit Store Button */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#478c0b', color: 'white' }}
                      >
                        <span>
                          {language === 'he' ? 'בקר בחנות' : 'Visit Store'}
                        </span>
                        <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Info Section - Scroll Triggered */}
      <motion.section
        ref={infoSectionRef}
        initial="hidden"
        animate={infoInView ? "visible" : "hidden"}
        variants={scrollReveal}
        className="py-20"
        style={{ backgroundColor: '#FDFBF7' }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={infoInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-bold text-gray-800 mb-6"
            >
              {language === 'he' ? 'תומכים במסחר של כפר השלום' : 'Supporting Village of Peace Commerce'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={infoInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              {language === 'he'
                ? 'כל רכישה תומכת במשימת הקהילה שלנו לחיים בני-קיימא, אורח חיים טבעוני וצמיחה רוחנית. הספקים שלנו נבחרו בקפידה כדי להתאים לערכים שלנו ולספק מוצרים איכותיים ואותנטיים.'
                : 'Every purchase supports our community\'s mission of sustainable living, vegan lifestyle, and spiritual growth. Our vendors are carefully selected to align with our values and provide authentic, high-quality products.'}
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={infoInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-xl bg-green-50"
              >
                <motion.div
                  className="w-12 h-12 mx-auto mb-3 bg-[var(--leaf-green)] rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 12 }}
                >
                  <Leaf className="w-6 h-6 stroke-[1.5] text-white" />
                </motion.div>
                <div className="text-4xl font-bold text-[var(--leaf-green)] mb-2">100%</div>
                <div className="text-gray-600">
                  {language === 'he' ? 'מוצרים טבעוניים' : 'Vegan Products'}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={infoInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-xl bg-yellow-50"
              >
                <motion.div
                  className="w-12 h-12 mx-auto mb-3 bg-[var(--sun-gold)] rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 12 }}
                >
                  <Sparkles className="w-6 h-6 stroke-[1.5] text-white" />
                </motion.div>
                <div className="text-4xl font-bold text-[var(--sun-gold)] mb-2">50+</div>
                <div className="text-gray-600">
                  {language === 'he' ? 'שנות מורשת' : 'Years of Heritage'}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={infoInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-xl bg-orange-50"
              >
                <motion.div
                  className="w-12 h-12 mx-auto mb-3 bg-[var(--earth-flame)] rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 12 }}
                >
                  <Users className="w-6 h-6 stroke-[1.5] text-white" />
                </motion.div>
                <div className="text-4xl font-bold text-[var(--earth-flame)] mb-2">6+</div>
                <div className="text-gray-600">
                  {language === 'he' ? 'ספקים קהילתיים' : 'Community Vendors'}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}