import { NextRequest, NextResponse } from 'next/server';

// Import the image generation service
const FAL_AI_API_KEY = process.env.FAL_AI_API_KEY;
const FAL_AI_BUDGET_LIMIT = parseFloat(process.env.FAL_AI_BUDGET_LIMIT || '20');

// Track usage in memory (in production, use database)
let totalSpent = 0;

const MODELS = {
  'flux-schnell': { cost: 0.003, endpoint: 'fal-ai/flux/schnell' },
  'flux-pro': { cost: 0.05, endpoint: 'fal-ai/flux-pro' },
  'imagen4': { cost: 0.10, endpoint: 'fal-ai/imagen-v4-preview' },
  'ideogram': { cost: 0.08, endpoint: 'fal-ai/ideogram-v3' },
  'recraft': { cost: 0.06, endpoint: 'fal-ai/recraft-v3' }
};

const STYLE_PROMPTS = {
  african: 'modern African aesthetic, kente patterns, vibrant colors, cultural authenticity',
  american: 'contemporary American style, clean modern design, professional appearance',
  middle_eastern: 'Middle Eastern inspired design, geometric patterns, warm colors',
  asian: 'Asian influenced aesthetics, minimalist elegant design, harmonious composition',
  european: 'European style design, sophisticated classic elements, refined appearance',
  latin: 'Latin American inspired, colorful vibrant design, festive authentic feel'
};

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, style = 'african', quality = 'standard' } = await request.json();

    // Check budget
    if (totalSpent >= FAL_AI_BUDGET_LIMIT) {
      return NextResponse.json(
        { error: 'Budget limit reached' },
        { status: 403 }
      );
    }

    // Select model based on quality
    let model = 'flux-schnell';
    if (quality === 'premium' && type === 'hero') {
      model = 'imagen4';
    } else if (type === 'logo') {
      model = 'ideogram';
    }

    const modelConfig = MODELS[model as keyof typeof MODELS];
    
    // Check if this would exceed budget
    if (totalSpent + modelConfig.cost > FAL_AI_BUDGET_LIMIT) {
      return NextResponse.json(
        { error: 'This request would exceed budget limit' },
        { status: 403 }
      );
    }

    // Enhance prompt with style
    const stylePrompt = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS] || '';
    const fullPrompt = `${prompt}, ${stylePrompt}, high quality, professional`;

    // Generate image using fal.ai
    const response = await fetch(`https://fal.run/${modelConfig.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: type === 'hero' ? { width: 1920, height: 1080 } : { width: 512, height: 512 },
        num_inference_steps: quality === 'premium' ? 50 : 25,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update spent amount
    totalSpent += modelConfig.cost;

    // Return the generated image URL
    return NextResponse.json({
      imageUrl: data.images[0].url,
      model: model,
      cost: modelConfig.cost,
      budgetRemaining: FAL_AI_BUDGET_LIMIT - totalSpent
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Fallback to existing image
    const fallbackImages = [
      '/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_01.jpg',
      '/images/backgrounds/1.jpg',
      '/images/backgrounds/2.jpg'
    ];
    
    return NextResponse.json({
      imageUrl: fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
      model: 'fallback',
      cost: 0,
      budgetRemaining: FAL_AI_BUDGET_LIMIT - totalSpent,
      error: 'Using fallback image'
    });
  }
}