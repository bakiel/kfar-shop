'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/lib/context/CartContext';
import { completeProductCatalog } from '@/lib/data/complete-catalog';
import { getProductImage, getProductImages, getVendorLogo } from '@/lib/utils/image-manager';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';

// Helper function to get products by vendor
function getProductsByVendor(vendorId: string) {
  const vendorData = completeProductCatalog[vendorId];
  return vendorData ? vendorData.products : [];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();

  // State
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      // First, try to fetch from our API
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
            
            // Find vendor info from catalog if needed
            let vendorInfo = null;
            for (const [vendorId, vendorData] of Object.entries(completeProductCatalog)) {
              if (vendorData.vendorName === data.vendor_name) {
                vendorInfo = vendorData;
                break;
              }
            }
            
            // Transform API data to match our product structure
            const transformedProduct = {
              ...data,
              id: data.id,
              image: data.image || data.primary_image || '/images/placeholder.jpg',
              images: data.images || [data.image || '/images/placeholder.jpg'],
              name: data.name,
              description: data.description,
              rating: data.rating || 4.5,
              reviewCount: data.reviewCount || 0,
              vendor: data.vendorName || data.vendor_name,
              vendorId: data.vendorId || data.vendor_id,
              vendorLogo: vendorInfo?.logo || '/images/placeholder.jpg',
              longDescription: data.longDescription || data.description,
              specifications: data.extendedData?.specifications ? [
                { label: 'Weight', value: data.extendedData.specifications.weight },
                { label: 'Servings', value: data.extendedData.specifications.servings },
                { label: 'Shelf Life', value: data.extendedData.specifications.shelf_life },
                { label: 'Ingredients', value: data.extendedData.specifications.ingredients?.join(', ') }
              ].filter(spec => spec.value) : [],
              culturalSignificance: data.culturalSignificance || null,
              shippingInfo: data.extendedData?.shipping_info || {
                localPickup: true,
                delivery: true,
                international: false
              },
              inStock: data.inStock !== false,
              vegan: data.isVegan || data.vegan,
              kosher: data.isKosher || data.kosher,
              organic: data.organic || false,
              kashrut: (data.isKosher || data.kosher) ? 'Kosher Certified' : null,
              glutenFree: data.glutenFree || false,
              price: data.price,
              originalPrice: data.originalPrice,
              category: data.category,
              unit: data.unit || 'piece',
              minimumOrder: data.minimumOrder || 1
            };
            
            setProduct(transformedProduct);
            setLoading(false);
            return;
          }
      } catch (error) {
        console.error('Error fetching from API:', error);
      }
      
      // If not found in API or not numeric, check the catalog
      let foundProduct = null;
      let foundVendorInfo = null;
      
      for (const [vendorId, vendorData] of Object.entries(completeProductCatalog)) {
        const found = vendorData.products.find(p => p.id === productId);
        if (found) {
          foundVendorInfo = vendorData;
          const productImage = getProductImage(vendorId, productId);
          const productImages = getProductImages(vendorId, productId);
          
          foundProduct = {
            ...found,
            image: productImage,
            images: productImages,
            rating: found.rating || 4.5,
            reviewCount: found.reviewCount || 127,
            vendor: vendorData.vendorName,
            vendorId: vendorId,
            vendorLogo: getVendorLogo(vendorId),
            longDescription: found.longDescription || found.description,
            specifications: found.specifications || [],
            culturalSignificance: found.culturalSignificance || null,
            shippingInfo: found.shippingInfo || {
              localPickup: true,
              delivery: true,
              international: false
            }
          };
          break;
        }
      }
      
      setProduct(foundProduct);
      setLoading(false);
      
      if (!foundProduct) {
        router.push('/marketplace');
      }
    };

    fetchProduct();
  }, [productId, router]);

  // State for UI
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('2-weeks');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Currency conversion rates
  const currencyRates = {
    ILS: 1,
    USD: 0.28,
    EUR: 0.26,
    GBP: 0.22
  };

  const currencySymbols = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  // Get related products
  const relatedProducts = product ? (
    product.vendorId && typeof product.vendorId === 'string' 
      ? getProductsByVendor(product.vendorId)
          .filter(p => p.id !== product.id)
          .map(p => {
            const productImage = getProductImage(product.vendorId, p.id);
            return {
              ...p,
              image: productImage,
              rating: p.rating || 4.5,
              reviewCount: p.reviewCount || Math.floor(Math.random() * 200) + 50,
              vendorName: product.vendor
            };
          })
          .slice(0, 3)
      : []
  ) : [];

  // Recently viewed products (mock data)
  const allProducts: any[] = [];
  Object.entries(completeProductCatalog).forEach(([vendorId, vendor]) => {
    vendor.products.forEach(p => {
      const productImage = getProductImage(vendorId, p.id);
      allProducts.push({
        ...p,
        image: productImage,
        vendorId: vendorId
      });
    });
  });
  const recentlyViewed = allProducts.slice(0, 6);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#478c0b] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#478c0b] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      vendorId: product.vendorId,
      vendorName: product.vendor
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const currentPrice = product.price * currencyRates[selectedCurrency as keyof typeof currencyRates];
  const originalPrice = product.originalPrice ? product.originalPrice * currencyRates[selectedCurrency as keyof typeof currencyRates] : null;
  const discountPercentage = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  // Calculate bulk pricing
  const bulkDiscount = quantity >= 12 ? 0.15 : quantity >= 6 ? 0.10 : 0;
  const subscriptionDiscount = isSubscribed ? 0.05 : 0;
  const finalPrice = currentPrice * quantity * (1 - bulkDiscount) * (1 - subscriptionDiscount);

  return (
    <Layout>
      <div style={{ backgroundColor: '#fef9ef' }}>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-[#478c0b]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/marketplace" className="hover:text-[#478c0b]">Marketplace</Link>
            <span className="mx-2">/</span>
            <Link href={`/store/${product.vendorId}`} className="hover:text-[#478c0b]">{product.vendor}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Images */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                <div className="relative">
                  <div className="relative h-[400px] overflow-hidden">
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name ? `${product.name} - Image ${selectedImage + 1}` : "Image"}
                      fill
                      className="object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                      onClick={() => setShowZoom(true)}
                      priority
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50">
                    {product.images.map((image: string, idx: number) => (
                      <div
                        key={idx}
                        className={`relative h-16 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? 'border-[#478c0b]' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImage(idx)}
                      >
                        <Image src={image} alt={product.name ? `${product.name} - view ${idx + 1}` : "Image"} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#3a3a1d' }}>{product.name}</h1>
                    <p className="text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-center gap-3 mb-4">
                      {product.kashrut && (
                        <span className="bg-[#cfe7c1] text-[#3a3a1d] px-3 py-1 rounded-full text-sm font-medium">
                          {product.kashrut}
                        </span>
                      )}
                      {product.vegan && (
                        <span className="bg-[#478c0b] text-white px-2 py-0.5 rounded-xl text-xs font-medium">
                          Vegan
                        </span>
                      )}
                      {product.organic && (
                        <span className="bg-[#478c0b] text-white px-2 py-0.5 rounded-xl text-xs font-medium">
                          Organic
                        </span>
                      )}
                      {product.glutenFree && (
                        <span className="bg-[#478c0b] text-white px-2 py-0.5 rounded-xl text-xs font-medium">
                          Gluten Free
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-red-500 text-xl transition-colors"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`} style={{ color: isWishlisted ? '#ef4444' : '' }}></i>
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center" style={{ color: '#f6af0d' }}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                    ))}
                    <span className="ml-2 text-gray-600">({product.reviewCount} reviews)</span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
                </div>

                {/* Accordion Sections */}
                <div className="space-y-2">
                  {/* Ingredients & Nutrition */}
                  {product.specifications && (
                    <div className="border border-gray-200 rounded-lg">
                      <button 
                        className="w-full px-4 py-3 bg-gray-50 text-left font-semibold flex items-center justify-between hover:bg-gray-100 transition-colors"
                        onClick={() => toggleAccordion('specs')}
                      >
                        <span>Product Specifications</span>
                        <i className={`fas fa-chevron-down transition-transform ${activeAccordion === 'specs' ? 'rotate-180' : ''}`}></i>
                      </button>
                      {activeAccordion === 'specs' && (
                        <div className="p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {product.specifications.map((spec: any, idx: number) => (
                              <div key={idx}>
                                <span className="font-semibold">{spec.label}:</span>
                                <span className="ml-2 text-gray-600">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cultural Significance */}
                  {product.culturalSignificance && (
                    <div className="border border-gray-200 rounded-lg">
                      <button 
                        className="w-full px-4 py-3 bg-gray-50 text-left font-semibold flex items-center justify-between hover:bg-gray-100 transition-colors"
                        onClick={() => toggleAccordion('cultural')}
                      >
                        <span>Cultural Significance</span>
                        <i className={`fas fa-chevron-down transition-transform ${activeAccordion === 'cultural' ? 'rotate-180' : ''}`}></i>
                      </button>
                      {activeAccordion === 'cultural' && (
                        <div className="p-4">
                          <p className="text-gray-700">{product.culturalSignificance}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preparation & Storage */}
                  <div className="border border-gray-200 rounded-lg">
                    <button 
                      className="w-full px-4 py-3 bg-gray-50 text-left font-semibold flex items-center justify-between hover:bg-gray-100 transition-colors"
                      onClick={() => toggleAccordion('storage')}
                    >
                      <span>Storage & Shipping</span>
                      <i className={`fas fa-chevron-down transition-transform ${activeAccordion === 'storage' ? 'rotate-180' : ''}`}></i>
                    </button>
                    {activeAccordion === 'storage' && (
                      <div className="p-4">
                        <div className="space-y-2">
                          <p><span className="font-semibold">Unit:</span> {product.unit || 'piece'}</p>
                          <p><span className="font-semibold">Minimum Order:</span> {product.minimumOrder || 1}</p>
                          {product.shippingInfo && (
                            <>
                              <p><span className="font-semibold">Local Pickup:</span> {product.shippingInfo.localPickup ? '✓ Available' : '✗ Not available'}</p>
                              <p><span className="font-semibold">Delivery:</span> {product.shippingInfo.delivery ? '✓ Available' : '✗ Not available'}</p>
                              <p><span className="font-semibold">International:</span> {product.shippingInfo.international ? '✓ Available' : '✗ Not available'}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#478c0b]">
                    <Image src={product.vendorLogo} alt={product.vendor || "Image"} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{product.vendor}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex" style={{ color: '#f6af0d' }}>
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="fas fa-star"></i>
                        ))}
                      </div>
                      <span className="text-gray-600">(4.9 avg)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Quality products from the Village of Peace community, bringing you authentic vegan alternatives and traditional foods.
                </p>
                <div className="flex gap-3">
                  <Link href={`/store/${product.vendorId}`}>
                    <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                      <i className="fas fa-store mr-2"></i>Visit Store
                    </button>
                  </Link>
                  <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                    <i className="fas fa-phone mr-2"></i>Contact
                  </button>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>Customer Reviews</h3>
                  <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                    Write Review
                  </button>
                </div>

                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold" style={{ color: '#478c0b' }}>{product.rating}</div>
                      <div className="flex justify-center my-2" style={{ color: '#f6af0d' }}>
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="fas fa-star text-lg"></i>
                        ))}
                      </div>
                      <div className="text-gray-600">Based on {product.reviewCount} reviews</div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => {
                        const percentage = stars === 5 ? 85 : stars === 4 ? 12 : stars === 3 ? 2 : stars === 2 ? 1 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 bg-gray-200 rounded h-2">
                              <div 
                                className="h-2 rounded" 
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: stars >= 4 ? '#478c0b' : stars === 3 ? '#f6af0d' : '#c23c09'
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{Math.round((product.reviewCount || 127) * percentage / 100)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Sarah Cohen</span>
                          <span className="bg-[#cfe7c1] text-[#3a3a1d] px-2 py-0.5 rounded-full text-xs">Verified Purchase</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <div className="flex" style={{ color: '#f6af0d' }}>
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className="fas fa-star"></i>
                            ))}
                          </div>
                          <span className="text-gray-600">5 days ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">
                      "Absolutely delicious! The quality is outstanding and you can really taste the care that goes into making these products. My whole family loves them!"
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <button className="hover:text-[#478c0b]">
                        <i className="far fa-thumbs-up mr-1"></i>Helpful (12)
                      </button>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors font-semibold">
                  View All Reviews
                </button>
              </div>

              {/* Q&A Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>Questions & Answers</h3>
                  <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                    Ask Question
                  </button>
                </div>

                <div className="space-y-4">
                  {product.glutenFree !== undefined && (
                    <div className="border-l-4 border-[#478c0b] pl-4">
                      <div className="font-semibold mb-1">Q: Is this product gluten-free?</div>
                      <div className="text-gray-700 mb-2">
                        A: {product.glutenFree ? 'Yes, this product is certified gluten-free.' : 'No, this product contains gluten.'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Answered by {product.vendor} • 3 days ago
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Floating toggle button when sidebar is closed */}
              {!showSidebar && (
                <div className="fixed right-4 top-24 z-40">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="group relative"
                    title="Show purchase options"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#478c0b] via-[#f6af0d] to-[#478c0b] rounded-full opacity-75 blur animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center transform transition-all group-hover:scale-110">
                      <i className="fas fa-shopping-cart text-[#478c0b] text-xl"></i>
                    </div>
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#3a3a1d] text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      Quick Buy
                    </span>
                  </button>
                </div>
              )}
              
              {/* Enhanced Floating Card Panel */}
              <div className={`sticky top-4 transition-all duration-500 ${showSidebar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#478c0b]/20 via-[#f6af0d]/20 to-[#c23c09]/20 rounded-2xl blur-xl opacity-50"></div>
                
                {/* Main card */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header with gradient */}
                  <div className="relative bg-gradient-to-r from-[#478c0b] to-[#f6af0d] p-4 text-white">
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all flex items-center justify-center group"
                      title="Hide panel"
                    >
                      <i className="fas fa-chevron-right text-white text-sm group-hover:translate-x-0.5 transition-transform"></i>
                    </button>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <i className="fas fa-shopping-basket"></i>
                      Quick Purchase
                    </h3>
                    <p className="text-sm opacity-90">Secure checkout available</p>
                  </div>
                  
                  {/* Content with padding */}
                  <div className="p-6">
                {/* Price & Purchase */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold" style={{ 
                      background: 'linear-gradient(135deg, #478c0b, #f6af0d)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{currentPrice.toFixed(2)}
                    </span>
                    {originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{originalPrice.toFixed(2)}
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <span className="bg-[#c23c09] text-white px-2 py-1 rounded text-sm font-bold">
                        -{discountPercentage}%
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <select 
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                      <option value="ILS">₪ ILS</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="text-green-800 font-semibold text-sm mb-1">
                      <i className="fas fa-truck mr-2"></i>Free Local Delivery
                    </div>
                    <div className="text-green-700 text-sm">
                      Orders over ₪50 within Dimona area
                    </div>
                  </div>

                  {/* Quantity & Options */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Quantity:</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden mb-3">
                      <button 
                        className="px-3 py-2 bg-gray-100 hover:bg-[#cfe7c1] transition-colors font-semibold"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="w-16 px-3 py-2 text-center border-none outline-none"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button 
                        className="px-3 py-2 bg-gray-100 hover:bg-[#cfe7c1] transition-colors font-semibold"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Bulk pricing: 6+ items - 10% off</div>
                      <div>Case of 12 - 15% off</div>
                    </div>
                  </div>

                  {/* Subscription Option */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={isSubscribed}
                        onChange={(e) => setIsSubscribed(e.target.checked)}
                      />
                      <span className="text-sm">Subscribe & Save 5%</span>
                    </label>
                    {isSubscribed && (
                      <select className="mt-2 w-full border rounded px-3 py-2 text-sm">
                        <option value="2-weeks">Delivery every 2 weeks</option>
                        <option value="month">Delivery every month</option>
                        <option value="2-months">Delivery every 2 months</option>
                      </select>
                    )}
                  </div>

                  {/* Total Price */}
                  {(bulkDiscount > 0 || subscriptionDiscount > 0) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{(currentPrice * quantity).toFixed(2)}</span>
                        </div>
                        {bulkDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Bulk discount:</span>
                            <span>-{(bulkDiscount * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {subscriptionDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Subscription discount:</span>
                            <span>-5%</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span>{currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      className="w-full py-3 bg-[#478c0b] text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      {addedToCart ? (
                        <><i className="fas fa-check mr-2"></i>Added to Cart!</>
                      ) : (
                        <><i className="fas fa-shopping-cart mr-2"></i>Add to Cart</>
                      )}
                    </button>
                    <button className="w-full py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg font-semibold hover:bg-[#478c0b] hover:text-white transition-colors">
                      <i className="fas fa-qrcode mr-2"></i>Quick Buy with QR
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg text-sm font-semibold hover:bg-[#478c0b] hover:text-white transition-colors">
                        <i className="far fa-heart mr-1"></i>Wishlist
                      </button>
                      <button 
                        className="py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg text-sm font-semibold hover:bg-[#478c0b] hover:text-white transition-colors"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: product.name,
                              text: product.description,
                              url: window.location.href
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                          }
                        }}
                      >
                        <i className="fas fa-share mr-1"></i>Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-semibold mb-3">Shipping Options:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Local Pickup (VOP)</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimona Delivery</span>
                      <span>₪5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Israel Post</span>
                      <span>₪15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>International</span>
                      <span>₪45</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-shield-alt text-[#478c0b] text-lg mb-1"></i>
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <i className="fas fa-undo text-[#478c0b] text-lg mb-1"></i>
                      <span>Easy Returns</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <i className="fas fa-leaf text-[#478c0b] text-lg mb-1"></i>
                      <span>100% Vegan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <i className="fas fa-certificate text-[#478c0b] text-lg mb-1"></i>
                      <span>Kosher Certified</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 text-center">Quick Access QR Code</h4>
                  <div className="flex justify-center">
                    <SmartQRCompactFixed
                      type="product"
                      data={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        vendorId: product.vendorId,
                        vendorName: product.vendor,
                        category: product.category,
                        description: product.description
                      }}
                      size={180}
                      hideActions={true}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Scan to view on mobile
                  </p>
                </div>
                  </div>
                </div>
              </div>

              {/* Show suggestions button when hidden */}
              {relatedProducts.length > 0 && showSidebar && !showSuggestions && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowSuggestions(true)}
                    className="w-full py-3 bg-gradient-to-r from-[#cfe7c1] to-[#f6af0d]/30 hover:from-[#cfe7c1]/80 hover:to-[#f6af0d]/40 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    <i className="fas fa-sparkles text-[#f6af0d] group-hover:rotate-12 transition-transform"></i>
                    <span className="font-semibold text-[#3a3a1d]">Show Suggestions</span>
                  </button>
                </div>
              )}
              
              {/* Related Products - Enhanced Floating Card */}
              {relatedProducts.length > 0 && showSidebar && showSuggestions && (
                <div className="relative mt-6 transition-all duration-500">
                  {/* Subtle glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#478c0b]/10 to-[#f6af0d]/10 rounded-2xl blur-lg opacity-50"></div>
                  
                  {/* Main card */}
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with consistent design */}
                    <div className="bg-gradient-to-r from-[#cfe7c1] to-[#f6af0d]/20 p-4 flex items-center justify-between">
                      <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                        <i className="fas fa-sparkles text-[#f6af0d]"></i>
                        You Might Also Like
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                          From {product.vendor}
                        </span>
                        <button
                          onClick={() => setShowSuggestions(false)}
                          className="w-7 h-7 bg-white/70 hover:bg-white rounded-full flex items-center justify-center transition-all group"
                          title="Hide suggestions"
                        >
                          <i className="fas fa-times text-gray-600 group-hover:text-[#c23c09] text-sm"></i>
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                    {relatedProducts.map(relProduct => (
                      <Link key={relProduct.id} href={`/product/${relProduct.id}`}>
                        <div className="group hover:bg-gray-50 p-3 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-md cursor-pointer">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={relProduct.image} 
                                alt={relProduct.name || "Image"} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                              {relProduct.originalPrice && (
                                <div className="absolute top-1 right-1 bg-[#c23c09] text-white px-2 py-0.5 rounded text-xs font-bold">
                                  -{Math.round((1 - relProduct.price / relProduct.originalPrice) * 100)}%
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-base mb-1 truncate group-hover:text-[#478c0b] transition-colors">
                                {relProduct.name}
                              </h5>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {relProduct.description}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-xs" style={{ color: '#f6af0d' }}>
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star ${i < Math.floor(relProduct.rating) ? '' : 'text-gray-300'}`}></i>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">({relProduct.reviewCount || 0})</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                                    ₪{relProduct.price}
                                  </span>
                                  {relProduct.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      ₪{relProduct.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {relProduct.vegan && (
                                    <span className="bg-[#cfe7c1] text-[#3a3a1d] px-2 py-0.5 rounded-full text-xs font-medium">
                                      Vegan
                                    </span>
                                  )}
                                  {relProduct.kashrut && (
                                    <span className="bg-[#f6af0d] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                      Kosher
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button 
                                className="mt-2 w-full py-1.5 text-xs font-semibold text-[#478c0b] border border-[#478c0b] rounded-md hover:bg-[#478c0b] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart({
                                    id: relProduct.id,
                                    name: relProduct.name,
                                    price: relProduct.price,
                                    image: relProduct.image,
                                    quantity: 1,
                                    vendorId: product.vendorId,
                                    vendorName: product.vendor
                                  });
                                }}
                              >
                                <i className="fas fa-cart-plus mr-1"></i>
                                Quick Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-gray-50 p-4 border-t">
                      <Link href={`/store/${product.vendorId}`}>
                        <button className="w-full py-2.5 bg-white border border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-all font-semibold text-sm flex items-center justify-center gap-2">
                          <i className="fas fa-store"></i>
                          View All {product.vendor} Products
                          <i className="fas fa-arrow-right text-xs"></i>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="container mx-auto px-4 py-12">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed.map(recentProduct => (
              <Link key={recentProduct.id} href={`/product/${recentProduct.id}`}>
                <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer">
                  <div className="relative h-32">
                    <Image src={recentProduct.image} alt={recentProduct.name || "Image"} fill className="object-cover" />
                  </div>
                  <div className="p-3">
                    <h5 className="font-semibold text-sm mb-1 truncate">{recentProduct.name}</h5>
                    <div className="text-[#478c0b] font-semibold text-sm">₪{recentProduct.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Zoom Overlay */}
        {showZoom && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowZoom(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <Image
                src={product.images[selectedImage]} 
                alt={product.name || "Image"}
                width={1200}
                height={800}
                className="object-contain"
              />
              <button 
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                onClick={() => setShowZoom(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}