// kfar-marketplace-app/app/api/ai-assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceAssistant } from '@/lib/adk/marketplace-assistant';

export async function POST(request: NextRequest) {
  try {
    const { query, language = 'en', userId, context } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Initialize assistant
    const assistant = new MarketplaceAssistant();
    
    // Process query
    const response = await assistant.processQuery({
      query,
      language,
      userId,
      context
    });
    
    // Log for analytics (in production, send to analytics service)
    console.log('AI Assistant Query:', {
      query,
      intent: response.metadata?.intent,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      ...response
    });
    
  } catch (error) {
    console.error('AI Assistant error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process query',
        response: 'I apologize, but I encountered an error. Please try again later.',
        metadata: {
          intent: 'error',
          confidence: 0,
          language: 'en'
        }
      },
      { status: 500 }
    );
  }
}