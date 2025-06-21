'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import ImageGallery from '@/components/product/ImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductTabs from '@/components/product/ProductTabs';
import { productService, vendorService } from '@/lib/services/api-products';
import { useCart } from '@/lib/context/CartContext';
import type { Product, Vendor } from '@/lib/data/products';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product details
      const productData = await productService.getProduct(productId);
      if (!productData) {
        setError('Product not found');
        return;
      }
      setProduct(productData);
      
      // Fetch vendor details
      const vendorData = await vendorService.getVendor(productData.vendorId);
      setVendor(vendorData);
      
      // Fetch related products
      const related = await productService.getRecommendations(productId);
      setRelatedProducts(related);
      
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        vendorId: product.vendorId,
        vendorName: vendor?.name || '',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: '#478c0b' }}></i>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl mb-4" style={{ color: '#c23c09' }}></i>
            <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
            <Link href="/marketplace">
              <button className="px-6 py-3 bg-leaf-green text-white rounded-full hover:bg-leaf-green/90 transition-colors">
                Back to Marketplace
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const images = product.images || [product.image];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-cream-base to-white">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-leaf-green">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <Link href="/marketplace" className="hover:text-leaf-green">Marketplace</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <Image alt="Product image"Gallery 
              images={images} 
              productName={product.name}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />

            {/* Product Info */}
            <ProductInfo
              product={product}
              vendor={vendor}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Product Tabs */}
          <ProductTabs product={product} vendor={vendor} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-3xl font-bold mb-8" style={{ color: '#3a3a1d' }}>
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(relatedProduct => (
                  <Link href={`/product/${relatedProduct.id}`} key={relatedProduct.id}>
                    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48">
                        <Image
                          src={relatedProduct.image}
                          alt={relatedProduct.name || "Image"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {relatedProduct.isNew && (
                          <span className="absolute top-2 left-2 px-3 py-1 bg-sun-gold text-white text-xs font-semibold rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1 line-clamp-1" style={{ color: '#3a3a1d' }}>
                          {relatedProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {relatedProduct.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold" style={{ color: '#c23c09' }}>
                              ₪{relatedProduct.price}
                            </span>
                            {relatedProduct.originalPrice && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ₪{relatedProduct.originalPrice}
                              </span>
                            )}
                          </div>
                          {relatedProduct.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <i className="fas fa-star text-yellow-400 text-sm"></i>
                              <span className="text-sm text-gray-600">{relatedProduct.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Vendor Info Card */}
          {vendor && (
            <section className="mt-16">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-start gap-6">
                  {vendor.logo && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={vendor.logo}
                        alt={vendor.name || "Image"}
                        fill
                        className="object-cover rounded-full border-4 border-leaf-green"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
                      {vendor.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{vendor.description}</p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-star text-yellow-400"></i>
                        <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                        <span className="text-gray-600">({vendor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-truck"></i>
                        <span>{vendor.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="fas fa-shopping-basket"></i>
                        <span>Min. order: ₪{vendor.minimumOrder}</span>
                      </div>
                    </div>
                    <Link href={`/vendor/${vendor.id}`}>
                      <button className="px-6 py-3 bg-leaf-green text-white rounded-full hover:bg-leaf-green/90 transition-colors">
                        Visit Store
                        <i className="fas fa-arrow-right ml-2"></i>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}