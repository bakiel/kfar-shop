'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  image: string;
  aspectRatio: number;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

interface ImageMetrics {
  size: number;
  sizeKB: number;
  format: string;
  width: number;
  height: number;
  warnings: string[];
}

export default function ImageCropper({ image, aspectRatio, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageMetrics, setImageMetrics] = useState<ImageMetrics | null>(null);
  const [processing, setProcessing] = useState(false);
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    if (imageRef.current && imageLoaded) {
      drawCanvas();
      drawPreview();
      updateImageMetrics();
    }
  }, [crop, imageLoaded, displayScale]);

  // Recalculate scale on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current && imageLoaded) {
        const image = imageRef.current;
        const scaleX = image.width / image.naturalWidth;
        const scaleY = image.height / image.naturalHeight;
        const scale = Math.min(scaleX, scaleY);
        setDisplayScale(scale);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match crop area
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cropped portion of image
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
  };

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas actual dimensions to 800x800
    canvas.width = 800;
    canvas.height = 800;
    
    // Set display size based on screen size
    const displaySize = window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 250 : 300;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;

    // Clear canvas
    ctx.clearRect(0, 0, 800, 800);

    // Fill with white background for JPEG conversion
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 800);

    // Calculate actual crop coordinates based on natural image size
    const actualCropX = crop.x / displayScale;
    const actualCropY = crop.y / displayScale;
    const actualCropWidth = crop.width / displayScale;
    const actualCropHeight = crop.height / displayScale;

    // Draw cropped and resized portion using actual coordinates
    ctx.drawImage(
      image,
      actualCropX,
      actualCropY,
      actualCropWidth,
      actualCropHeight,
      0,
      0,
      800,
      800
    );
  };

  const updateImageMetrics = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    // Get image data as blob to check file size
    canvas.toBlob((blob) => {
      if (!blob) return;

      const sizeKB = Math.round(blob.size / 1024);
      const warnings: string[] = [];

      if (sizeKB > 500) {
        warnings.push(`File size (${sizeKB}KB) exceeds 500KB limit`);
      }

      if (crop.width < 800 || crop.height < 800) {
        warnings.push('Source area is smaller than 800x800 pixels - image may be upscaled');
      }

      setImageMetrics({
        size: blob.size,
        sizeKB,
        format: 'JPEG',
        width: 800,
        height: 800,
        warnings
      });
    }, 'image/jpeg', 0.9);
  };

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) return;

    // Calculate display scale
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const displayWidth = image.width;
    const displayHeight = image.height;
    
    // The scale factor is how much the image is scaled down for display
    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    setDisplayScale(scale);

    // Calculate initial crop based on aspect ratio (using display dimensions)
    const imgAspect = displayWidth / displayHeight;
    let width, height, x, y;

    if (imgAspect > aspectRatio) {
      // Image is wider than desired ratio
      height = displayHeight;
      width = height * aspectRatio;
      x = (displayWidth - width) / 2;
      y = 0;
    } else {
      // Image is taller than desired ratio
      width = displayWidth;
      height = width / aspectRatio;
      x = 0;
      y = (displayHeight - height) / 2;
    }

    setCrop({ x, y, width, height });
    setImageLoaded(true);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setDragStart({
      x: clientX - rect.left - crop.x,
      y: clientY - rect.top - crop.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imageRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const image = imageRef.current;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - rect.left - dragStart.x;
    let newY = clientY - rect.top - dragStart.y;

    // Use display dimensions for bounds
    const displayWidth = image.width;
    const displayHeight = image.height;

    // Constrain crop area within image bounds
    newX = Math.max(0, Math.min(newX, displayWidth - crop.width));
    newY = Math.max(0, Math.min(newY, displayHeight - crop.height));

    setCrop({ ...crop, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    setProcessing(true);
    
    try {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;

      // Get the 800x800 preview as data URL
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      
      // Process through API for final optimization
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: croppedImage,
          options: {
            format: 'jpeg',
            quality: 90,
            maxSizeKB: 500
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result = await response.json();
      
      if (result.success) {
        onCropComplete(result.image);
      } else {
        // Fallback to client-side processed image
        onCropComplete(croppedImage);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to client-side processed image
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
        onCropComplete(croppedImage);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleZoom = (factor: number) => {
    if (!imageRef.current) return;
    const image = imageRef.current;

    const newWidth = crop.width * factor;
    const newHeight = newWidth / aspectRatio;

    // Use display dimensions for bounds checking
    const displayWidth = image.width;
    const displayHeight = image.height;

    // Ensure crop doesn't exceed image bounds
    if (newWidth > displayWidth || newHeight > displayHeight) return;
    if (newWidth < 50 || newHeight < 50) return; // Minimum size

    // Center the crop after zoom
    const newX = crop.x - (newWidth - crop.width) / 2;
    const newY = crop.y - (newHeight - crop.height) / 2;

    setCrop({
      x: Math.max(0, Math.min(newX, displayWidth - newWidth)),
      y: Math.max(0, Math.min(newY, displayHeight - newHeight)),
      width: newWidth,
      height: newHeight
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Crop Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center px-2">
            Drag the crop area to adjust. Use zoom controls to resize.
          </p>
          
          {/* Zoom Controls */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
            <button
              onClick={() => handleZoom(0.9)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <i className="fas fa-search-minus mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Zoom Out</span>
              <span className="sm:hidden">-</span>
            </button>
            <button
              onClick={() => handleZoom(1.1)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <i className="fas fa-search-plus mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Zoom In</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>

          {/* Cropper Area */}
          <div className="relative inline-block mx-auto max-w-full">
            <div
              ref={containerRef}
              className="relative overflow-hidden bg-gray-100"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', maxHeight: 'calc(100vh - 400px)', maxWidth: '100%' }}
            >
              <img
                ref={imageRef}
                src={image}
                alt="Source"
                onLoad={handleImageLoad}
                className="max-w-full h-auto"
                style={{ maxHeight: '50vh', width: 'auto' }}
              />
              
              {imageLoaded && (
                <>
                  {/* Crop overlay */}
                  <div
                    className="absolute border-2 border-[#478c0b] bg-transparent"
                    style={{
                      left: crop.x,
                      top: crop.y,
                      width: crop.width,
                      height: crop.height,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                  >
                    {/* Corner handles */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#478c0b] rounded-full"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#478c0b] rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#478c0b] rounded-full"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#478c0b] rounded-full"></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview and Metrics */}
          <div className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Preview */}
              <div className="text-center">
                <p className="text-sm font-semibold mb-2">800x800 Preview:</p>
                <div className="inline-block border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full max-w-[200px] sm:max-w-[250px] lg:max-w-[300px]"
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
              </div>

              {/* Image Metrics */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Image Information:</p>
                
                {imageMetrics && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">{imageMetrics.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">{imageMetrics.width} x {imageMetrics.height}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Size:</span>
                      <span className={`font-medium ${imageMetrics.sizeKB > 500 ? 'text-red-600' : 'text-green-600'}`}>
                        {imageMetrics.sizeKB}KB
                      </span>
                    </div>
                    
                    {imageMetrics.warnings.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {imageMetrics.warnings.map((warning, index) => (
                          <div key={index} className="flex items-start gap-2 text-amber-600">
                            <i className="fas fa-exclamation-triangle mt-0.5 text-xs"></i>
                            <span className="text-xs">{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <i className="fas fa-info-circle mr-1"></i>
                    Image will be converted to JPEG format with white background
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for original crop */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={processing}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-[#478c0b] text-white rounded-lg hover:bg-[#3a7209] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
          >
            {processing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Apply Crop
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}