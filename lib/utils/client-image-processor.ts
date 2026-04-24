/**
 * Client-side image processing utilities
 * Handles image resizing and format conversion in the browser
 */

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Process image on client-side before upload
 * Converts to JPEG and resizes maintaining aspect ratio
 */
export async function processImageClientSide(
  imageDataUrl: string,
  targetDimensions: ImageDimensions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions maintaining aspect ratio
        const { width: targetWidth, height: targetHeight } = targetDimensions;
        const aspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight;
        
        let drawWidth = targetWidth;
        let drawHeight = targetHeight;
        let offsetX = 0;
        let offsetY = 0;
        
        // Smart cropping to maintain aspect ratio
        if (aspectRatio > targetAspectRatio) {
          // Image is wider than target
          const scaledWidth = targetHeight * aspectRatio;
          offsetX = (scaledWidth - targetWidth) / 2;
          drawWidth = scaledWidth;
        } else if (aspectRatio < targetAspectRatio) {
          // Image is taller than target
          const scaledHeight = targetWidth / aspectRatio;
          offsetY = (scaledHeight - targetHeight) / 2;
          drawHeight = scaledHeight;
        }
        
        // Set canvas size to target dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Fill with white background (for transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Draw image with smart cropping
        ctx.drawImage(
          img,
          -offsetX,
          -offsetY,
          drawWidth,
          drawHeight
        );
        
        // Convert to JPEG with quality setting
        const quality = 0.85; // 85% quality for good balance
        const processedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Check file size and adjust quality if needed
        const base64Length = processedDataUrl.length;
        const estimatedSizeKB = (base64Length * 3) / 4 / 1024;
        
        if (estimatedSizeKB > 500) {
          // If over 500KB, reduce quality
          const reducedQuality = 0.7;
          const compressedDataUrl = canvas.toDataURL('image/jpeg', reducedQuality);
          resolve(compressedDataUrl);
        } else {
          resolve(processedDataUrl);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image
    img.src = imageDataUrl;
  });
}

/**
 * Get image dimensions from data URL
 */
export function getImageDimensions(imageDataUrl: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for dimensions'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Check if image needs processing
 */
export async function needsProcessing(
  imageDataUrl: string,
  targetDimensions: ImageDimensions
): Promise<boolean> {
  try {
    const dimensions = await getImageDimensions(imageDataUrl);
    const isJpeg = imageDataUrl.includes('image/jpeg');
    
    return (
      !isJpeg ||
      dimensions.width !== targetDimensions.width ||
      dimensions.height !== targetDimensions.height
    );
  } catch {
    return true;
  }
}