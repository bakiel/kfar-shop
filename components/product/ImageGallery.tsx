'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Main Image */}
        <div 
          className="relative h-[400px] sm:h-[500px] cursor-zoom-in overflow-hidden group"
          onClick={() => setShowZoom(true)}
        >
          <Image
            src={images[selectedImage]}
            alt={productName || "Image"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Zoom Icon */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="fas fa-search-plus text-gray-700"></i>
          </div>
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === selectedImage 
                    ? 'border-leaf-green shadow-md' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={image}
                  alt={productName ? `${productName} ${index + 1}` : "Image"}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowZoom(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <Image
              src={images[selectedImage]}
              alt={productName || "Image"}
              width={1200}
              height={1200}
              className="object-contain max-h-[90vh] w-auto"
            />
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-times text-gray-700"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;