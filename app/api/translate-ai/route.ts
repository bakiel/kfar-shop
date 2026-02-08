import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

interface TranslationRequest {
  text: string;
  targetLang: 'he' | 'en';
  context?: 'store_name' | 'product_name' | 'description' | 'general';
  sourceLang?: 'he' | 'en' | 'auto';
}

// Get the appropriate system prompt based on context
function getSystemPrompt(targetLang: string, context?: string): string {
  const langName = targetLang === 'he' ? 'Hebrew' : 'English';
  
  let contextInstructions = '';
  switch (context) {
    case 'store_name':
      contextInstructions = `This is a store/vendor name for an Israeli marketplace in the Village of Peace (Kfar Shalom) community in Dimona. 
Keep the translation concise and memorable. Maintain brand identity where possible.
If the name contains English words commonly used in Hebrew (like "organic", "natural"), you may keep them as-is.`;
      break;
    case 'product_name':
      contextInstructions = `This is a product name for items sold in an Israeli community marketplace.
Keep it clear and appealing while maintaining accuracy.
Don't over-translate technical terms that are commonly used in the target language.
For food items, ensure kosher/vegan/organic indicators are properly translated.`;
      break;
    case 'description':
      contextInstructions = `This is a product or store description for a community marketplace.
Preserve the meaning and tone while making it natural in the target language.
Maintain any cultural or religious references appropriately.`;
      break;
    default:
      contextInstructions = `Translate accurately while maintaining the original tone and meaning.
This is for a community marketplace in Israel.`;
  }

  return `You are a professional Hebrew-English translator specializing in e-commerce and community marketplace content.
${contextInstructions}

Rules:
1. Translate the text to ${langName}
2. Return ONLY the translated text - no explanations, quotes, or formatting
3. Preserve numbers, prices, and measurements as-is
4. Keep brand names unchanged unless they have an established translation
5. For Hebrew, use proper RTL text direction
6. Maintain the original tone (formal/casual)`;
}

// Try translation with multiple providers for reliability
async function tryTranslation(
  text: string,
  targetLang: string,
  context: string | undefined,
  provider: 'openai' | 'google' | 'anthropic'
): Promise<string | null> {
  try {
    const systemPrompt = getSystemPrompt(targetLang, context);
    
    let model;
    switch (provider) {
      case 'openai':
        // Use GPT-3.5 for cost efficiency
        if (!process.env.OPENAI_API_KEY) return null;
        model = openai('gpt-3.5-turbo');
        break;
      case 'google':
        // Use Gemini Flash for free tier
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;
        model = google('gemini-1.5-flash');
        break;
      case 'anthropic':
        // Use Claude Haiku for cost efficiency
        if (!process.env.ANTHROPIC_API_KEY) return null;
        model = anthropic('claude-3-haiku-20240307');
        break;
      default:
        return null;
    }

    const { text: translatedText } = await generateText({
      model,
      system: systemPrompt,
      prompt: text,
      temperature: 0.3, // Low temperature for consistent translations
      maxTokens: 500,
    });

    return translatedText.trim();
  } catch (error) {
    console.error(`Translation failed with ${provider}:`, error);
    return null;
  }
}

// Fallback mock translation for testing (Hebrew ↔ English)
function mockTranslation(text: string, targetLang: string): string {
  // Simple mock translations for common terms
  const translations: Record<string, Record<string, string>> = {
    en: {
      // Hebrew to English
      'שלום': 'Hello',
      'תודה': 'Thank you',
      'מוצר': 'Product',
      'חנות': 'Store',
      'אורגני': 'Organic',
      'טבעוני': 'Vegan',
      'כשר': 'Kosher',
      'מחיר': 'Price',
      'תיאור': 'Description',
      'הוסף לעגלה': 'Add to Cart',
    },
    he: {
      // English to Hebrew
      'Hello': 'שלום',
      'Thank you': 'תודה',
      'Product': 'מוצר',
      'Store': 'חנות',
      'Organic': 'אורגני',
      'Vegan': 'טבעוני',
      'Kosher': 'כשר',
      'Price': 'מחיר',
      'Description': 'תיאור',
      'Add to Cart': 'הוסף לעגלה',
      'Welcome': 'ברוכים הבאים',
      'Marketplace': 'שוק',
      'Village of Peace': 'כפר שלום',
    }
  };

  // Check for exact match
  if (translations[targetLang]?.[text]) {
    return translations[targetLang][text];
  }

  // For testing, just add [HE] or [EN] prefix to indicate translation
  if (targetLang === 'he') {
    return `[עברית] ${text}`;
  } else {
    return `[English] ${text}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { text, targetLang, context, sourceLang } = body;

    // Validate input
    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields: text and targetLang' },
        { status: 400 }
      );
    }

    if (targetLang !== 'he' && targetLang !== 'en') {
      return NextResponse.json(
        { error: 'Invalid targetLang. Must be "he" or "en"' },
        { status: 400 }
      );
    }

    // Skip translation if source and target are the same
    if (sourceLang && sourceLang === targetLang) {
      return NextResponse.json({
        translatedText: text,
        originalText: text,
        targetLang,
        context,
        provider: 'none',
        cached: true
      });
    }

    let translatedText = null;
    let provider = 'none';

    // Try providers in order of preference/cost
    // 1. Try Google (Gemini) first - has free tier
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      translatedText = await tryTranslation(text, targetLang, context, 'google');
      if (translatedText) provider = 'google';
    }

    // 2. Try OpenAI if Google fails
    if (!translatedText && process.env.OPENAI_API_KEY) {
      translatedText = await tryTranslation(text, targetLang, context, 'openai');
      if (translatedText) provider = 'openai';
    }

    // 3. Try Anthropic if others fail
    if (!translatedText && process.env.ANTHROPIC_API_KEY) {
      translatedText = await tryTranslation(text, targetLang, context, 'anthropic');
      if (translatedText) provider = 'anthropic';
    }

    // 4. Fallback to existing OpenRouter/DeepSeek endpoint
    if (!translatedText) {
      try {
        const fallbackResponse = await fetch('http://localhost:3000/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang, context })
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          translatedText = fallbackData.translatedText;
          provider = fallbackData.provider || 'openrouter';
        }
      } catch (e) {
        console.error('Fallback translation failed:', e);
      }
    }

    // 5. Last resort: mock translation for testing
    if (!translatedText) {
      console.warn('All translation providers failed, using mock translation');
      translatedText = mockTranslation(text, targetLang);
      provider = 'mock';
    }

    return NextResponse.json({
      translatedText,
      originalText: text,
      targetLang,
      sourceLang: sourceLang || 'auto',
      context,
      provider
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check available providers
export async function GET() {
  const providers = {
    google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
  };

  const available = Object.entries(providers)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  return NextResponse.json({
    providers,
    available,
    preferred: available[0] || 'mock',
    status: available.length > 0 ? 'ready' : 'no_providers_configured'
  });
}