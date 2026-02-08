/**
 * AI Provider Configuration
 * Centralized configuration for all AI services
 */

export const AI_PROVIDERS = {
  // OpenRouter - Primary vision and chat provider
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      // Primary models
      vision: 'google/gemini-2.0-flash-exp:free',
      chat: 'google/gemini-2.0-flash-exp:free',
      translation: 'google/gemini-2.0-flash-exp:free',
      
      // Advanced reasoning models (in order of preference)
      reasoning: {
        primary: 'deepseek/deepseek-r1',  // DeepSeek R1 - Latest reasoning model
        fallback1: 'google/gemini-2.5-flash',  // Gemini 2.5 Flash - Latest
        fallback2: 'google/gemini-2.0-flash-exp:free',  // Free tier fallback
        fallback3: 'meta-llama/llama-3.1-70b-instruct'  // Alternative strong model
      },
      
      // Long context models (in order of preference)
      longContext: {
        primary: 'minimax/minimax-m1',  // 1M context window
        fallback1: 'google/gemini-2.5-flash',  // Gemini 2.5 with good context
        fallback2: 'anthropic/claude-3-haiku',  // Claude for long context
        fallback3: 'google/gemini-2.0-flash-exp:free'  // Free tier fallback
      }
    }
  },

  // DeepSeek - Alternative text generation
  deepSeek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    models: {
      chat: 'deepseek-chat',
      coder: 'deepseek-coder'
    }
  },

  // OpenWriter - Future integration
  openWriter: {
    apiKey: process.env.OPENWRITER_API_KEY || '',
    baseUrl: 'https://api.openwriter.ai/v1/completions',
    models: {
      default: 'openwriter-default'
    }
  },

  // ElevenLabs - Voice synthesis
  elevenLabs: {
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
    baseUrl: 'https://api.elevenlabs.io/v1',
    voices: {
      kfar: 'TxGEqnHWrfWFTfGW9XjX',
      hebrew: 'pNInz6obpgDQGcFmaJgB'
    }
  }
} as const;

/**
 * Get API configuration for a specific provider
 */
export function getAIProvider(provider: keyof typeof AI_PROVIDERS) {
  const config = AI_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
  return config;
}

/**
 * Check if a provider is configured
 */
export function isProviderConfigured(provider: keyof typeof AI_PROVIDERS): boolean {
  const config = AI_PROVIDERS[provider];
  return !!(config && config.apiKey);
}

/**
 * Get the best available provider for a specific task
 */
export function getBestProvider(task: 'vision' | 'translation' | 'chat' | 'voice' | 'reasoning' | 'longContext'): keyof typeof AI_PROVIDERS {
  switch (task) {
    case 'vision':
      return 'openRouter'; // Gemini Flash for vision
    case 'translation':
      return isProviderConfigured('deepSeek') ? 'deepSeek' : 'openRouter';
    case 'chat':
      return isProviderConfigured('deepSeek') ? 'deepSeek' : 'openRouter';
    case 'voice':
      return 'elevenLabs';
    case 'reasoning':
    case 'longContext':
      return 'openRouter'; // MiniMax M1 for complex tasks
    default:
      return 'openRouter';
  }
}

/**
 * Provider capabilities
 */
export const PROVIDER_CAPABILITIES = {
  openRouter: ['vision', 'chat', 'translation', 'embeddings'],
  deepSeek: ['chat', 'translation', 'code-generation'],
  openWriter: ['content-generation', 'copywriting'],
  elevenLabs: ['text-to-speech', 'voice-cloning']
} as const;