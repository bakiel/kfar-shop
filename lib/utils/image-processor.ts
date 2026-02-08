import sharp from 'sharp';

export interface ImageProcessingResult {
  buffer: Buffer;
  format: string;
  size: number;
  width: number;
  height: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  warnings: string[];
}

export interface ImageProcessingOptions {
  targetWidth?: number;
  targetHeight?: number;
  maxSizeKB?: number;
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  background?: string;
}

const DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
  targetWidth: 800,
  targetHeight: 800,
  maxSizeKB: 500,
  format: 'jpeg',
  quality: 90,
  background: '#FFFFFF'
};

/**
 * Process an image buffer to meet marketplace requirements
 */
export async function processImage(
  input: Buffer,
  options: ImageProcessingOptions = {}
): Promise<ImageProcessingResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];

  try {
    // Get original image metadata
    const metadata = await sharp(input).metadata();
    
    // Create sharp instance
    let image = sharp(input);

    // Handle transparency by adding white background for JPEG
    if (opts.format === 'jpeg' && metadata.channels === 4) {
      image = image.flatten({ background: opts.background });
      warnings.push('Transparency removed and replaced with white background');
    }

    // Smart crop to square aspect ratio
    if (metadata.width !== metadata.height) {
      const size = Math.min(metadata.width || 800, metadata.height || 800);
      image = image.resize(size, size, {
        fit: 'cover',
        position: 'center',
        kernel: sharp.kernel.lanczos3
      });
      warnings.push('Image cropped to square aspect ratio');
    }

    // Resize to target dimensions
    image = image.resize(opts.targetWidth, opts.targetHeight, {
      fit: 'cover',
      position: 'center',
      kernel: sharp.kernel.lanczos3
    });

    // Convert to target format with quality settings
    let processed = await image
      .toFormat(opts.format as keyof sharp.FormatEnum, {
        quality: opts.quality,
        mozjpeg: opts.format === 'jpeg',
        progressive: true
      })
      .toBuffer({ resolveWithObject: true });

    // Check file size and reduce quality if needed
    let currentQuality = opts.quality;
    while (processed.info.size > opts.maxSizeKB * 1024 && currentQuality > 60) {
      currentQuality -= 10;
      processed = await sharp(input)
        .flatten({ background: opts.background })
        .resize(opts.targetWidth, opts.targetHeight, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat(opts.format as keyof sharp.FormatEnum, {
          quality: currentQuality,
          mozjpeg: opts.format === 'jpeg',
          progressive: true
        })
        .toBuffer({ resolveWithObject: true });
      
      if (currentQuality < opts.quality) {
        warnings.push(`Quality reduced to ${currentQuality}% to meet file size requirements`);
      }
    }

    // Determine quality rating
    const quality = getImageQuality(processed.info, currentQuality);

    return {
      buffer: processed.data,
      format: processed.info.format,
      size: processed.info.size,
      width: processed.info.width,
      height: processed.info.height,
      quality,
      warnings
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert base64 string to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Convert buffer to base64 string
 */
export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Get image quality rating based on metadata
 */
function getImageQuality(
  info: sharp.OutputInfo,
  quality: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  const sizeKB = info.size / 1024;
  
  if (quality >= 90 && sizeKB < 300) {
    return 'excellent';
  } else if (quality >= 80 && sizeKB < 400) {
    return 'good';
  } else if (quality >= 70 && sizeKB < 500) {
    return 'fair';
  }
  return 'poor';
}

/**
 * Validate image before processing
 */
export async function validateImage(buffer: Buffer): Promise<{
  valid: boolean;
  errors: string[];
  metadata?: sharp.Metadata;
}> {
  const errors: string[] = [];

  try {
    const metadata = await sharp(buffer).metadata();

    // Check format
    if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
      errors.push('Unsupported image format. Please use JPEG, PNG, or WebP.');
    }

    // Check dimensions
    if ((metadata.width || 0) < 400 || (metadata.height || 0) < 400) {
      errors.push('Image is too small. Minimum dimensions are 400x400 pixels.');
    }

    // Check file size (assuming buffer size is representative)
    const sizeMB = buffer.length / (1024 * 1024);
    if (sizeMB > 10) {
      errors.push('Image file is too large. Maximum size is 10MB.');
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid image file or corrupted data.']
    };
  }
}

/**
 * Get image processing recommendations
 */
export function getImageRecommendations(metadata: sharp.Metadata): string[] {
  const recommendations: string[] = [];

  // Aspect ratio
  if (metadata.width !== metadata.height) {
    recommendations.push('Use a square (1:1) aspect ratio for best results');
  }

  // Resolution
  if ((metadata.width || 0) < 800 || (metadata.height || 0) < 800) {
    recommendations.push('Use images at least 800x800 pixels for optimal quality');
  }

  // File format
  if (metadata.format === 'png' && (metadata.channels || 0) < 4) {
    recommendations.push('Consider using JPEG format for photos without transparency');
  }

  // Color space
  if (metadata.space && metadata.space !== 'srgb') {
    recommendations.push('Use sRGB color space for consistent display across devices');
  }

  return recommendations;
}