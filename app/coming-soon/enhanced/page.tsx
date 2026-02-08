'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function EnhancedComingSoonPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<Array<{url: string, description: string}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(0);

  // Community images slideshow
  const communityImages = Array.from({ length: 27 }, (_, i) => `/images/community/${i + 1}.jpg`);

  // Vendor preview data
  const vendors = [
    { name: "Garden of Light", type: "Vegan Deli", icon: "fa-sun", color: "#f6af0d" },
    { name: "Teva Deli", type: "Plant-Based Meats", icon: "fa-leaf", color: "#478c0b" },
    { name: "People Store", type: "Bulk Foods", icon: "fa-shopping-basket", color: "#c23c09" },
    { name: "Village of Peace Shop", type: "Community Products", icon: "fa-home", color: "#3a3a1d" }
  ];

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % communityImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [communityImages.length]);

  // Generate vendor preview images
  const generateVendorImage = async (vendorName: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vendor',
          prompt: `${vendorName} storefront, vegan marketplace, professional shop interior, African Hebrew Israelite community style`,
          style: 'african',
          quality: 'standard'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Verify the image
        const verifyResponse = await fetch('/api/verify-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: data.imageUrl })
        });

        if (verifyResponse.ok) {
          const quality = await verifyResponse.json();
          setGeneratedImages(prev => [...prev, {
            url: data.imageUrl,
            description: quality.description
          }]);
        }
      }
    } catch (error) {
      console.error('Error generating vendor image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-base relative overflow-hidden">
      {/* Background Slideshow */}
      <div className="fixed inset-0 z-0">
        {communityImages.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={img}
              alt={`Community image ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Image
              src="/images/logos/kfar_logo_white_on_green.png"
              alt="KFAR Logo"
              width={150}
              height={60}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-2"
            />
            <div className="text-white text-sm">
              <i className="fas fa-clock mr-2"></i>
              Launching Soon
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in">
                KFAR Marketplace
              </h1>
              <p className="text-3xl md:text-4xl text-white/90 mb-4">
                The Whole Village, In Your Hand
              </p>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Experience the authentic vegan marketplace of the Village of Peace community. 
                Quality products, cultural heritage, and sustainable living - coming soon to your digital doorstep.
              </p>

              {/* Countdown Timer */}
              <div className="flex justify-center gap-4 mb-12">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                  <div className="text-3xl font-bold text-white">15</div>
                  <div className="text-sm text-white/80">Days</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                  <div className="text-3xl font-bold text-white">08</div>
                  <div className="text-sm text-white/80">Hours</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                  <div className="text-3xl font-bold text-white">42</div>
                  <div className="text-sm text-white/80">Minutes</div>
                </div>
              </div>
            </div>

            {/* Featured Vendors Preview */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Meet Our First Vendors
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                {vendors.map((vendor, idx) => (
                  <div
                    key={vendor.name}
                    className="bg-white/95 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelectedVendor(idx);
                      generateVendorImage(vendor.name);
                    }}
                  >
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: vendor.color }}
                    >
                      <i className={`fas ${vendor.icon} text-3xl text-white`}></i>
                    </div>
                    <h3 className="text-xl font-bold text-center mb-1" style={{ color: '#3a3a1d' }}>
                      {vendor.name}
                    </h3>
                    <p className="text-center text-gray-600">{vendor.type}</p>
                    {selectedVendor === idx && isGenerating && (
                      <div className="mt-4 text-center text-sm text-gray-500">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Generating preview...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI-Generated Images Gallery */}
            {generatedImages.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-white text-center mb-6">
                  AI-Generated Vendor Previews
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={img.url}
                        alt={`Generated preview ${idx + 1}`}
                        width={400}
                        height={300}
                        className="rounded-lg w-full"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-4">
                        <p className="text-white text-sm text-center">{img.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Signup with Animation */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: '#3a3a1d' }}>
                  Be Part of Our Journey
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Join our community and get exclusive early access when we launch!
                </p>
                <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-leaf-green focus:outline-none text-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:shadow-lg transition-all duration-300"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Get Early Access
                  </button>
                </form>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Join 500+ people waiting for launch
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <i className="fas fa-leaf text-4xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">100% Vegan</h3>
                <p className="text-white/80">Every product is plant-based and cruelty-free</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <i className="fas fa-users text-4xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Community First</h3>
                <p className="text-white/80">Supporting local Village of Peace businesses</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <i className="fas fa-truck text-4xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Easy Delivery</h3>
                <p className="text-white/80">Convenient shopping across Israel</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center gap-6 mb-4">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-whatsapp text-2xl"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-youtube text-2xl"></i>
              </a>
            </div>
            <p className="text-white/60 text-sm">
              © 2025 KFAR Marketplace - Village of Peace, Dimona, Israel
            </p>
          </div>
        </footer>
      </div>

      {/* Floating Generate Button */}
      <button
        onClick={() => generateVendorImage('Random Shop')}
        className="fixed bottom-8 right-8 bg-sun-gold text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        disabled={isGenerating}
      >
        <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'} text-xl`}></i>
      </button>
    </div>
  );
}