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
      <section className="relative bg-gradient-to-br from-[var(--leaf-green)] via-[var(--sun-gold)] to-[var(--earth-flame)] text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {language === 'he' ? 'ספקי השוק של כפר' : 'KFAR Marketplace Vendors'}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-6 opacity-90"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {language === 'he' ? 'גלה עסקים קהילתיים אותנטיים' : 'Discover Authentic Community Businesses'}
            </motion.p>
            <motion.p
              className="text-lg mb-8 opacity-80"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {language === 'he'
                ? 'מ-6 העסקים המייסדים שלנו ועד קהילת הספקים ההולכת וגדלה'
                : 'From our founding 6 businesses to our growing community of vendors'}
            </motion.p>

            {/* Search Bar with Animation */}
            <motion.div
              className="max-w-xl mx-auto relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                animate={{
                  boxShadow: searchFocused
                    ? '0 0 0 4px rgba(71, 140, 11, 0.3)'
                    : '0 0 0 0px rgba(71, 140, 11, 0)'
                }}
                transition={{ duration: 0.2 }}
                className="rounded-full"
              >
                <input
                  type="text"
                  placeholder={language === 'he' ? 'חיפוש ספקים...' : 'Search vendors...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full px-6 py-4 rounded-full text-gray-800 text-lg transition-all duration-200 ${
                    isRTL ? 'pl-14 pr-6 text-right' : 'pr-14 pl-6'
                  }`}
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
        className="sticky top-0 bg-white shadow-md z-40 py-4"
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
                whileHover={cardHover}
                transition={cardTransition}
              >
                <Link href={`/store/${vendor.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer group h-full">
                    {/* Vendor Banner */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={vendorBanners[vendor.id as keyof typeof vendorBanners] || '/images/banners/1.jpg'}
                        alt={vendor.name || "Image"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      {/* Vendor Logo */}
                      {vendor.logo && (
                        <motion.div
                          className={`absolute bottom-4 w-16 h-16 bg-white rounded-xl p-2 shadow-lg ${
                            isRTL ? 'right-4' : 'left-4'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Image
                            src={vendor.logo}
                            alt={vendor.name ? `${vendor.name} logo` : "Image"}
                            fill
                            className="object-contain"
                          />
                        </motion.div>
                      )}

                      {/* Badge - All vendors shown as active */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`absolute top-4 bg-[var(--leaf-green)] text-white px-3 py-1 rounded-full text-sm font-semibold ${
                          isRTL ? 'left-4' : 'right-4'
                        }`}
                      >
                        {language === 'he' ? 'פתוח עכשיו' : 'Open Now'}
                      </motion.div>
                    </div>

                    {/* Vendor Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{vendor.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 stroke-[1.5] fill-[var(--sun-gold)] text-[var(--sun-gold)]" />
                          <span>{vendor.rating || 4.5}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 stroke-[1.5]" />
                          <span>{vendor.product_count || 0} {language === 'he' ? 'מוצרים' : 'Products'}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {/* All vendors offer pickup */}
                        <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          <Truck className="w-3 h-3 stroke-[1.5]" />
                          {language === 'he' ? 'איסוף עצמי' : 'Pickup'}
                        </span>
                        {/* Community vendor badge */}
                        <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3 stroke-[1.5]" />
                          {language === 'he' ? 'עסק קהילתי' : 'Community'}
                        </span>
                        {vendor.category === 'food' && (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <Leaf className="w-3 h-3 stroke-[1.5]" />
                            {language === 'he' ? 'טבעוני' : 'Vegan'}
                          </span>
                        )}
                      </div>

                      {/* Visit Store Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[var(--leaf-green)] to-[#3a7209] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span className="relative z-10">
                          {language === 'he' ? 'בקר בחנות' : 'Visit Store'}
                        </span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <ChevronRight className="w-4 h-4 stroke-[2]" />
                        </motion.div>
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
        className="bg-white py-16"
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