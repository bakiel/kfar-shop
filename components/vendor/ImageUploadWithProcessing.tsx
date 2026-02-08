'use client';

import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';
import ImageGuidelines from './ImageGuidelines';
import {
  resizeImageClient,
  createSquareCrop,
  validateImageFile,
  getImageDimensions,
  compressToSize
} from '@/lib/utils/client-image-processor';

interface ImageUploadWithProcessingProps {
  onImageProcessed: (imageUrl: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUploadWithProcessing({
  onImageProcessed,
  currentImage,
  label = 'Product Image'
}: ImageUploadWithProcessingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setProcessing(true);

    try {
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Resize if needed
      const result = await resizeImageClient(file, 1600, 1600, 0.95);
      
      // If image is not square, show cropper
      if (dimensions.width !== dimensions.height) {
        setImageToEdit(result.dataUrl);
        setShowCropper(true);
      } else {
        // Process square image directly
        await processImage(result.dataUrl);
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Image processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setShowCropper(false);
    await processImage(croppedImage);
  };

  const processImage = async (imageUrl: string) => {
    setProcessing(true);
    
    try {
      // Create 800x800 square crop
      const squareImage = await createSquareCrop(imageUrl, 800);
      
      // Compress to under 500KB
      const compressedImage = await compressToSize(squareImage, 500, 'jpeg');
      
      // Set preview and notify parent
      setPreview(compressedImage);
      onImageProcessed(compressedImage);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Image processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageProcessed('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Label and Guidelines Button */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowGuidelines(true)}
          className="text-sm text-[#478c0b] hover:text-[#3a7209] flex items-center gap-1"
        >
          <i className="fas fa-info-circle"></i>
          Photo Guidelines
        </button>
      </div>

      {/* Upload Area */}
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                <i className="fas fa-edit mr-1"></i>
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#478c0b] transition-colors"
          >
            {processing ? (
              <div className="space-y-3">
                <i className="fas fa-spinner fa-spin text-4xl text-[#478c0b]"></i>
                <p className="text-gray-600">Processing image...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                <p className="text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG or WebP (max 10MB)
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={processing}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Image Specifications */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <p className="font-semibold mb-1">Image Requirements:</p>
        <ul className="space-y-0.5">
          <li>• Dimensions: 800x800 pixels (square)</li>
          <li>• Format: JPEG (auto-converted)</li>
          <li>• Max file size: 500KB (auto-compressed)</li>
          <li>• Background: White recommended</li>
        </ul>
      </div>

      {/* Cropper Modal */}
      {showCropper && imageToEdit && (
        <ImageCropper
          image={imageToEdit}
          aspectRatio={1}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setImageToEdit(null);
          }}
        />
      )}

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="my-8">
            <ImageGuidelines
              imageUrl={preview || undefined}
              onClose={() => setShowGuidelines(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}