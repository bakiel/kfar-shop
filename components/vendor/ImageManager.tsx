'use client';

import React from 'react';
import Image from 'next/image';

export interface ManagedImage {
  id: string;
  type: 'logo' | 'banner' | 'product';
  productId?: string;
  originalUrl: string;
  croppedUrl?: string;
  processedUrl?: string;
  status: 'uploading' | 'cropping' | 'processing' | 'ready' | 'error';
  error?: string;
  metadata?: {
    format: string;
    width: number;
    height: number;
    sizeKB: number;
  };
}

interface ImageManagerProps {
  images: ManagedImage[];
  onEdit: (imageId: string) => void;
  onRemove: (imageId: string) => void;
  onRetry: (imageId: string) => void;
}

export default function ImageManager({ images, onEdit, onRemove, onRetry }: ImageManagerProps) {
  const getImageDimensions = (type: 'logo' | 'banner' | 'product') => {
    switch (type) {
      case 'logo':
        return { width: 800, height: 800, display: '800×800' };
      case 'banner':
        return { width: 1200, height: 400, display: '1200×400' };
      case 'product':
        return { width: 800, height: 800, display: '800×800' };
    }
  };

  const getStatusIcon = (status: ManagedImage['status']) => {
    switch (status) {
      case 'uploading':
        return <i className="fas fa-upload text-blue-500 animate-pulse" />;
      case 'cropping':
        return <i className="fas fa-crop text-yellow-500 animate-pulse" />;
      case 'processing':
        return <i className="fas fa-cog text-purple-500 animate-spin" />;
      case 'ready':
        return <i className="fas fa-check-circle text-green-500" />;
      case 'error':
        return <i className="fas fa-exclamation-circle text-red-500" />;
    }
  };

  const getStatusText = (status: ManagedImage['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'cropping':
        return 'Cropping...';
      case 'processing':
        return 'Processing...';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
    }
  };

  const renderImagePreview = (image: ManagedImage) => {
    const dims = getImageDimensions(image.type);
    const imageUrl = image.processedUrl || image.croppedUrl || image.originalUrl;

    if (image.type === 'banner') {
      return (
        <div className="relative w-full h-24 sm:h-32">
          <Image
            src={imageUrl}
            alt={`${image.type} preview`}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      );
    }

    return (
      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
        <Image
          src={imageUrl}
          alt={`${image.type} preview`}
          fill
          className="object-cover rounded-lg"
        />
      </div>
    );
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-h5 font-semibold mb-3">Uploaded Images</h3>
      
      <div className="grid gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`border-2 rounded-lg p-4 transition-all ${
              image.status === 'ready' ? 'border-green-500 bg-green-50' :
              image.status === 'error' ? 'border-red-500 bg-red-50' :
              'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                {renderImagePreview(image)}
              </div>

              {/* Image Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold capitalize">
                    {image.type === 'product' ? `Product Image` : `${image.type} Image`}
                  </h4>
                  {getStatusIcon(image.status)}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Status: {getStatusText(image.status)}</p>
                  <p>Required: {getImageDimensions(image.type).display} JPEG</p>
                  
                  {image.metadata && image.status === 'ready' && (
                    <>
                      <p>Format: {image.metadata.format.toUpperCase()}</p>
                      <p>Size: {image.metadata.sizeKB}KB</p>
                      <p className={image.metadata.sizeKB > 500 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                        {image.metadata.sizeKB > 500 ? '⚠️ Size exceeds 500KB limit' : '✓ Size optimized'}
                      </p>
                    </>
                  )}

                  {image.error && (
                    <p className="text-red-600 font-medium">{image.error}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  {image.status === 'ready' && (
                    <>
                      <button
                        onClick={() => onEdit(image.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Re-crop
                      </button>
                      <button
                        onClick={() => onRemove(image.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Remove
                      </button>
                    </>
                  )}
                  
                  {image.status === 'error' && (
                    <button
                      onClick={() => onRetry(image.id)}
                      className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                    >
                      <i className="fas fa-redo mr-1"></i>
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <i className="fas fa-info-circle text-blue-600"></i>
          <p className="text-blue-800">
            {images.filter(img => img.status === 'ready').length} of {images.length} images ready.
            All images are automatically converted to JPEG format with optimized file sizes.
          </p>
        </div>
      </div>
    </div>
  );
}