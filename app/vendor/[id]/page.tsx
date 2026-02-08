'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, Eye, Star, ShoppingCart, Check, CheckCircle, Grid3X3, List,
  MapPin, Award, Clock, Truck, Gift, Package, ChevronDown,
  Store, Heart, Share2, Phone, Mail, ExternalLink, Leaf, X
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { vendorStores, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';
import { useCart } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { Product, Vendor } from '@/lib/types/products';
import {
  pageContainer,
  pageItem,
  listContainer,
  listItem,
  cardHover,
  cardTransition,
  buttonMotionProps,
  scrollReveal,
  modalBackdrop,
  modalContent
} from '@/lib/animations/motion-variants';
import '@/styles/kfar-style-system.css';

export default function VendorStorePage() {
  const params = useParams();
  const vendorId = params.id as string;
  const { addToCart } = useCart();
  const { language, isRTL, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Refs for scroll animations
  const productsRef = useRef(null);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickView, setShowQuickView] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string[]>([]);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, [vendorId, selectedCategory, sortBy]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);

      // Debug logging
      console.log('🔍 Fetching vendor data for:', vendorId);
      console.log('🔍 Available vendors:', Object.keys(vendorStores));

      // Get vendor details from our data
      const vendorStore = vendorStores[vendorId];
      console.log('🔍 Vendor store found:', !!vendorStore);
      console.log('🔍 Vendor products count:', vendorStore?.products?.length || 0);

      if (!vendorStore) {
        console.error('Vendor not found:', vendorId);
        setLoading(false);
        return;
      }
      
      // Set vendor data with correct banner mappings (vision-verified)
      const vendorBanners: Record<string, string> = {
        'teva-deli': '/images/vendor-banners/5.jpg',        // Plant-Based Protein products
        'garden-of-light': '/images/vendor-banners/2.jpg',  // Vegan deli containers with sun logo
        'queens-cuisine': '/images/vendor-banners/6.jpg',   // Queen's Cuisine prepared meals
        'people-store': '/images/vendor-banners/4.jpg',     // Community store with multiple brands
        'vop-shop': '/images/vendor-banners/3.jpg',         // T-shirts, mugs "Wear the Message"
        'gahn-delight': '/images/vendor-banners/1.jpg'      // Ice cream with "NATURALLY INSPIRED"
      };
      
      // Enhanced vendor data with additional information
      const vendorDetails: Record<string, any> = {
        'teva-deli': {
          founded: '1986',
          specialty: 'Vegan Deli Products',
          location: 'Tel Aviv, Israel',
          kashrut: 'Badatz Mehadrin',
          highlights: ['Family-Owned Since 1986', 'Traditional Israeli Flavors', '100% Plant-Based', 'Kosher Certified'],
          deliveryTime: '1-2 days',
          minimumOrder: 150,
          yearsInBusiness: 38
        },
        'garden-of-light': {
          founded: '2018',
          specialty: 'Mediterranean Vegan Cuisine',
          location: 'Jerusalem, Israel',
          kashrut: 'Badatz Jerusalem',
          highlights: ['Fresh Daily Preparation', 'Organic Ingredients', 'Traditional Recipes', 'Gluten-Free Options'],
          deliveryTime: '2-3 days',
          minimumOrder: 200,
          yearsInBusiness: 6
        },
        'queens-cuisine': {
          founded: '2020',
          specialty: 'Gourmet Plant-Based Meals',
          location: 'Haifa, Israel',
          kashrut: 'Rabbanut Haifa',
          highlights: ['Chef-Crafted Meals', 'Meal Prep Solutions', 'International Flavors', 'Protein-Rich Options'],
          deliveryTime: '1-2 days',
          minimumOrder: 180,
          yearsInBusiness: 4
        },
        'people-store': {
          founded: '1975',
          specialty: 'Natural & Organic Products',
          location: 'Multiple Locations',
          kashrut: 'Various Certifications',
          highlights: ['Community Co-op', 'Local Suppliers', 'Bulk Options', 'Zero-Waste Focus'],
          deliveryTime: 'Same day',
          minimumOrder: 100,
          yearsInBusiness: 49
        },
        'vop-shop': {
          founded: '1969',
          specialty: 'Community Wellness Products',
          location: 'Dimona, Israel',
          kashrut: 'Community Certified',
          highlights: ['50+ Years Heritage', 'Community Made', 'Holistic Wellness', 'Cultural Preservation'],
          deliveryTime: '3-5 days',
          minimumOrder: 200,
          yearsInBusiness: 55
        },
        'gahn-delight': {
          founded: '2015',
          specialty: 'Artisanal Vegan Ice Cream',
          location: 'Beer Sheva, Israel',
          kashrut: 'Badatz Beer Sheva',
          highlights: ['Natural Ingredients', 'Unique Flavors', 'Sugar-Free Options', 'Allergen-Friendly'],
          deliveryTime: '2-3 days',
          minimumOrder: 120,
          yearsInBusiness: 9
        }
      };
      
      const details = vendorDetails[vendorId] || {};
      
      setVendor({
        id: vendorId,
        name: vendorStore.name,
        logo: vendorStore.logo,
        banner: vendorBanners[vendorId] || '/images/vendor-banners/1.jpg',
        description: vendorStore.description,
        rating: vendorStore.rating || 4.5,
        reviewCount: vendorStore.products.length * 3, // Estimated reviews
        categories: [...new Set(vendorStore.products.map(p => p.category))],
        tags: vendorStore.tags || [],
        verified: true,
        ...details,
        totalProducts: vendorStore.products.length,
        phone: '+972-50-123-4567',
        email: `info@${vendorId}.co.il`,
        address: details.location,
        businessHours: 'Sunday-Thursday: 9:00 AM - 6:00 PM\nFriday: 9:00 AM - 2:00 PM',
        deliveryPolicy: 'Free delivery on orders above ₪' + details.minimumOrder + '. Standard delivery fees apply for smaller orders.',
        returnPolicy: '30-day satisfaction guarantee. Full refund for unopened items.',
        promotions: [
          {
            title: 'New Customer Special',
            description: 'Get 10% off your first order with code WELCOME10'
          }
        ]
      });
      
      // Get vendor products
      let vendorProducts = getProductsByVendor(vendorId);
      console.log('🔍 Products from getProductsByVendor:', vendorProducts.length);
      console.log('🔍 First 3 products:', vendorProducts.slice(0, 3).map(p => p.name));

      // Filter by category
      if (selectedCategory !== 'all') {
        vendorProducts = vendorProducts.filter(p => p.category === selectedCategory);
        console.log('🔍 Products after category filter:', vendorProducts.length);
      }

      // Sort products
      if (sortBy === 'price-low') {
        vendorProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        vendorProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        vendorProducts.sort((a, b) => a.name.localeCompare(b.name));
      }

      console.log('🔍 Setting products state with', vendorProducts.length, 'products');
      setProducts(vendorProducts);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendorId: product.vendorId,
      vendorName: vendor?.name || '',
    });
    
    setAddedToCart([...addedToCart, product.id]);
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(id => id !== product.id));
    }, 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#478c0b', borderTopColor: 'transparent' }}></div>
              <div className="absolute inset-2 border-4 border-b-transparent rounded-full animate-spin" style={{ borderColor: '#f6af0d', borderBottomColor: 'transparent', animationDirection: 'reverse' }}></div>
            </div>
            <p className="text-body kfar-text-gray-600">
              {language === 'he' ? 'טוען חנות...' : 'Loading store...'}
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!vendor) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Store className="w-16 h-16 mx-auto mb-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
            <p className="text-body-lg kfar-text-gray-600 mb-4">
              {language === 'he' ? 'החנות לא נמצאה' : 'Store not found'}
            </p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary flex items-center gap-2 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
                {language === 'he' ? 'חזרה לחנות' : 'Back to Shop'}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.flatMap(p => p.categories || [])));

  return (
    <Layout>
      <div className="min-h-screen kfar-bg-cream" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Enhanced Vendor Banner with Better Contrast */}
        <div className="relative h-80 md:h-[450px] overflow-hidden">
          {vendor.banner ? (
            <Image
              src={vendor.banner}
              alt={vendor.name || "Image"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 kfar-gradient-primary">
              <div className="absolute inset-0 cultural-pattern"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20"></div>
          
          {/* Vendor Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                {vendor.logo && (
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity kfar-gradient-primary"></div>
                    <div className="relative w-28 h-28 md:w-36 md:h-36 bg-white rounded-full p-3 shadow-2xl">
                      <Image
                        src={vendor.logo}
                        alt={vendor.name || "Image"}
                        fill
                        className="object-contain rounded-full"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 text-white">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{vendor.name}</h1>
                      {vendor.verified && (
                        <span className="badge px-4 py-2 text-white flex items-center gap-1 font-bold" style={{ backgroundColor: '#478c0b' }}>
                          <CheckCircle className="w-4 h-4 stroke-[1.5]" />
                          Verified
                        </span>
                      )}
                    </div>
                    {vendor.specialty && (
                      <p className="text-xl font-medium mb-3" style={{ color: '#f6af0d' }}>{vendor.specialty}</p>
                    )}
                    <p className="text-lg md:text-xl opacity-95 mb-6 max-w-2xl leading-relaxed">{vendor.description}</p>
                    
                    {/* Vendor Highlights */}
                    {vendor.highlights && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {vendor.highlights.map((highlight: string, index: number) => (
                          <span
                            key={index}
                            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20"
                      >
                        <Star className="w-5 h-5 stroke-[1.5]" fill="#f6af0d" stroke="#f6af0d" />
                        <span className="font-bold text-lg">{vendor.rating.toFixed(1)}</span>
                        <span className="opacity-90">({vendor.reviewCount} reviews)</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20"
                      >
                        <Truck className="w-5 h-5 stroke-[1.5]" />
                        <span className="font-medium">{vendor.deliveryTime}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20"
                      >
                        <Package className="w-5 h-5 stroke-[1.5]" />
                        <span className="font-medium">Min. ₪{vendor.minimumOrder}</span>
                      </motion.div>
                      {vendor.kashrut && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20"
                        >
                          <Award className="w-5 h-5 stroke-[1.5]" />
                          <span className="font-medium">{vendor.kashrut}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Vendor Info Card */}
                  <div className="hidden lg:block mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-sm">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {vendor.founded && (
                          <div>
                            <p className="text-white/70 mb-1">Founded</p>
                            <p className="font-bold text-lg">{vendor.founded}</p>
                          </div>
                        )}
                        {vendor.location && (
                          <div>
                            <p className="text-white/70 mb-1">Location</p>
                            <p className="font-bold text-lg">{vendor.location}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-white/70 mb-1">Products</p>
                          <p className="font-bold text-lg">{products.length}+</p>
                        </div>
                        <div>
                          <p className="text-white/70 mb-1">Experience</p>
                          <p className="font-bold text-lg">{vendor.yearsInBusiness}+ years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Navigation Bar */}
        <div className="bg-white kfar-shadow-md sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`btn ${
                    selectedCategory === 'all'
                      ? 'btn-primary'
                      : 'kfar-bg-gray-100 kfar-text-gray-700 hover:kfar-bg-gray-200'
                  } whitespace-nowrap`}
                >
                  All Products ({products.length})
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`btn ${
                      selectedCategory === category
                        ? 'btn-primary'
                        : 'kfar-bg-gray-100 kfar-text-gray-700 hover:kfar-bg-gray-200'
                    } whitespace-nowrap`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input text-body"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="newest">Newest First</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ color: viewMode === 'grid' ? '#478c0b' : undefined }}
                  >
                    <Grid3X3 className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ color: viewMode === 'list' ? '#478c0b' : undefined }}
                  >
                    <List className="w-5 h-5 stroke-[1.5]" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Promotional Banner */}
          {vendor.promotions && vendor.promotions.length > 0 && (
            <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden kfar-bg-earth-flame kfar-shadow-lg">
              <div className="absolute inset-0 opacity-10 cultural-pattern"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-h2 mb-2">🎉 {vendor.promotions[0].title}</h3>
                  <p className="text-body-lg opacity-90">{vendor.promotions[0].description}</p>
                </div>
                <Gift className="w-10 h-10 opacity-50 stroke-[1.5]" />
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div ref={productsRef}>
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400 stroke-[1]" />
                <p className="text-h5 kfar-text-gray-600">
                  {language === 'he' ? 'לא נמצאו מוצרים בקטגוריה זו' : 'No products found in this category'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={listContainer}
                initial="hidden"
                animate={!loading ? "show" : "hidden"}
                className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={listItem}
                    className={viewMode === 'grid' ? '' : 'card'}
                  >
                    {viewMode === 'grid' ? (
                      // Grid View Card with Enhanced Contrast + Motion
                      <motion.div
                        whileHover={shouldReduceMotion ? {} : cardHover}
                        transition={cardTransition}
                        className="card group relative overflow-hidden p-0 border-2 border-gray-100 hover:border-transparent cursor-pointer h-full"
                      >
                        {/* Quick View Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowQuickView(product.id)}
                          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                          style={{ color: '#478c0b' }}
                        >
                          <Eye className="w-5 h-5 stroke-[1.5]" />
                        </motion.button>

                      {/* Product Image */}
                      <Link href={`/product/${product.id}`}>
                        <div className="relative h-56 overflow-hidden bg-gray-50">
                          <Image
                            src={product.image}
                            alt={product.name || "Product"}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {product.badge && (
                            <span 
                              className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full text-white shadow-md"
                              style={{ 
                                backgroundColor: product.badge === 'hot' ? '#c23c09' : 
                                                product.badge === 'new' ? '#478c0b' : 
                                                product.badge === 'sale' ? '#f6af0d' : '#3a3a1d' 
                              }}
                            >
                              {product.badge.toUpperCase()}
                            </span>
                          )}
                          {product.kosher && (
                            <span className="absolute top-3 right-14 px-2 py-1 text-xs font-bold rounded-full text-white shadow-md" style={{ backgroundColor: '#3a3a1d' }}>
                              כשר
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-5">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:opacity-80 transition-opacity" style={{ color: '#3a3a1d' }}>
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        {/* Product Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.vegan && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              🌱 Vegan
                            </span>
                          )}
                          {product.organic && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🌿 Organic
                            </span>
                          )}
                          {product.glutenFree && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              🌾 Gluten-Free
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4"
                                fill={i < Math.floor(product.rating || 4.5) ? '#f6af0d' : 'transparent'}
                                stroke={i < Math.floor(product.rating || 4.5) ? '#f6af0d' : '#e5e7eb'}
                                strokeWidth={1.5}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">({product.reviewCount || 0})</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                              ₪{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₪{product.originalPrice}
                              </span>
                            )}
                            {product.unit && (
                              <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddToCart(product)}
                            className="p-3 rounded-full text-white shadow-md hover:shadow-lg cursor-pointer"
                            style={{
                              backgroundColor: addedToCart.includes(product.id) ? '#3a3a1d' : '#478c0b'
                            }}
                          >
                            {addedToCart.includes(product.id) ? (
                              <Check className="w-5 h-5 stroke-[2]" />
                            ) : (
                              <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // List View Card
                    <div className="flex gap-6">
                      <Link href={`/product/${product.id}`}>
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name || "Image"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/product/${product.id}`}>
                              <h3 className="text-h4 mb-2 hover:kfar-text-leaf-green transition-colors kfar-text-soil">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-body kfar-text-gray-600 mb-3">{product.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4"
                                    fill={i < Math.floor(product.rating || 4.5) ? '#f6af0d' : 'transparent'}
                                    stroke={i < Math.floor(product.rating || 4.5) ? '#f6af0d' : '#e5e7eb'}
                                    strokeWidth={1.5}
                                  />
                                ))}
                                <span className="text-body-sm kfar-text-gray-600 ml-1">({product.reviewCount || 0})</span>
                              </div>
                              {product.isVegan && (
                                <span className="badge badge-success flex items-center gap-1">
                                  <Leaf className="w-3 h-3 stroke-[1.5]" />Vegan
                                </span>
                              )}
                              {product.isKosher && (
                                <span className="badge kfar-bg-cream kfar-text-soil flex items-center gap-1">
                                  <Award className="w-3 h-3 stroke-[1.5]" />Kosher
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-3">
                              <span className="text-h3 kfar-text-earth-flame">
                                ₪{product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-body-lg kfar-text-gray-500 line-through ml-2">
                                  ₪{product.originalPrice}
                                </span>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAddToCart(product)}
                              className={`btn btn-primary flex items-center gap-2 cursor-pointer ${
                                addedToCart.includes(product.id) ? 'kfar-bg-leaf-green-dark' : ''
                              }`}
                            >
                              {addedToCart.includes(product.id) ? (
                                <Check className="w-4 h-4 stroke-[2]" />
                              ) : (
                                <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                              )}
                              {addedToCart.includes(product.id) ? 'Added!' : 'Add to Cart'}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

        {/* Vendor Info Section */}
        <div className="bg-white mt-16 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* About Vendor */}
              <div>
                <h3 className="text-h2 mb-4 kfar-text-soil">
                  About {vendor.name}
                </h3>
                <p className="text-body kfar-text-gray-600 mb-6">{vendor.longDescription || vendor.description}</p>
                
                {/* Vendor Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg kfar-bg-cream">
                    <div className="text-h3 mb-1 kfar-text-leaf-green">
                      {vendor.yearsInBusiness || '5+'}
                    </div>
                    <div className="text-body-sm kfar-text-gray-600">Years in Business</div>
                  </div>
                  <div className="text-center p-4 rounded-lg kfar-bg-cream">
                    <div className="text-h3 mb-1 kfar-text-sun-gold">
                      {vendor.totalProducts || products.length}
                    </div>
                    <div className="text-body-sm kfar-text-gray-600">Products</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  {vendor.phone && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Phone className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                      <span>{vendor.phone}</span>
                    </motion.div>
                  )}
                  {vendor.email && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Mail className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                      <span>{vendor.email}</span>
                    </motion.div>
                  )}
                  {vendor.address && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 stroke-[1.5]" style={{ color: '#478c0b' }} />
                      <span>{vendor.address}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Policies & Hours */}
              <div>
                <h3 className="text-h2 mb-4 kfar-text-soil">
                  Store Policies
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border-l-4 kfar-bg-cream kfar-border-leaf-green">
                    <h4 className="text-h6 mb-2">Delivery Policy</h4>
                    <p className="text-body-sm kfar-text-gray-600">
                      {vendor.deliveryPolicy || 'Free delivery on orders above ₪150. Standard delivery fees apply for smaller orders.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border-l-4 kfar-bg-cream kfar-border-sun-gold">
                    <h4 className="text-h6 mb-2">Return Policy</h4>
                    <p className="text-body-sm kfar-text-gray-600">
                      {vendor.returnPolicy || '30-day satisfaction guarantee. Full refund for unopened items.'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border-l-4 kfar-bg-cream kfar-border-earth-flame">
                    <h4 className="text-h6 mb-2">Business Hours</h4>
                    <p className="text-body-sm kfar-text-gray-600">
                      {vendor.businessHours || 'Sunday-Thursday: 9:00 AM - 6:00 PM\nFriday: 9:00 AM - 2:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuickView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowQuickView(null)}
                  className="float-right text-gray-500 hover:text-gray-700 p-2 cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </motion.button>
                <p className="text-center text-body text-gray-600 py-12">
                  {language === 'he' ? 'צפייה מהירה בקרוב...' : 'Quick view coming soon...'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}