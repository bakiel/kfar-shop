'use client';

import React from 'react';
import { StoreTemplate, StoreSection } from '@/lib/data/store-templates';
import Image from 'next/image';
import { Star, Clock, MapPin, Phone, Mail, ShoppingCart, Truck, CreditCard, Award } from 'lucide-react';
import { Product } from '@/lib/data/products';
import { useCart } from '@/lib/context/CartContext';
import ProductImage from '@/components/ui/ProductImage';

interface DynamicStoreRendererProps {
  template: StoreTemplate;
  vendorData: any;
  products: Product[];
  customizations?: any;
}

export default function DynamicStoreRenderer({ 
  template, 
  vendorData, 
  products,
  customizations 
}: DynamicStoreRendererProps) {
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  
  // Merge template with customizations
  const finalTemplate = customizations ? {
    ...template,
    colorScheme: { ...template.colorScheme, ...customizations.colors },
    typography: { ...template.typography, ...customizations.typography },
    layout: { ...template.layout, ...customizations.layout }
  } : template;

  // Apply global styles
  const globalStyles = `
    :root {
      --primary: ${finalTemplate.colorScheme.primary};
      --secondary: ${finalTemplate.colorScheme.secondary};
      --accent: ${finalTemplate.colorScheme.accent};
      --background: ${finalTemplate.colorScheme.background};
      --text: ${finalTemplate.colorScheme.text};
      --muted: ${finalTemplate.colorScheme.muted};
      --radius: ${finalTemplate.layout.cornerRadius === 'none' ? '0' : 
                  finalTemplate.layout.cornerRadius === 'small' ? '0.375rem' :
                  finalTemplate.layout.cornerRadius === 'medium' ? '0.75rem' : '1rem'};
    }
  `;

  const renderSection = (section: StoreSection) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'hero':
        return (
          <section 
            key={section.id}
            className="relative overflow-hidden"
            style={{ height: section.config.height || '60vh' }}
          >
            <div className="absolute inset-0">
              <Image
                src={vendorData.bannerImage || vendorData.logo}
                alt={vendorData.businessName || "Image"}
                fill
                className="object-cover"
                style={{ opacity: section.config.overlay === 'dark' ? 0.4 : 0.3 }}
              />
            </div>
            
            <div 
              className="absolute inset-0"
              style={{
                background: section.config.overlay === 'gradient' 
                  ? `linear-gradient(to bottom right, ${finalTemplate.colorScheme.primary}90, ${finalTemplate.colorScheme.secondary}90)`
                  : 'rgba(0,0,0,0.4)'
              }}
            />
            
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
              <div className="max-w-4xl">
                <div className="mb-6 flex items-center gap-4">
                  <div 
                    className="w-20 h-20 md:w-28 md:h-28 relative bg-white shadow-xl p-2"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <Image
                      src={vendorData.logo}
                      alt={vendorData.businessName || "Image"}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <h1 
                      className="font-bold text-white mb-2"
                      style={{ 
                        fontSize: finalTemplate.typography.sizes.hero,
                        fontFamily: finalTemplate.typography.headingFont 
                      }}
                    >
                      {vendorData.businessName}
                    </h1>
                    <div className="flex items-center gap-2 text-white/90">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{vendorData.rating}</span>
                      <span>({vendorData.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p 
                  className="text-white/90 mb-8 leading-relaxed"
                  style={{ 
                    fontSize: finalTemplate.typography.sizes.subheading,
                    fontFamily: finalTemplate.typography.bodyFont 
                  }}
                >
                  {vendorData.description}
                </p>

                {section.config.showStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                      className="bg-white/20 backdrop-blur p-4"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <ShoppingCart className="w-6 h-6 text-white mb-2" />
                      <p className="text-white font-semibold">{vendorData.productCount}+ Products</p>
                    </div>
                    <div 
                      className="bg-white/20 backdrop-blur p-4"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <Truck className="w-6 h-6 text-white mb-2" />
                      <p className="text-white font-semibold">{vendorData.estimatedDeliveryTime}</p>
                    </div>
                    <div 
                      className="bg-white/20 backdrop-blur p-4"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <CreditCard className="w-6 h-6 text-white mb-2" />
                      <p className="text-white font-semibold">Min ₪{vendorData.minimumOrder}</p>
                    </div>
                    <div 
                      className="bg-white/20 backdrop-blur p-4"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <Award className="w-6 h-6 text-white mb-2" />
                      <p className="text-white font-semibold">{vendorData.certifications?.[0] || 'Certified'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'products':
        const gridCols = {
          mobile: `grid-cols-${finalTemplate.layout.columns.mobile}`,
          tablet: `md:grid-cols-${finalTemplate.layout.columns.tablet}`,
          desktop: `lg:grid-cols-${finalTemplate.layout.columns.desktop}`
        };

        return (
          <section key={section.id} className="container mx-auto px-4 py-12">
            <h2 
              className="font-bold mb-8"
              style={{ 
                fontSize: finalTemplate.typography.sizes.heading,
                fontFamily: finalTemplate.typography.headingFont,
                color: finalTemplate.colorScheme.text
              }}
            >
              Our Products
            </h2>

            <div className={`grid ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop} gap-6`}>
              {products.map((product) => {
                const inCart = isInCart(product.id);
                const quantity = getQuantity(product.id);

                return (
                  <div 
                    key={product.id} 
                    className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div className="relative h-48">
                      <ProductImage
                        src={product.image}
                        alt={product.name || "Image"}
                        className="w-full h-full object-cover"
                      />
                      {product.isNew && (
                        <span 
                          className="absolute top-2 right-2 text-white px-3 py-1 text-sm font-semibold"
                          style={{ 
                            backgroundColor: finalTemplate.colorScheme.accent,
                            borderRadius: 'var(--radius)' 
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 
                        className="font-semibold mb-2"
                        style={{ 
                          fontSize: finalTemplate.typography.sizes.body,
                          color: finalTemplate.colorScheme.text 
                        }}
                      >
                        {product.name}
                      </h3>
                      <p 
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: finalTemplate.colorScheme.muted }}
                      >
                        {product.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span 
                          className="text-2xl font-bold"
                          style={{ color: finalTemplate.colorScheme.primary }}
                        >
                          ₪{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm line-through" style={{ color: finalTemplate.colorScheme.muted }}>
                            ₪{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {!inCart ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full py-3 font-semibold text-white transition-all duration-300"
                          style={{ 
                            backgroundColor: finalTemplate.colorScheme.primary,
                            borderRadius: 'var(--radius)'
                          }}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="px-4 py-2 border-2 font-semibold"
                            style={{ 
                              borderColor: finalTemplate.colorScheme.primary,
                              color: finalTemplate.colorScheme.primary,
                              borderRadius: 'var(--radius)'
                            }}
                          >
                            -
                          </button>
                          <span className="font-semibold text-lg">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="px-4 py-2 font-semibold text-white"
                            style={{ 
                              backgroundColor: finalTemplate.colorScheme.primary,
                              borderRadius: 'var(--radius)'
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case 'about':
        return (
          <section 
            key={section.id} 
            className="py-12"
            style={{ backgroundColor: finalTemplate.colorScheme.background }}
          >
            <div className="container mx-auto px-4">
              <div className={`grid ${section.config.layout === 'split' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
                <div>
                  <h2 
                    className="font-bold mb-4"
                    style={{ 
                      fontSize: finalTemplate.typography.sizes.heading,
                      fontFamily: finalTemplate.typography.headingFont,
                      color: finalTemplate.colorScheme.text
                    }}
                  >
                    About {vendorData.businessName}
                  </h2>
                  <p 
                    className="mb-6"
                    style={{ 
                      fontSize: finalTemplate.typography.sizes.body,
                      fontFamily: finalTemplate.typography.bodyFont,
                      color: finalTemplate.colorScheme.muted
                    }}
                  >
                    {vendorData.description}
                  </p>
                  
                  {section.config.showMission && vendorData.features && (
                    <div>
                      <h3 
                        className="font-semibold mb-3"
                        style={{ 
                          fontSize: finalTemplate.typography.sizes.subheading,
                          color: finalTemplate.colorScheme.text
                        }}
                      >
                        Our Values
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {vendorData.features.map((feature: string) => (
                          <span 
                            key={feature} 
                            className="px-3 py-1 text-sm"
                            style={{ 
                              backgroundColor: `${finalTemplate.colorScheme.secondary}20`,
                              color: finalTemplate.colorScheme.primary,
                              borderRadius: 'var(--radius)'
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {section.config.showImage && section.config.layout === 'split' && (
                  <div 
                    className="relative h-64 md:h-auto"
                    style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}
                  >
                    <Image
                      src={vendorData.logo}
                      alt={vendorData.businessName || "Image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section 
            key={section.id} 
            className="py-12 bg-gray-100"
          >
            <div className="container mx-auto px-4">
              <h2 
                className="font-bold mb-8 text-center"
                style={{ 
                  fontSize: finalTemplate.typography.sizes.heading,
                  fontFamily: finalTemplate.typography.headingFont,
                  color: finalTemplate.colorScheme.text
                }}
              >
                Visit Us
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div 
                  className="bg-white p-6 text-center"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <Phone 
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: finalTemplate.colorScheme.primary }}
                  />
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p style={{ color: finalTemplate.colorScheme.muted }}>
                    {vendorData.contactInfo?.phone || 'Contact via app'}
                  </p>
                </div>
                
                <div 
                  className="bg-white p-6 text-center"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <Mail 
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: finalTemplate.colorScheme.primary }}
                  />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p style={{ color: finalTemplate.colorScheme.muted }}>
                    {vendorData.contactInfo?.email || 'info@kfar.com'}
                  </p>
                </div>
                
                <div 
                  className="bg-white p-6 text-center"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <MapPin 
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: finalTemplate.colorScheme.primary }}
                  />
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p style={{ color: finalTemplate.colorScheme.muted }}>
                    {vendorData.contactInfo?.address || 'Village of Peace, Dimona'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div style={{ backgroundColor: finalTemplate.colorScheme.background, minHeight: '100vh' }}>
        {finalTemplate.sections
          .sort((a, b) => a.order - b.order)
          .map(section => renderSection(section))}
      </div>
    </div>
  );
}