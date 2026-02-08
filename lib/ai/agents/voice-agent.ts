/**
 * Voice Agent for KFAR AI Shopping Assistant
 * Handles Text-to-Speech using Gemini 2.5 Flash TTS
 * Supports Hebrew and English with African American voice characteristics
 *
 * API Documentation: https://ai.google.dev/api/generate-content
 * Voice Names: Charon (deep/warm), Kore (expressive), Puck (neutral), Aoede (friendly)
 */

import {
  getVoiceConfig,
  BROWSER_TTS_CONFIG,
  GEMINI_TTS_CONFIG,
  VoiceEmotion,
  VoiceConfig,
} from '../config/voice-config';

export interface TTSRequest {
  text: string;
  language: 'en' | 'he';
  emotion?: VoiceEmotion;
  useSSML?: boolean;
}

export interface TTSResponse {
  audioBase64?: string;
  audioUrl?: string;
  mimeType?: string;
  duration?: number;
  error?: string;
  fallbackToBrowser?: boolean;
}

export class VoiceAgent {
  private apiKey: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.apiKey = process.env.GEMINI_API_KEY || null;

    if (this.apiKey) {
      this.isInitialized = true;
      console.log('VoiceAgent: Gemini 2.5 Flash TTS initialized');
    } else {
      console.warn('VoiceAgent: No Gemini API key, will use browser TTS fallback');
      this.isInitialized = false;
    }
  }

  /**
   * Convert text to speech using Gemini 2.5 Flash TTS
   * Returns base64 encoded PCM audio at 24kHz, mono, 16-bit
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const { text, language, emotion = 'helpful' } = request;

    if (!text || text.trim().length === 0) {
      return { error: 'No text provided' };
    }

    // If Gemini not available, signal browser fallback
    if (!this.apiKey || !this.isInitialized) {
      return {
        fallbackToBrowser: true,
        error: 'Gemini TTS not available, use browser speech synthesis',
      };
    }

    try {
      // Get voice configuration for the language
      const voiceConfig = getVoiceConfig(language);

      // Prepare the text with emotion context
      const emotionPrefix = this.getEmotionPrefix(emotion, language);
      const processedText = `${emotionPrefix}${text}`;

      // Log for debugging
      console.log('VoiceAgent: Using voice:', voiceConfig.voiceName, 'for', language);
      console.log('VoiceAgent: Text length:', processedText.length);

      // Build the request body for Gemini 2.5 Flash TTS
      // API: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent
      // The TTS model needs a clear instruction to read aloud, not generate text
      const ttsInstruction = language === 'he'
        ? `קרא בקול רם את הטקסט הבא: ${processedText}`
        : `Read the following text aloud: ${processedText}`;
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: ttsInstruction,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceConfig.voiceName,
              },
            },
          },
        },
      };

      // Make the API call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_CONFIG.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('VoiceAgent: Gemini API error:', response.status, errorData);

        // Fall back to browser TTS
        return {
          fallbackToBrowser: true,
          error: `Gemini TTS API error: ${response.status}`,
        };
      }

      const data = await response.json();

      // Extract audio from response
      // Response structure: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].inlineData
      ) {
        const inlineData = data.candidates[0].content.parts[0].inlineData;

        console.log('VoiceAgent: TTS success, mime:', inlineData.mimeType);

        return {
          audioBase64: inlineData.data,
          mimeType: inlineData.mimeType || 'audio/L16;rate=24000',
        };
      }

      // No audio in response
      console.error('VoiceAgent: No audio in Gemini response', data);
      return {
        fallbackToBrowser: true,
        error: 'No audio in Gemini TTS response',
      };

    } catch (error) {
      console.error('VoiceAgent TTS error:', error);
      return {
        fallbackToBrowser: true,
        error: `TTS error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get emotion prefix for more natural speech
   * Adds contextual phrases that help the voice sound more natural
   */
  private getEmotionPrefix(emotion: VoiceEmotion, language: 'en' | 'he'): string {
    const prefixes: Record<VoiceEmotion, Record<'en' | 'he', string>> = {
      neutral: { en: '', he: '' },
      excited: {
        en: 'Great news! ',
        he: 'חדשות מעולות! ',
      },
      helpful: {
        en: '', // Keep helpful neutral for natural flow
        he: '',
      },
      apologetic: {
        en: "I'm sorry, ",
        he: 'מצטער, ',
      },
    };

    return prefixes[emotion]?.[language] || '';
  }

  /**
   * Get browser TTS configuration for fallback
   */
  getBrowserTTSConfig(language: 'en' | 'he'): typeof BROWSER_TTS_CONFIG['en'] {
    return BROWSER_TTS_CONFIG[language];
  }

  /**
   * Get current voice configuration
   */
  getVoiceConfig(language: 'en' | 'he'): VoiceConfig {
    return getVoiceConfig(language);
  }

  /**
   * Check if Gemini TTS is available
   */
  isGeminiAvailable(): boolean {
    return this.isInitialized && this.apiKey !== null;
  }

  /**
   * Convert PCM audio to WAV format for playback
   * Gemini returns raw PCM at 24kHz, mono, 16-bit
   */
  convertPCMtoWAV(pcmBase64: string): string {
    // Decode base64 to binary
    const pcmData = Buffer.from(pcmBase64, 'base64');

    // WAV header parameters
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = pcmData.length;
    const headerSize = 44;
    const fileSize = headerSize + dataSize - 8;

    // Create WAV header
    const header = Buffer.alloc(headerSize);

    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize, 4);
    header.write('WAVE', 8);

    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    // Combine header and PCM data
    const wavData = Buffer.concat([header, pcmData]);

    return wavData.toString('base64');
  }
}

// Singleton instance
export const voiceAgent = new VoiceAgent();
