'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import { useCart } from '@/lib/context/CartContext';
import { FaQrcode, FaTags, FaFilter, FaStar, FaLeaf, FaFire, FaSearch } from 'react-icons/fa';
import { SmartQRScanner } from '@/components/qr/SmartQRScanner';
import { useRouter } from 'next/navigation';
import '@/styles/kfar-style-system.css';
import VendorBrowseCard from '@/components/marketplace/VendorBrowseCard';

interface Product {
  id: string;
  name: string;
  nameHe?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  kashrut?: string;
  vegan: boolean;
  organic: boolean;
  glutenFree: boolean;
  unit: string;
  minimumOrder: number;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  specifications?: Array<{ label: string; value: string }>;
  culturalSignificance?: string;
  isFeatured?: boolean;
  badge?: string;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string;
}

// Helper function to get vendor display name
const getVendorDisplayName = (vendorId: string): string => {
  const vendorMap: Record<string, string> = {
    'teva-deli': 'Teva Deli',
    'garden-of-light': 'Garden of Light',
    'queens-cuisine': 'Queens Cuisine',
    'gahn-delight': 'Gahn Delight',
    'people-store': 'People Store',
    'vop-shop': 'VOP Shop'
  };
  return vendorMap[vendorId] || vendorId;
};

export default function MarketplacePage() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'vendors' | 'products'>('products');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 500] as [number, number],
    vendors: [] as string[],
    categories: [] as string[],
    dietary: [] as string[],
    ratings: null as number | null,
    sort: 'trending'
  });
  
  // Parallax effect for banner
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);  
  // Popular tags for filtering
  const popularTags = [
    { slug: 'vegan', name: 'Vegan', icon: 'fa-leaf', color: '#478c0b' },
    { slug: 'kosher', name: 'Kosher', icon: 'fa-check-circle', color: '#4299e1' },
    { slug: 'organic', name: 'Organic', icon: 'fa-seedling', color: '#48bb78' },
    { slug: 'bestseller', name: 'Best Seller', icon: 'fa-fire', color: '#f56565' },
    { slug: 'featured', name: 'Featured', icon: 'fa-star', color: '#f6af0d' },
    { slug: 'new', name: 'New', icon: 'fa-sparkles', color: '#9f7aea' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from API...');
      
      // Use relative URL for better compatibility
      const response = await fetch('/api/products-enhanced');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.products) {
        // Debug: Check vendor names
        const missingVendorNames = data.products.filter((p: Product) => !p.vendorName);
        if (missingVendorNames.length > 0) {
          console.warn(`⚠️ ${missingVendorNames.length} products missing vendorName:`, 
            missingVendorNames.slice(0, 3).map((p: Product) => ({ id: p.id, name: p.name, vendorId: p.vendorId }))
          );
        }
        
        // Ensure all products have vendorName
        const productsWithVendorNames = data.products.map((product: Product) => ({
          ...product,
          vendorName: product.vendorName || getVendorDisplayName(product.vendorId)
        }));
        
        setProducts(productsWithVendorNames);
        console.log(`Loaded ${productsWithVendorNames.length} products`);
      } else if (data.error) {
        console.error('Failed to fetch products:', data.error);
        setProducts([]);
      } else {
        console.error('Unexpected response format:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Try fallback to relative URL
      try {
        const fallbackResponse = await fetch('/api/products-enhanced');
        const fallbackData = await fallbackResponse.json();
        if (fallbackResponse.ok && fallbackData.products) {
          setProducts(fallbackData.products);
          console.log(`Loaded ${fallbackData.products.length} products via fallback`);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.price), 500);
  }, [products]);

  // Extract unique vendors and categories
  const vendors = useMemo(() => {
    const vendorMap = new Map();
    products.forEach(product => {
      if (!vendorMap.has(product.vendorId)) {
        vendorMap.set(product.vendorId, {
          id: product.vendorId,
          name: product.vendorName,
          productCount: 0
        });
      }
      vendorMap.get(product.vendorId).productCount++;
    });
    return Array.from(vendorMap.values());
  }, [products]);
  const categories = useMemo(() => {
    const categoryMap = new Map();
    products.forEach(product => {
      const category = product.category || 'other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          id: category,
          name: category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          count: 0
        });
      }
      categoryMap.get(category).count++;
    });
    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const handleTagSelect = (tagSlug: string) => {
    const newTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter(t => t !== tagSlug)
      : [...selectedTags, tagSlug];
    setSelectedTags(newTags);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendorId: product.vendorId,
      vendorName: product.vendorName
    });
  };

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // Filter products based on search, tags, and advanced filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            
      // Tag filters
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => {
        switch(tag) {
          case 'vegan': return product.vegan;
          case 'kosher': return product.kashrut;
          case 'organic': return product.organic;
          case 'bestseller': return product.badge === 'Best Seller';
          case 'featured': return product.isFeatured;
          case 'new': return product.badge === 'New';
          default: return true;
        }
      });
      
      // Price filter
      const matchesPrice = product.price >= filters.priceRange[0] && 
                          product.price <= filters.priceRange[1];
      
      // Vendor filter
      const matchesVendor = filters.vendors.length === 0 || 
                           filters.vendors.includes(product.vendorId);
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
                             filters.categories.includes(product.category || 'other');
      
      // Dietary filter
      const matchesDietary = filters.dietary.length === 0 || filters.dietary.every(diet => {
        switch(diet) {
          case 'vegan': return product.vegan;
          case 'kosher': return product.kashrut;
          case 'organic': return product.organic;
          case 'gluten-free': return product.glutenFree;
          case 'sugar-free': return product.specifications?.some(spec => 
            spec.label.toLowerCase().includes('sugar') && spec.value.toLowerCase().includes('free'));
          case 'raw': return product.specifications?.some(spec => 
            spec.label.toLowerCase().includes('raw'));
          default: return true;
        }
      });
      
      // Rating filter
      const matchesRating = filters.ratings === null || 
                           (product.rating || 0) >= filters.ratings;
      
      return matchesSearch && matchesTags && matchesPrice && matchesVendor && 
             matchesCategory && matchesDietary && matchesRating;
    });
  }, [products, searchQuery, selectedTags, filters]);
  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (filters.sort) {
        case 'trending':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return 0; // No date field available
        case 'bestselling':
          return ((b.badge === 'Best Seller' ? 1 : 0) - (a.badge === 'Best Seller' ? 1 : 0));
        default:
          return 0;
      }
    });
  }, [filteredProducts, filters.sort]);

  // Group products by vendor for vendor view
  const vendorGroups = useMemo(() => {
    return sortedProducts.reduce((acc, product) => {
      const vendorId = product.vendorId;
      if (!acc[vendorId]) {
        // Import vendor stores data
        const { vendorStores } = require('@/lib/data/wordpress-style-data-layer');
        const vendorStore = vendorStores[vendorId];
        
        acc[vendorId] = {
          vendorInfo: {
            id: vendorId,
            name: product.vendorName || vendorStore?.name,
            logo: vendorStore?.logo || product.vendorLogo,
            description: vendorStore?.description,
            tags: vendorStore?.metadata?.certifications
          },
          products: []
        };
      }
      acc[vendorId].products.push(product);
      return acc;
    }, {} as Record<string, { vendorInfo: any, products: Product[] }>);
  }, [sortedProducts]);

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section with Smart Features */}
        <section className="relative text-white py-16 overflow-hidden bg-gradient-to-br from-[#478c0b] via-[#f6af0d] to-[#c23c09]">
          {/* Background Image with Overlay - Desaturated for texture only */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            style={{ y }}
          >
            <Image
              src="/images/marketplace-banner-bg.jpg"
              alt="KiFar Marketplace Banner"
              fill
              className="object-cover scale-110 grayscale"
              priority
            />
          </motion.div>
          
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          
          <div className="container mx-auto px-4 relative z-10">            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">Smart Marketplace</h1>
              <p className="text-xl mb-8 opacity-90 drop-shadow-lg">Discover {products.length} Products from Village of Peace</p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-8">
                <input
                  type="text"
                  placeholder="Search products, tags, or scan QR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full text-gray-800 pr-48 shadow-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.98)' }}
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-all shadow-md"
                  >
                    <FaQrcode className="text-xl" />
                  </button>
                  <button className="px-6 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5" style={{ backgroundColor: '#478c0b', color: 'white' }}>
                    <FaSearch className="inline mr-2" />
                    Search
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setViewMode('vendors')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all shadow-lg ${
                    viewMode === 'vendors' 
                      ? 'bg-white text-green-700' 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <i className="fas fa-store mr-2"></i>
                  Browse by Vendor
                </button>                <button
                  onClick={() => setViewMode('products')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all shadow-lg ${
                    viewMode === 'products' 
                      ? 'bg-white text-green-700' 
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <i className="fas fa-th mr-2"></i>
                  All Products
                </button>
              </div>

              {/* Tag Filters */}
              <div className="flex flex-wrap justify-center gap-2">
                {popularTags.map(tag => (
                  <motion.button
                    key={tag.slug}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagSelect(tag.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md ${
                      selectedTags.includes(tag.slug)
                        ? 'bg-white text-gray-800 shadow-lg'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                    style={{
                      color: selectedTags.includes(tag.slug) ? tag.color : '#374151',
                      borderColor: selectedTags.includes(tag.slug) ? tag.color : 'transparent',
                      borderWidth: '2px'
                    }}
                  >
                    <i className={`fas ${tag.icon} mr-2`}></i>
                    {tag.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>                <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  {filteredProducts.length}
                </div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                  {Object.keys(vendorGroups).length}
                </div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                  <FaFire className="inline mr-1" />
                  {filteredProducts.filter(p => p.badge === 'Best Seller').length}
                </div>
                <div className="text-sm text-gray-600">Best Sellers</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  <FaLeaf className="inline mr-1" />
                  100%
                </div>
                <div className="text-sm text-gray-600">Vegan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <MarketplaceFilters
                onFiltersChange={handleFiltersChange}
                vendors={vendors}
                categories={categories}
                maxPrice={maxPrice}
              />
            </div>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : viewMode === 'vendors' ? (
            // Vendors View with Enhanced Design
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(vendorGroups).map(([vendorId, { vendorInfo, products }], index) => (
                <VendorBrowseCard
                  key={vendorId}
                  vendorId={vendorId}
                  vendorInfo={vendorInfo}
                  products={products}
                  index={index}
                />
              ))}
            </div>
          ) : (
            // Products Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name || "Image"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Use vendor-specific fallback, never cross-vendor images
                          const vendorFallbacks: Record<string, string> = {
                            'teva-deli': '/images/fallbacks/teva-deli-product.svg',
                            'queens-cuisine': '/images/fallbacks/queens-cuisine-product.svg',
                            'gahn-delight': '/images/fallbacks/gahn-delight-product.svg',
                            'vop-shop': '/images/fallbacks/vop-shop-product.svg',
                            'people-store': '/images/fallbacks/people-store-product.svg',
                            'garden-of-light': '/images/fallbacks/garden-of-light-product.svg',
                            'quintessence': '/images/fallbacks/quintessence-product.svg'
                          };
                          e.currentTarget.src = vendorFallbacks[product.vendorId] || '/images/fallbacks/kfar-product-fallback.svg';
                        }}
                      />
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-2">
                        {product.badge === 'Best Seller' && (
                          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-red-500 text-white">
                            Best Seller
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-yellow-400 text-gray-800">
                            Featured
                          </span>
                        )}
                        {product.badge && product.badge !== 'Best Seller' && (
                          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-purple-500 text-white">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      
                      {/* Vendor Badge */}
                      {(product.vendorName || product.vendorId) && (
                        <div className="absolute bottom-2 right-2">
                          <span className="px-3 py-1 text-xs rounded-full font-medium bg-white/90 backdrop-blur-sm">
                            {product.vendorName || getVendorDisplayName(product.vendorId)}
                          </span>
                        </div>
                      )}
                    </div>                  </Link>

                  <div className="p-5">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-lg font-semibold mb-1 hover:text-green-700 transition-colors" style={{ color: '#3a3a1d' }}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    {product.nameHe && (
                      <p className="text-sm text-gray-600 mb-2" dir="rtl">
                        {product.nameHe}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₪{product.originalPrice}
                          </span>
                        )}
                        <span className="text-xl font-bold ml-2" style={{ color: '#c23c09' }}>
                          ₪{product.price}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ backgroundColor: '#478c0b' }}
                      >
                        <i className="fas fa-cart-plus"></i>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <FaTags className="text-6xl mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setSearchQuery('');
                  setFilters({
                    priceRange: [0, maxPrice],
                    vendors: [],
                    categories: [],
                    dietary: [],
                    ratings: null,
                    sort: 'trending'
                  });
                }}
                className="px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: '#478c0b' }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <SmartQRScanner
            onScan={(data) => {
              setShowQRScanner(false);
              // Handle different QR types
              if (data.type === 'product' && data.productId) {
                router.push(`/product/${data.productId}`);
              } else if (data.type === 'vendor' && data.vendorId) {
                router.push(`/store/${data.vendorId}`);
              } else if (data.type === 'order' && data.orderId) {
                router.push(`/orders/${data.orderId}`);
              } else if (data.name) {
                // Search for the product
                setSearchQuery(data.name);
              }
            }}
            onClose={() => setShowQRScanner(false)}
            acceptedTypes={['product', 'vendor', 'order']}
          />
        )}
      </div>

    </Layout>
  );
}