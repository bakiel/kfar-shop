'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cardHover, cardTransition } from '@/lib/animations/motion-variants';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import { useCart } from '@/lib/context/CartContext';
import { QrCode, Tags, SlidersHorizontal, Star, Leaf, Flame, Search, Store, LayoutGrid, ShoppingCart, X, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { SmartQRScanner } from '@/components/qr/SmartQRScanner';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/styles/kfar-style-system.css';
import VendorBrowseCard from '@/components/marketplace/VendorBrowseCard';
import CompactPromotionalBanners from '@/components/marketplace/CompactPromotionalBanners';
import PromotedBundleCard from '@/components/bundles/PromotedBundleCard';
import MobileProductCard from '@/components/mobile/MobileProductCard';
import MobileCartDrawer from '@/components/mobile/MobileCartDrawer';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import MobileFilterSheet from '@/components/mobile/MobileFilterSheet';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
import TrafficLightMenu from '@/components/mobile/TrafficLightMenu';
import { voiceChatManager } from '@/lib/voice/voiceChatManager';

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
  const searchParams = useSearchParams();
  const { isMobile } = useMobileDetect();
  const { language, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<'vendors' | 'products'>('products');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  // Initialize filters with URL category if present
  const initialCategory = searchParams.get('category');
  const [filters, setFilters] = useState(() => ({
    priceRange: [0, 500] as [number, number],
    vendors: [] as string[],
    categories: initialCategory ? [initialCategory] : [] as string[],
    dietary: [] as string[],
    ratings: null as number | null,
    sort: 'trending'
  }));

  // Parallax effect for banner
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  // Popular tags for filtering - with Lucide icons
  const popularTags = [
    { slug: 'vegan', name: language === 'he' ? 'טבעוני' : 'Vegan', icon: Leaf, color: '#478c0b' },
    { slug: 'kosher', name: language === 'he' ? 'כשר' : 'Kosher', icon: Check, color: '#4299e1' },
    { slug: 'organic', name: language === 'he' ? 'אורגני' : 'Organic', icon: Leaf, color: '#48bb78' },
    { slug: 'bestseller', name: language === 'he' ? 'רב מכר' : 'Best Seller', icon: Flame, color: '#f56565' },
    { slug: 'featured', name: language === 'he' ? 'מומלץ' : 'Featured', icon: Star, color: '#f6af0d' },
    { slug: 'new', name: language === 'he' ? 'חדש' : 'New', icon: Sparkles, color: '#9f7aea' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Read category from URL and apply to filters
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryFromUrl]
      }));
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from database...');

      // Try database API first
      const response = await fetch('/api/products-db');
      console.log('Database API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Database API response:', data);

        if (data.success && data.products) {
          // Convert database products to marketplace format
          const formattedProducts = data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            nameHe: product.name_he,
            description: product.description || '',
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
            category: product.category || 'other',
            image: product.primary_image || product.image || '/images/placeholder-product.jpg',
            images: product.image_gallery || [],
            kashrut: product.is_kosher ? 'כשר' : undefined,
            vegan: product.is_vegan || false,
            organic: product.is_organic || false,
            glutenFree: product.is_gluten_free || false,
            unit: product.unit || 'unit',
            minimumOrder: 1,
            inStock: product.in_stock !== false,
            rating: product.rating,
            reviewCount: product.review_count,
            isFeatured: product.is_featured || false,
            badge: product.badge,
            vendorId: product.vendor_id,
            vendorName: product.vendor?.name || getVendorDisplayName(product.vendor_id),
            vendorLogo: product.vendor?.logo_url
          }));
          
          setProducts(formattedProducts);
          return;
        }
      }
      
      // Fallback to enhanced products API (uses JSON files)
      console.log('Falling back to JSON-based API...');
      const fallbackResponse = await fetch('/api/products-enhanced');
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API error: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.products) {
        const productsWithVendorNames = fallbackData.products.map((product: Product) => ({
          ...product,
          vendorName: product.vendorName || getVendorDisplayName(product.vendorId)
        }));
        
        setProducts(productsWithVendorNames);
        console.log(`⚠️ Using fallback: Loaded ${productsWithVendorNames.length} products from JSON files`);
      } else {
        console.error('No products in fallback response');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search API call
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results.map((r: any) => r.id));
        } else {
          setSearchResults(null);
        }
      } catch {
        setSearchResults(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      // Search filter: use API results if available, otherwise fall back to simple text match
      const matchesSearch = searchResults !== null
        ? searchResults.includes(product.id)
        : !searchQuery || searchQuery.length < 2 ||
          (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      
      // Category filter (with aliases for language rule compliance)
      const categoryAliases: Record<string, string[]> = {
        'ground-meatless': ['ground-meat', 'ground-meatless'],
      };
      const matchesCategory = filters.categories.length === 0 ||
                             filters.categories.some(fc => {
                               const aliases = categoryAliases[fc] || [fc];
                               return aliases.includes(product.category || 'other');
                             });

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
  }, [products, searchQuery, searchResults, selectedTags, filters]);
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
    <EnhancedLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Section with Smart Features */}
        <section className={`relative text-white ${isMobile ? 'py-10' : 'py-20'} overflow-hidden`} style={{ background: 'linear-gradient(135deg, #1a3a0a 0%, #2D5A27 30%, #478c0b 60%, #3a7209 100%)' }}>
          {/* Background Image with Overlay - Desaturated for texture only */}
          <motion.div
            className="absolute inset-0 opacity-10"
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

          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f6af0d 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C4A265 0%, transparent 70%)' }} />

          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Subtle label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mb-4"
              >
                <span className={`inline-flex items-center gap-2 ${isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-full font-medium tracking-wide`} style={{ backgroundColor: 'rgba(196, 162, 101, 0.2)', color: '#F5F0E8', border: '1px solid rgba(196, 162, 101, 0.3)' }}>
                  <Leaf className="w-3.5 h-3.5 stroke-[1.5]" />
                  {language === 'he' ? 'כפר השלום, דימונה' : 'Village of Peace, Dimona'}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-bold mb-4 tracking-tight`}
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
              >
                {language === 'he' ? 'שוק חכם' : 'Smart Marketplace'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'} mb-10 max-w-2xl mx-auto`}
                style={{ color: 'rgba(245, 240, 232, 0.85)' }}
              >
                {language === 'he'
                  ? `גלה ${products.length} מוצרים מכפר השלום`
                  : `Discover ${products.length} Products from Village of Peace`}
              </motion.p>

              {/* Search Bar with Animation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`relative ${isMobile ? 'max-w-full' : 'max-w-2xl'} mx-auto mb-8`}
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
                    placeholder={isMobile
                      ? (language === 'he' ? 'חפש מוצרים...' : 'Search products...')
                      : (language === 'he' ? 'חפש מוצרים, תגיות, או סרוק QR...' : 'Search products, tags, or scan QR...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`w-full ${isMobile ? 'px-4 py-3.5 min-h-[48px]' : 'px-6 py-4 text-lg'} rounded-2xl text-gray-800 shadow-2xl border-0 focus:outline-none focus:ring-0 ${
                      isRTL
                        ? (isMobile ? 'pl-32 pr-4 text-right' : 'pl-48 pr-6 text-right')
                        : (isMobile ? 'pr-32 pl-4' : 'pr-48 pl-6')
                    }`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
                  />
                </motion.div>
                <div className={`absolute ${isMobile ? 'top-1' : 'top-2'} flex gap-2 ${
                  isRTL ? 'left-1 md:left-2' : 'right-1 md:right-2'
                }`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQRScanner(true)}
                    className={`${isMobile ? 'px-3 py-2 min-h-[44px] min-w-[44px]' : 'px-4 py-2'} rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-all shadow-md flex items-center justify-center cursor-pointer`}
                  >
                    <QrCode className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} stroke-[1.5]`} />
                  </motion.button>
                  {!isMobile && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                      style={{ backgroundColor: '#478c0b', color: 'white' }}
                    >
                      <Search className="w-4 h-4 stroke-[2]" />
                      {language === 'he' ? 'חיפוש' : 'Search'}
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* View Toggle */}
              <div className={`flex items-center justify-center gap-${isMobile ? '2' : '4'} mb-8`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode('vendors')}
                  className={`${isMobile ? 'px-4 py-2 text-sm min-h-[44px] min-w-[100px]' : 'px-6 py-3'} rounded-full font-semibold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    viewMode === 'vendors'
                      ? 'bg-white text-green-700'
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Store className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} stroke-[1.5]`} />
                  {!isMobile && (language === 'he' ? 'לפי חנויות' : 'Browse by Vendor')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode('products')}
                  className={`${isMobile ? 'px-4 py-2 text-sm min-h-[44px] min-w-[100px]' : 'px-6 py-3'} rounded-full font-semibold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    viewMode === 'products'
                      ? 'bg-white text-green-700'
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  <LayoutGrid className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} stroke-[1.5]`} />
                  {!isMobile && (language === 'he' ? 'כל המוצרים' : 'All Products')}
                </motion.button>
              </div>

              {/* Mobile Tag Filters - Horizontal Scrollable */}
              {isMobile && (
                <div className="w-full overflow-x-auto pb-2 -mx-4 px-4">
                  <div className="flex gap-2 w-max">
                    {popularTags.map(tag => {
                      const TagIcon = tag.icon;
                      return (
                        <motion.button
                          key={tag.slug}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTagSelect(tag.slug)}
                          className={`px-3 py-2 min-h-[44px] min-w-[80px] rounded-full text-sm font-medium transition-all shadow-md flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                            selectedTags.includes(tag.slug)
                              ? 'bg-white text-gray-800 shadow-lg'
                              : 'bg-white/90 text-gray-700'
                          }`}
                          style={{
                            color: selectedTags.includes(tag.slug) ? tag.color : '#374151',
                            borderColor: selectedTags.includes(tag.slug) ? tag.color : 'transparent',
                            borderWidth: '2px'
                          }}
                        >
                          <TagIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>{tag.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tag Filters */}
              {!isMobile && (
                <div className="flex flex-wrap justify-center gap-2">
                  {popularTags.map(tag => {
                    const TagIcon = tag.icon;
                    return (
                      <motion.button
                        key={tag.slug}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTagSelect(tag.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer ${
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
                        <TagIcon className="w-4 h-4 stroke-[1.5]" />
                        {tag.name}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Task #5: Admin-promoted bundle slot — renders null when none active */}
        <PromotedBundleCard isRTL={isRTL} />

        {/* Promotional Banners */}
        <CompactPromotionalBanners />

        {/* Stats Bar */}
        <div className="border-b" style={{ backgroundColor: '#FDFBF7' }}>
          <div className="container mx-auto px-4 py-5">
            <div className={`grid grid-cols-2 ${isMobile ? 'gap-3' : 'md:grid-cols-4 gap-6'} text-center`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-2xl`}
                style={{ backgroundColor: 'rgba(71, 140, 11, 0.06)' }}
              >
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`} style={{ color: '#478c0b' }}>
                  {filteredProducts.length}
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 font-medium mt-0.5`}>
                  {language === 'he' ? 'מוצרים' : 'Products'}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-2xl`}
                style={{ backgroundColor: 'rgba(196, 162, 101, 0.08)' }}
              >
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`} style={{ color: '#C4A265' }}>
                  {Object.keys(vendorGroups).length}
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 font-medium mt-0.5`}>
                  {language === 'he' ? 'ספקים' : 'Vendors'}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-2xl`}
                style={{ backgroundColor: 'rgba(194, 60, 9, 0.06)' }}
              >
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold flex items-center justify-center gap-1.5 tracking-tight`} style={{ color: '#c23c09' }}>
                  <Flame className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} stroke-[1.5]`} />
                  {filteredProducts.filter(p => p.badge === 'Best Seller').length}
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 font-medium mt-0.5`}>
                  {language === 'he' ? 'רבי מכר' : 'Best Sellers'}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className={`${isMobile ? 'p-3' : 'p-4'} rounded-2xl`}
                style={{ backgroundColor: 'rgba(71, 140, 11, 0.06)' }}
              >
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold flex items-center justify-center gap-1.5 tracking-tight`} style={{ color: '#2D5A27' }}>
                  <Leaf className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} stroke-[1.5]`} />
                  100%
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 font-medium mt-0.5`}>
                  {language === 'he' ? 'טבעוני' : 'Vegan'}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Controls */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} justify-between items-center mb-8 gap-4`}>
            <div className="flex items-center gap-4">
              <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {isMobile ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMobileFilters(true)}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
                  {language === 'he' ? 'סינונים' : 'Filters'}
                  {(filters.vendors.length > 0 || filters.categories.length > 0 || filters.dietary.length > 0) && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {filters.vendors.length + filters.categories.length + filters.dietary.length}
                    </span>
                  )}
                </motion.button>
              ) : (
                <MarketplaceFilters
                  onFiltersChange={handleFiltersChange}
                  vendors={vendors}
                  categories={categories}
                  maxPrice={maxPrice}
                  currentFilters={filters}
                />
              )}
            </div>
          </div>

          {/* Active Filters Display for Mobile */}
          {isMobile && (filters.vendors.length > 0 || filters.categories.length > 0 || filters.dietary.length > 0 || selectedTags.length > 0) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-600 font-medium">{language === 'he' ? 'סינון פעיל:' : 'Active Filters:'}</span>
                <button
                  onClick={() => {
                    setFilters({
                      priceRange: [0, maxPrice],
                      vendors: [],
                      categories: [],
                      dietary: [],
                      ratings: null,
                      sort: 'trending'
                    });
                    setSelectedTags([]);
                  }}
                  className="text-xs text-[#c23c09] font-medium cursor-pointer"
                >
                  {language === 'he' ? 'נקה הכל' : 'Clear All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => {
                  const tagInfo = popularTags.find(t => t.slug === tag);
                  if (!tagInfo) return null;
                  const TagIcon = tagInfo.icon;
                  return (
                    <motion.button
                      key={tag}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagSelect(tag)}
                      className="px-3 py-1 bg-[#478c0b] text-white text-xs rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      <TagIcon className="w-3 h-3 stroke-[2]" />
                      {tagInfo.name}
                      <X className="w-3 h-3 ml-1 stroke-[2]" />
                    </motion.button>
                  );
                })}
                {filters.vendors.map(vendorId => {
                  const vendor = vendors.find(v => v.id === vendorId);
                  return vendor ? (
                    <motion.button
                      key={vendorId}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilters(prev => ({ ...prev, vendors: prev.vendors.filter(v => v !== vendorId) }))}
                      className="px-3 py-1 bg-[#f6af0d] text-white text-xs rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      {vendor.name}
                      <X className="w-3 h-3 ml-1 stroke-[2]" />
                    </motion.button>
                  ) : null;
                })}
                {filters.categories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <motion.button
                      key={categoryId}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== categoryId) }))}
                      className="px-3 py-1 bg-[#c23c09] text-white text-xs rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      {category.name}
                      <X className="w-3 h-3 ml-1 stroke-[2]" />
                    </motion.button>
                  ) : null;
                })}
                {filters.dietary.map(diet => {
                  const dietInfo = {
                    'vegan': language === 'he' ? 'טבעוני' : 'Vegan',
                    'kosher': language === 'he' ? 'כשר' : 'Kosher',
                    'organic': language === 'he' ? 'אורגני' : 'Organic',
                    'gluten-free': language === 'he' ? 'ללא גלוטן' : 'Gluten Free',
                    'sugar-free': language === 'he' ? 'ללא סוכר' : 'Sugar Free',
                    'raw': language === 'he' ? 'מזון חי' : 'Raw Food'
                  }[diet];
                  return dietInfo ? (
                    <motion.button
                      key={diet}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilters(prev => ({ ...prev, dietary: prev.dietary.filter(d => d !== diet) }))}
                      className="px-3 py-1 bg-[#478c0b] text-white text-xs rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      {dietInfo}
                      <X className="w-3 h-3 ml-1 stroke-[2]" />
                    </motion.button>
                  ) : null;
                })}
              </div>
            </div>
          )}
          {loading ? (
            <div className="text-center py-20">
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                {[...Array(isMobile ? 4 : 8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100/80 animate-pulse">
                    <div className={`${isMobile ? 'h-36' : 'h-56'} bg-gray-100`} />
                    <div className="p-4">
                      <div className="h-3 bg-gray-100 rounded-full w-20 mb-3" />
                      <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-4" />
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-100 rounded-full w-16" />
                        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
              {sortedProducts.map((product, index) => (
                isMobile ? (
                  // Mobile Product Card
                  <MobileProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      vendor: product.vendorName || getVendorDisplayName(product.vendorId),
                      vendorLogo: vendorStores[product.vendorId]?.logo || '',
                      price: `₪${product.price}`,
                      originalPrice: product.originalPrice ? `₪${product.originalPrice}` : undefined,
                      image: product.image,
                      category: product.category,
                      badge: product.badge,
                      description: product.description,
                      rating: product.rating || 4.5
                    }}
                  />
                ) : (
                  // Desktop Product Card - Premium Design
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)' }}
                  className="bg-white rounded-2xl overflow-hidden group cursor-pointer border border-gray-100/80"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)' }}
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name || "Image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
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
                      {/* Gradient overlay for polish */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Badges */}
                      <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex flex-col gap-1.5`}>
                        {product.badge === 'Best Seller' && (
                          <span className="px-2.5 py-1 text-[11px] rounded-lg font-semibold tracking-wide uppercase" style={{ backgroundColor: '#c23c09', color: 'white' }}>
                            {language === 'he' ? 'רב מכר' : 'Best Seller'}
                          </span>
                        )}
                        {product.isFeatured && !product.badge && (
                          <span className="px-2.5 py-1 text-[11px] rounded-lg font-semibold tracking-wide uppercase" style={{ backgroundColor: '#C4A265', color: 'white' }}>
                            {language === 'he' ? 'מומלץ' : 'Featured'}
                          </span>
                        )}
                        {product.badge && product.badge !== 'Best Seller' && (
                          <span className="px-2.5 py-1 text-[11px] rounded-lg font-semibold tracking-wide uppercase bg-[#2D5A27] text-white">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Discount badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                          <span className="px-2 py-1 text-[11px] rounded-lg font-bold bg-white/90 backdrop-blur-sm" style={{ color: '#c23c09' }}>
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}

                      {/* Quick add overlay on hover */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
                          style={{ backgroundColor: 'rgba(71, 140, 11, 0.92)' }}
                        >
                          <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                          {language === 'he' ? 'הוסף לסל' : 'Add to Cart'}
                        </motion.button>
                      </motion.div>
                    </div>
                  </Link>

                  <div className="p-4 pb-5">
                    {/* Vendor label */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Store className="w-3 h-3 stroke-[1.5]" style={{ color: '#C4A265' }} />
                      <span className="text-xs font-medium" style={{ color: '#C4A265' }}>
                        {product.vendorName || getVendorDisplayName(product.vendorId)}
                      </span>
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-base font-semibold mb-1 line-clamp-1 group-hover:text-[#2D5A27] transition-colors" style={{ color: '#1a1a1a' }}>
                        {product.name}
                      </h3>
                    </Link>

                    {product.nameHe && language !== 'he' && (
                      <p className="text-xs text-gray-400 mb-1.5" dir="rtl">
                        {product.nameHe}
                      </p>
                    )}

                    {/* Rating row */}
                    {product.rating && (
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'fill-[#f6af0d] text-[#f6af0d]' : 'text-gray-200'} stroke-[1.5]`} />
                          ))}
                        </div>
                        {product.reviewCount && (
                          <span className="text-xs text-gray-400">({product.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Dietary badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.vegan && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: 'rgba(71, 140, 11, 0.08)', color: '#478c0b' }}>
                          <Leaf className="w-2.5 h-2.5 stroke-[1.5]" />
                          {language === 'he' ? 'טבעוני' : 'Vegan'}
                        </span>
                      )}
                      {product.kashrut && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: 'rgba(66, 153, 225, 0.08)', color: '#4299e1' }}>
                          <Check className="w-2.5 h-2.5 stroke-[1.5]" />
                          {language === 'he' ? 'כשר' : 'Kosher'}
                        </span>
                      )}
                      {product.organic && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: 'rgba(72, 187, 120, 0.08)', color: '#48bb78' }}>
                          {language === 'he' ? 'אורגני' : 'Organic'}
                        </span>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold tracking-tight" style={{ color: '#1a1a1a' }}>
                          ₪{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₪{product.originalPrice}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-10 h-10 rounded-xl font-semibold text-white transition-all flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: '#478c0b' }}
                      >
                        <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                )
              ))}
            </div>
          )}
          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Tags className="w-16 h-16 mx-auto mb-4 text-gray-300 stroke-[1.5]" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#3a3a1d' }}>
                {language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'he' ? 'נסה לשנות את הסינון או החיפוש' : 'Try adjusting your filters or search query'}
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

        {/* Unified Traffic Light Menu for Mobile */}
        {isMobile && (
          <TrafficLightMenu
            onFilterClick={() => setShowMobileFilters(true)}
            onCartClick={() => setShowMobileCart(true)}
            onVoiceClick={() => {
              // Use voice chat manager to open chat
              console.log('🌱 Marketplace: Opening voice chat via manager');
              voiceChatManager.open();
            }}
            filterCount={filters.vendors.length + filters.categories.length + filters.dietary.length + selectedTags.length}
          />
        )}

        {/* Mobile Cart Drawer */}
        {isMobile && (
          <MobileCartDrawer
            isOpen={showMobileCart}
            onClose={() => setShowMobileCart(false)}
          />
        )}

        {/* Mobile Filter Sheet */}
        {isMobile && (
          <MobileFilterSheet
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            filters={{
              priceRange: filters.priceRange,
              vendors: filters.vendors,
              categories: filters.categories,
              dietary: filters.dietary,
              ratings: filters.ratings,
              sort: filters.sort,
              selectedTags: selectedTags
            }}
            onApplyFilters={(newFilters) => {
              setFilters({
                priceRange: newFilters.priceRange || filters.priceRange,
                vendors: newFilters.vendors || filters.vendors,
                categories: newFilters.categories || filters.categories,
                dietary: newFilters.dietary || filters.dietary,
                ratings: newFilters.ratings || filters.ratings,
                sort: newFilters.sort || filters.sort
              });
              if (newFilters.selectedTags !== undefined) {
                setSelectedTags(newFilters.selectedTags || []);
              }
              setShowMobileFilters(false);
            }}
            vendors={vendors}
            categories={categories}
            maxPrice={maxPrice}
            popularTags={popularTags}
          />
        )}
      </div>
    </EnhancedLayout>
  );
}