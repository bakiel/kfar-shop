import { NextResponse } from 'next/server';
import { miniMaxReasoning } from '@/lib/services/minimax-reasoning-service';

// Model information helper
function getModelInfo(model: string) {
  const modelInfoMap: Record<string, any> = {
    'deepseek/deepseek-r1': {
      name: 'DeepSeek R1',
      contextWindow: '128K tokens',
      description: 'Latest reasoning model with advanced capabilities',
      tier: 'Premium'
    },
    'google/gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash',
      contextWindow: '2M tokens',
      description: 'Latest Gemini with massive context window',
      tier: 'Premium'
    },
    'google/gemini-2.0-flash-exp:free': {
      name: 'Gemini 2.0 Flash (Free)',
      contextWindow: '1M tokens',
      description: 'Free tier Gemini model',
      tier: 'Free'
    },
    'minimax/minimax-m1': {
      name: 'MiniMax M1',
      contextWindow: '1M tokens',
      description: 'Specialized for long context reasoning',
      tier: 'Premium'
    },
    'meta-llama/llama-3.1-70b-instruct': {
      name: 'Llama 3.1 70B',
      contextWindow: '128K tokens',
      description: 'Open source powerhouse',
      tier: 'Standard'
    },
    'anthropic/claude-3-haiku': {
      name: 'Claude 3 Haiku',
      contextWindow: '200K tokens',
      description: 'Fast Claude model for long context',
      tier: 'Standard'
    }
  };
  
  return modelInfoMap[model] || {
    name: model,
    contextWindow: 'Unknown',
    description: 'Model information not available',
    tier: 'Unknown'
  };
}

export async function POST(request: Request) {
  try {
    const { task, params } = await request.json();

    let result;
    
    switch (task) {
      case 'analyze-trends':
        result = await miniMaxReasoning.analyzeMarketplaceTrends(
          params.timeRange || 'monthly'
        );
        break;
        
      case 'vendor-strategy':
        if (!params.vendorId) {
          return NextResponse.json(
            { error: 'vendorId is required' },
            { status: 400 }
          );
        }
        result = await miniMaxReasoning.generateVendorStrategy(params.vendorId);
        break;
        
      case 'customer-journeys':
        result = await miniMaxReasoning.analyzeCustomerJourneys(params.customerId);
        break;
        
      case 'marketplace-report':
        result = await miniMaxReasoning.generateMarketplaceReport({
          includeFinancials: params.includeFinancials || true,
          includeCustomerFeedback: params.includeCustomerFeedback || true,
          includePredictions: params.includePredictions || true
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid task type' },
          { status: 400 }
        );
    }

    // Extract model information from the response
    const modelUsed = result?.model || 'unknown';
    const modelInfo = getModelInfo(modelUsed);
    
    return NextResponse.json({
      success: true,
      result,
      model: modelUsed,
      modelInfo,
      task
    });
    
  } catch (error) {
    console.error('MiniMax reasoning error:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isApiKeyError = errorMessage.includes('401') || errorMessage.includes('Unauthorized');
    const isModelError = errorMessage.includes('model') || errorMessage.includes('not found');
    
    return NextResponse.json(
      { 
        error: 'Failed to process reasoning task',
        details: errorMessage,
        suggestions: isApiKeyError 
          ? 'Please check your OpenRouter API key'
          : isModelError
          ? 'The MiniMax M1 model may not be available on your OpenRouter account'
          : 'Please check the console for more details'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'MiniMax M1 Reasoning Service',
    capabilities: [
      'Marketplace trend analysis',
      'Vendor strategy generation',
      'Customer journey analysis',
      'Comprehensive marketplace reports'
    ],
    model: {
      name: 'minimax/minimax-m1',
      contextWindow: '1M tokens',
      strengths: [
        'Complex reasoning tasks',
        'Large document analysis',
        'Pattern recognition',
        'Strategic planning',
        'Comprehensive reports'
      ]
    },
    endpoints: {
      'analyze-trends': {
        description: 'Analyze marketplace trends',
        params: { timeRange: 'monthly | quarterly | yearly' }
      },
      'vendor-strategy': {
        description: 'Generate vendor growth strategy',
        params: { vendorId: 'string (required)' }
      },
      'customer-journeys': {
        description: 'Analyze customer behavior patterns',
        params: { customerId: 'string (optional)' }
      },
      'marketplace-report': {
        description: 'Generate comprehensive marketplace report',
        params: {
          includeFinancials: 'boolean',
          includeCustomerFeedback: 'boolean',
          includePredictions: 'boolean'
        }
      }
    }
  });
}