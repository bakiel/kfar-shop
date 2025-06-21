import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekService } from '@/lib/services/deepseek-service';
import { getAIProvider } from '@/lib/config/ai-providers';

const openRouterConfig = getAIProvider('openRouter');
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface TranslationRequest {
  text: string;
  targetLang: 'he' | 'en';
  context?: 'store_name' | 'product_name' | 'description';
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getSystemPrompt(targetLang: string, context?: string): string {
  const langName = targetLang === 'he' ? 'Hebrew' : 'English';
  
  let contextInstructions = '';
  switch (context) {
    case 'store_name':
      contextInstructions = `This is a store/vendor name. Keep the translation concise and memorable. Maintain brand identity where possible.`;
      break;
    case 'product_name':
      contextInstructions = `This is a product name. Keep it clear and appealing while maintaining accuracy. Don't over-translate technical terms that are commonly used in the target language.`;
      break;
    case 'description':
      contextInstructions = `This is a product or store description. Preserve the meaning and tone while making it natural in the target language.`;
      break;
    default:
      contextInstructions = `Translate accurately while maintaining the original tone and meaning.`;
  }

  return `You are a professional translator specializing in ${langName} translations for an online marketplace. 
${contextInstructions}
Translate the following text to ${langName}. Return ONLY the translated text without any explanations or additional formatting.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { text, targetLang, context } = body;

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

    // Try DeepSeek first for better translation quality
    const deepSeekTranslation = await DeepSeekService.translate(text, targetLang, context);
    
    if (deepSeekTranslation) {
      return NextResponse.json({
        translatedText: deepSeekTranslation,
        originalText: text,
        targetLang,
        context,
        provider: 'deepseek'
      });
    }

    // Fallback to OpenRouter if DeepSeek fails

    // Prepare messages for OpenRouter
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: getSystemPrompt(targetLang, context)
      },
      {
        role: 'user',
        content: text
      }
    ];

    // Make request to OpenRouter
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterConfig.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kfar-marketplace.com',
        'X-Title': 'KFAR Marketplace Translation'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5-8b', // Free Gemini Flash model
        messages,
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 500,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { 
          error: 'Translation service error', 
          details: errorData.error || 'Unknown error' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: 'No translation received from service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText,
      originalText: text,
      targetLang,
      context
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

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}