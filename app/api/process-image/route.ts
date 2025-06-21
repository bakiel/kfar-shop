import { NextRequest, NextResponse } from 'next/server';
import { processImage, base64ToBuffer, bufferToBase64, validateImage } from '@/lib/utils/image-processor';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

interface ProcessImageRequest {
  image: string; // base64 encoded image
  options?: {
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    maxSizeKB?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessImageRequest = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const imageBuffer = base64ToBuffer(body.image);

    // Validate image
    const validation = await validateImage(imageBuffer);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid image',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Process image with provided options
    const result = await processImage(imageBuffer, {
      format: body.options?.format || 'jpeg',
      quality: body.options?.quality || 90,
      maxSizeKB: body.options?.maxSizeKB || 500,
      targetWidth: 800,
      targetHeight: 800
    });

    // Convert processed image back to base64
    const processedBase64 = bufferToBase64(
      result.buffer,
      `image/${result.format}`
    );

    // Get recommendations based on original metadata
    const recommendations = validation.metadata ? 
      getImageRecommendations(validation.metadata) : [];

    return NextResponse.json({
      image: processedBase64,
      metadata: {
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.size,
        sizeKB: Math.round(result.size / 1024),
        quality: result.quality
      },
      warnings: result.warnings,
      recommendations,
      success: true
    });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get recommendations
function getImageRecommendations(metadata: any): string[] {
  const recommendations: string[] = [];

  if (metadata.width !== metadata.height) {
    recommendations.push('Use a square (1:1) aspect ratio for best results');
  }

  if (metadata.width < 800 || metadata.height < 800) {
    recommendations.push('Use images at least 800x800 pixels for optimal quality');
  }

  if (metadata.format === 'png' && metadata.channels < 4) {
    recommendations.push('Consider using JPEG format for photos without transparency');
  }

  return recommendations;
}