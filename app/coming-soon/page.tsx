'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ComingSoonPage() {
  const [heroImage, setHeroImage] = useState<string>('/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_01.jpg');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageQuality, setImageQuality] = useState<string>('');

  // Generate hero image on mount
  useEffect(() => {
    generateHeroImage();
  }, []);

  const generateHeroImage = async () => {
    setGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hero',
          prompt: 'modern African marketplace digital platform, vibrant colors, kente patterns, technology meets tradition, professional web design hero image, Village of Peace community',
          style: 'african',
          quality: 'premium'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setHeroImage(data.imageUrl);
        
        // Verify image quality
        const qualityCheck = await fetch('/api/verify-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: data.imageUrl })
        });
        
        if (qualityCheck.ok) {
          const quality = await qualityCheck.json();
          setImageQuality(quality.description);
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with AI-Generated Background */}
      <div className="relative flex-1">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="KFAR Marketplace Coming Soon"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/images/logos/kfar_logo_white_on_green.png"
                alt="KFAR Logo"
                width={200}
                height={80}
                className="mx-auto"
              />
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Coming Soon
            </h1>
            
            {/* Tagline */}
            <p className="text-2xl md:text-3xl text-white/90 mb-4">
              The Whole Village, In Your Hand
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              KFAR Marketplace is bringing the authentic vegan businesses of the Village of Peace 
              community in Dimona, Israel to your fingertips. Quality products, cultural heritage, 
              and community values - all in one digital marketplace.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: '#478c0b' }}>
                  <i className="fas fa-leaf text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">100% Vegan</h3>
                <p className="text-white/80">Authentic plant-based products from our community</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: '#f6af0d' }}>
                  <i className="fas fa-store text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Local Businesses</h3>
                <p className="text-white/80">Supporting Village of Peace entrepreneurs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: '#c23c09' }}>
                  <i className="fas fa-truck text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Easy Delivery</h3>
                <p className="text-white/80">Convenient shopping and delivery options</p>
              </div>
            </div>

            {/* Email Signup */}
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                Be the first to know when we launch!
              </h3>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sun-gold"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  Notify Me
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="mt-12 flex justify-center gap-6">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <i className="fab fa-whatsapp text-2xl"></i>
              </a>
            </div>

            {/* Image Generation Status */}
            {generatingImage && (
              <div className="mt-8 text-white/60 text-sm">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Generating premium hero image...
              </div>
            )}
            
            {imageQuality && (
              <div className="mt-4 text-white/60 text-xs max-w-md mx-auto">
                AI Vision: {imageQuality}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}