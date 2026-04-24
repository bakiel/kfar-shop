/**
 * Voice Configuration for KFAR AI Shopping Assistant
 * Gemini 2.5 Flash TTS with Hebrew/English support
 */

// Gemini TTS Voice options
// Using Charon for African American male voice characteristics
// Reference: https://ai.google.dev/api/generate-content#voice_config

export interface VoiceConfig {
  provider: 'gemini' | 'browser';
  voiceName: string;
  language: 'en' | 'he';
  speakingRate: number;
  pitch: number;
}

// Voice presets for different languages
// Gemini multi-speaker voices available:
// - Charon, Kore, Fenrir, Aoede, Puck, etc.
// Charon has a deeper, warmer tone that works well for African American voice characteristics

export const VOICE_PRESETS: Record<string, VoiceConfig> = {
  // English - African American style (deep, warm, expressive)
  en_default: {
    provider: 'gemini',
    voiceName: 'Charon', // Deep, warm male voice
    language: 'en',
    speakingRate: 1.0,
    pitch: 0,
  },

  // Hebrew - Using Kore for Hebrew (female voice with warmth)
  // Or Puck for a more neutral Hebrew voice
  he_default: {
    provider: 'gemini',
    voiceName: 'Puck', // Works well with Hebrew
    language: 'he',
    speakingRate: 0.95, // Slightly slower for Hebrew clarity
    pitch: 0,
  },

  // Alternative voices
  en_warm: {
    provider: 'gemini',
    voiceName: 'Aoede', // Warm, friendly female
    language: 'en',
    speakingRate: 1.0,
    pitch: 0,
  },

  he_expressive: {
    provider: 'gemini',
    voiceName: 'Kore', // Expressive female
    language: 'he',
    speakingRate: 1.0,
    pitch: 0,
  },
};

// Get voice config for language
export function getVoiceConfig(language: 'en' | 'he'): VoiceConfig {
  return language === 'he' ? VOICE_PRESETS.he_default : VOICE_PRESETS.en_default;
}

// Gemini TTS model configuration
export const GEMINI_TTS_CONFIG = {
  model: 'gemini-2.5-flash-preview-tts',
  audioConfig: {
    audioEncoding: 'LINEAR16' as const, // 16-bit PCM
    sampleRateHertz: 24000,
  },
};

// Browser fallback configuration (Web Speech API)
export const BROWSER_TTS_CONFIG = {
  en: {
    lang: 'en-US',
    rate: 1.0,
    pitch: 0.9, // Slightly lower for warmth
  },
  he: {
    lang: 'he-IL',
    rate: 0.95,
    pitch: 1.0,
  },
};

// Emotion modifiers for voice
export type VoiceEmotion = 'neutral' | 'excited' | 'helpful' | 'apologetic';

export const EMOTION_SSML: Record<VoiceEmotion, { prefix: string; suffix: string }> = {
  neutral: { prefix: '', suffix: '' },
  excited: { prefix: '<emphasis level="strong">', suffix: '</emphasis>' },
  helpful: { prefix: '<prosody rate="95%" pitch="+5%">', suffix: '</prosody>' },
  apologetic: { prefix: '<prosody rate="90%" pitch="-5%">', suffix: '</prosody>' },
};
