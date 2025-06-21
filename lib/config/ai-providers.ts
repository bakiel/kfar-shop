/**
 * AI Provider Configuration
 * Centralized configuration for all AI services
 */

export const AI_PROVIDERS = {
  // OpenRouter - Primary vision and chat provider
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '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',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      vision: 'google/gemini-2.0-flash-exp:free',
      chat: 'google/gemini-2.0-flash-exp:free',
      translation: 'google/gemini-2.0-flash-exp:free'
    }
  },

  // DeepSeek - Alternative text generation
  deepSeek: {
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-0a29625742c94132a5df711c5ac65f15',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    models: {
      chat: 'deepseek-chat',
      coder: 'deepseek-coder'
    }
  },

  // OpenWriter - Future integration
  openWriter: {
    apiKey: process.env.OPENWRITER_API_KEY || 'sk-0a29625742c94132a5df711c5ac65f15',
    baseUrl: 'https://api.openwriter.ai/v1/completions',
    models: {
      default: 'openwriter-default'
    }
  },

  // ElevenLabs - Voice synthesis
  elevenLabs: {
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 'sk_62cbaf98a9ac9ee38ae4d0f7cd0c933ad0147cdbe017b173',
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
export function getBestProvider(task: 'vision' | 'translation' | 'chat' | 'voice'): keyof typeof AI_PROVIDERS {
  switch (task) {
    case 'vision':
      return 'openRouter'; // Gemini Flash for vision
    case 'translation':
      return isProviderConfigured('deepSeek') ? 'deepSeek' : 'openRouter';
    case 'chat':
      return isProviderConfigured('deepSeek') ? 'deepSeek' : 'openRouter';
    case 'voice':
      return 'elevenLabs';
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