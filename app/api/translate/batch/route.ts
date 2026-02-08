import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekService } from '@/lib/services/deepseek-service';
import { getAIProvider } from '@/lib/config/ai-providers';

const openRouterConfig = getAIProvider('openRouter');

interface BatchTranslationRequest {
  translations: Array<{
    id: string;
    text: string;
    context?: 'store_name' | 'product_name' | 'description' | 'feature' | 'tag';
  }>;
  targetLang: 'he' | 'en';
}

interface TranslationResult {
  id: string;
  originalText: string;
  translatedText: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchTranslationRequest = await request.json();
    const { translations, targetLang } = body;

    // Validate input
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { error: 'Translations array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (targetLang !== 'he' && targetLang !== 'en') {
      return NextResponse.json(
        { error: 'Invalid targetLang. Must be "he" or "en"' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (translations.length > 50) {
      return NextResponse.json(
        { error: 'Batch size limited to 50 translations' },
        { status: 400 }
      );
    }

    // Process translations in parallel for better performance
    const translationPromises = translations.map(async (item): Promise<TranslationResult> => {
      try {
        // Skip empty texts
        if (!item.text || item.text.trim() === '') {
          return {
            id: item.id,
            originalText: item.text,
            translatedText: '',
            success: true
          };
        }

        // Try DeepSeek first
        const deepSeekTranslation = await DeepSeekService.translate(
          item.text,
          targetLang,
          item.context
        );

        if (deepSeekTranslation) {
          return {
            id: item.id,
            originalText: item.text,
            translatedText: deepSeekTranslation,
            success: true
          };
        }

        // Fallback to OpenRouter
        const prompt = createTranslationPrompt(item.text, targetLang, item.context);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterConfig.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kfar-marketplace.com',
            'X-Title': 'KFAR Batch Translation'
          },
          body: JSON.stringify({
            model: 'google/gemini-flash-1.5-8b',
            messages: [
              {
                role: 'system',
                content: 'You are a professional Hebrew-English translator for a vegan marketplace. Translate accurately and naturally.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 200
          })
        });

        if (response.ok) {
          const data = await response.json();
          const translatedText = data.choices?.[0]?.message?.content?.trim() || '';
          
          return {
            id: item.id,
            originalText: item.text,
            translatedText,
            success: true
          };
        }

        throw new Error('Translation service unavailable');

      } catch (error) {
        console.error(`Translation error for item ${item.id}:`, error);
        
        // Use fallback dictionary for common terms
        const fallbackTranslation = getFallbackTranslation(item.text, targetLang);
        
        return {
          id: item.id,
          originalText: item.text,
          translatedText: fallbackTranslation || item.text,
          success: false,
          error: error instanceof Error ? error.message : 'Translation failed'
        };
      }
    });

    // Wait for all translations to complete
    const results = await Promise.all(translationPromises);

    // Calculate success rate
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        successRate: successRate.toFixed(1)
      },
      targetLang
    });

  } catch (error) {
    console.error('Batch translation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createTranslationPrompt(text: string, targetLang: string, context?: string): string {
  const langName = targetLang === 'he' ? 'Hebrew' : 'English';
  
  let contextInfo = '';
  switch (context) {
    case 'store_name':
      contextInfo = ' (store name - keep concise)';
      break;
    case 'product_name':
      contextInfo = ' (product name - keep clear and appealing)';
      break;
    case 'description':
      contextInfo = ' (description - natural and engaging)';
      break;
    case 'feature':
      contextInfo = ' (product feature - brief and clear)';
      break;
    case 'tag':
      contextInfo = ' (search tag - one or two words)';
      break;
  }
  
  return `Translate to ${langName}${contextInfo}: "${text}"`;
}

function getFallbackTranslation(text: string, targetLang: 'he' | 'en'): string {
  // Common marketplace terms fallback dictionary
  const dictionary: Record<string, Record<string, string>> = {
    he: {
      // Store types
      'store': 'חנות',
      'shop': 'חנות',
      'marketplace': 'שוק',
      'vendor': 'ספק',
      
      // Product categories
      'food': 'מזון',
      'beverage': 'משקה',
      'organic': 'אורגני',
      'vegan': 'טבעוני',
      'fresh': 'טרי',
      'natural': 'טבעי',
      'homemade': 'תוצרת בית',
      'healthy': 'בריא',
      
      // Common descriptions
      'delicious': 'טעים',
      'nutritious': 'מזין',
      'gluten free': 'ללא גלוטן',
      'sugar free': 'ללא סוכר',
      'kosher': 'כשר',
      'local': 'מקומי',
      
      // Actions
      'add to cart': 'הוסף לסל',
      'buy now': 'קנה עכשיו',
      'in stock': 'במלאי',
      'out of stock': 'אזל המלאי'
    },
    en: {
      // Hebrew to English
      'חנות': 'store',
      'שוק': 'marketplace',
      'ספק': 'vendor',
      'מזון': 'food',
      'משקה': 'beverage',
      'אורגני': 'organic',
      'טבעוני': 'vegan',
      'טרי': 'fresh',
      'טבעי': 'natural',
      'תוצרת בית': 'homemade',
      'בריא': 'healthy',
      'טעים': 'delicious',
      'מזין': 'nutritious',
      'ללא גלוטן': 'gluten free',
      'ללא סוכר': 'sugar free',
      'כשר': 'kosher',
      'מקומי': 'local'
    }
  };
  
  const textLower = text.toLowerCase();
  const targetDict = dictionary[targetLang] || {};
  
  // Try exact match first
  if (targetDict[textLower]) {
    return targetDict[textLower];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(targetDict)) {
    if (textLower.includes(key) || key.includes(textLower)) {
      return value;
    }
  }
  
  // Return original text if no translation found
  return text;
}