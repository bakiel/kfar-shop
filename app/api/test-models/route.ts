import { NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/adk/openrouter-client';
import { AI_PROVIDERS } from '@/lib/config/ai-providers';

export async function GET() {
  try {
    // Test a simple query with reasoning use case
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant. Keep your response very brief.'
      },
      {
        role: 'user' as const,
        content: 'Say hello and tell me which AI model you are.'
      }
    ];

    const result = await openRouterClient.generateResponse(messages, {
      useCase: 'reasoning',
      max_tokens: 100
    });

    // Extract model info
    const modelUsed = result?.model || 'unknown';
    const reasoningModels = AI_PROVIDERS.openRouter.models.reasoning;
    
    return NextResponse.json({
      success: true,
      modelUsed,
      response: result?.choices?.[0]?.message?.content || 'No response',
      configuredModels: {
        reasoning: reasoningModels,
        longContext: AI_PROVIDERS.openRouter.models.longContext
      },
      note: 'The system automatically tries models in order until one succeeds'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      configuredModels: {
        reasoning: AI_PROVIDERS.openRouter.models.reasoning,
        longContext: AI_PROVIDERS.openRouter.models.longContext
      }
    }, { status: 500 });
  }
}