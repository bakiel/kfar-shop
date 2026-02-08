import React, { useState } from 'react';
import Image from 'next/image';
import { resolveImagePath } from '@/lib/utils/image-resolver';

interface ProductImageProps {
  src: string | string[];
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  style
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // Handle both single image and array of images
  const images = Array.isArray(src) ? src : [src];
  const currentImage = images[currentImageIndex];
  
  // Fallback images
  const fallbackImages = [
    '/images/vendors/people_store_logo_community_retail.jpg',
    '/images/logos/kfar_logo_primary_horizontal.png',
    '/images/backgrounds/1.jpg'
  ];
  
  const handleImageError = () => {
    // Try next image in the array
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (!hasError) {
      // If all product images failed, use fallback
      setHasError(true);
      setCurrentImageIndex(0);
    }
  };
  
  const imageSrc = hasError ? fallbackImages[0] : currentImage;
  
  // Ensure the image path is correct using the resolver
  const processedSrc = resolveImagePath(imageSrc);
  
  if (fill) {
    return (
      <Image
        src={processedSrc}
        alt={alt || "Image"}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        style={style}
        onError={handleImageError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    );
  }
  
  return (
    <Image
      src={processedSrc}
      alt={alt || "Image"}
      width={width || 300}
      height={height || 300}
      className={className}
      priority={priority}
      style={style}
      onError={handleImageError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
};

export default ProductImage;