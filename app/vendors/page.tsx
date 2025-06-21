'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaStore, FaStar, FaTruck, FaClock, FaLeaf, FaSearch, FaFilter } from 'react-icons/fa'
import { vendorsApi } from '@/lib/api/vendors'
import type { Vendor } from '@/lib/api/vendors'

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

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const data = await vendorsApi.getAll()
      setVendors(data)
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
    { id: 'all', name: 'All Vendors', icon: FaStore },
    { id: 'food', name: 'Food & Beverages', icon: FaLeaf },
    { id: 'merchandise', name: 'Merchandise & Heritage', icon: FaStore },
    { id: 'wellness', name: 'Health & Wellness', icon: FaLeaf }
  ]

  return (
    <div className="min-h-screen bg-[var(--cream-base)]">
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
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              KiFar Marketplace Vendors
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Discover Authentic Community Businesses
            </p>
            <p className="text-lg mb-8 opacity-80">
              From our founding 6 businesses to our growing community of vendors
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-800 text-lg pr-14"
              />
              <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <div className="sticky top-0 bg-white shadow-md z-40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--leaf-green)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="text-sm" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-[var(--leaf-green)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--leaf-green)] focus:ring-opacity-20"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="products">Most Products</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
          <div className="text-center py-12">
            <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">No vendors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sortedVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/store/${vendor.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
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
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-xl p-2 shadow-lg">
                          <Image
                            src={vendor.logo}
                            alt={vendor.name ? `${vendor.name} logo` : "Image"}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      
                      {/* Badge */}
                      {vendor.is_active && (
                        <div className="absolute top-4 right-4 bg-[var(--leaf-green)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Open Now
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{vendor.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-[var(--sun-gold)]" />
                          <span>{vendor.rating || 4.5}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStore />
                          <span>{vendor.product_count || 0} Products</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex gap-2 mb-4">
                        {vendor.delivery_available && (
                          <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <FaTruck /> Delivery
                          </span>
                        )}
                        {vendor.business_hours && (
                          <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <FaClock /> {vendor.business_hours}
                          </span>
                        )}
                        {vendor.category === 'food' && (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <FaLeaf /> Vegan
                          </span>
                        )}
                      </div>

                      {/* Visit Store Button */}
                      <button className="w-full bg-gradient-to-r from-[var(--leaf-green)] to-[#3a7209] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                        <span className="relative z-10">Visit Store</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Info Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Supporting Village of Peace Commerce
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Every purchase supports our community's mission of sustainable living, 
              vegan lifestyle, and spiritual growth. Our vendors are carefully selected 
              to align with our values and provide authentic, high-quality products.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--leaf-green)] mb-2">100%</div>
                <div className="text-gray-600">Vegan Products</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--sun-gold)] mb-2">50+</div>
                <div className="text-gray-600">Years of Heritage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--earth-flame)] mb-2">6+</div>
                <div className="text-gray-600">Community Vendors</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}