/**
 * Chat API Endpoint for KFAR AI Shopping Assistant
 * POST /api/ai/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { shoppingOrchestrator } from '@/lib/ai/orchestrator/shopping-brain';
import type { UserInput, ConversationMessage } from '@/lib/ai/events/shopping-events';
import type { CartItem } from '@/lib/ai/agents/cart-agent';

// Request body type
interface ChatRequest {
  message: string;
  language?: 'en' | 'he';
  isVoice?: boolean;
  sessionId?: string;
  conversationHistory?: ConversationMessage[];
  cart?: CartItem[];
}

// Response type
interface ChatResponse {
  success: boolean;
  response?: {
    text: string;
    textHe?: string;
    products?: unknown[];
    cartSummary?: {
      items: unknown[];
      totalItems: number;
      subtotal: number;
      currency: string;
    };
    suggestions?: string[];
    intent: string;
    audio?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Trim and validate message length
    const message = body.message.trim();
    if (message.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message cannot be empty',
        },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is too long (max 1000 characters)',
        },
        { status: 400 }
      );
    }

    // Build user input
    const userInput: UserInput = {
      message,
      language: body.language || 'en',
      isVoice: body.isVoice || false,
      sessionId: body.sessionId,
      conversationHistory: body.conversationHistory,
    };

    // Get cart from request (or empty array)
    const cart: CartItem[] = body.cart || [];

    // Process message through orchestrator
    const assistantResponse = await shoppingOrchestrator.processMessage(userInput, cart);

    // Return successful response
    return NextResponse.json({
      success: true,
      response: {
        text: assistantResponse.text,
        textHe: assistantResponse.textHe,
        products: assistantResponse.products,
        cartSummary: assistantResponse.cartSummary,
        suggestions: assistantResponse.suggestions,
        intent: assistantResponse.intent,
        audio: assistantResponse.audio,
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'KFAR AI Shopping Assistant',
    version: '1.0.0',
    features: [
      'semantic_search',
      'cart_management',
      'multilingual',
      'function_calling',
    ],
  });
}
