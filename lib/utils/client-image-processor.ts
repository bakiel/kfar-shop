/**
 * Client-side image processing utilities
 * Handles image resizing and format conversion in the browser
 */

interface ImageDimensions {
  width: number;
  height: number;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!file.type.startsWith('image/')) {
    errors.push('Please upload an image file.');
  }
  if (file.size > 10 * 1024 * 1024) {
    errors.push('Image must be smaller than 10MB.');
  }
  return { valid: errors.length === 0, errors };
}

export async function resizeImageClient(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.9
): Promise<{ dataUrl: string }> {
  const imageDataUrl = await fileToDataUrl(file);
  const resized = await processImageClientSide(imageDataUrl, { width: maxWidth, height: maxHeight }, quality);
  return { dataUrl: resized };
}

export async function createSquareCrop(imageDataUrl: string, size: number): Promise<string> {
  return processImageClientSide(imageDataUrl, { width: size, height: size });
}

export async function compressToSize(
  imageDataUrl: string,
  maxKb: number,
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let quality = 0.9;
      let output = canvas.toDataURL(`image/${format}`, quality);
      while (((output.length * 3) / 4 / 1024) > maxKb && quality > 0.45) {
        quality -= 0.1;
        output = canvas.toDataURL(`image/${format}`, quality);
      }
      resolve(output);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = imageDataUrl;
  });
}

/**
 * Process image on client-side before upload
 * Converts to JPEG and resizes maintaining aspect ratio
 */
export async function processImageClientSide(
  imageDataUrl: string,
  targetDimensions: ImageDimensions,
  quality = 0.85
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
export async function getImageDimensions(imageDataUrlOrFile: string | File): Promise<ImageDimensions> {
  const imageDataUrl = typeof imageDataUrlOrFile === 'string'
    ? imageDataUrlOrFile
    : await fileToDataUrl(imageDataUrlOrFile);

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
