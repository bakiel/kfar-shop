import { ElevenLabsApi, ElevenLabsConfig } from '@elevenlabs/elevenlabs-js';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: 'mp3_44100_128' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000';
  optimize_streaming_latency?: number;
}

export interface ConversationalAIRequest {
  text: string;
  voice_id?: string;
  conversation_id?: string;
  system_prompt?: string;
  temperature?: number;
}

class ElevenLabsV3Service {
  private client: ElevenLabsApi;
  private apiKey: string;
  
  // Voice IDs for different personas
  public readonly voices = {
    daniella: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DANIELLA || 'EXAVITQu4vr4xnSDxMaL',
    yaakov: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YAAKOV || 'ZMK5OD2jmsdse3EKE4W5',
    // ElevenLabs v3 new voices
    sarah: '21m00Tcm4TlvDq8ikWAM', // Professional female
    adam: 'pNInz6obpgDQGcFmaJgB', // Professional male
    jessica: 'cgSgspJ2msm6clMCkdW9', // Friendly female
  };

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    const config: ElevenLabsConfig = {
      apiKey: this.apiKey,
    };

    this.client = new ElevenLabsApi(config);
  }

  /**
   * ElevenLabs v3 Text-to-Speech with enhanced options
   */
  async textToSpeech(request: TTSRequest): Promise<ArrayBuffer> {
    try {
      const {
        text,
        voice_id = this.voices.daniella,
        model_id = 'eleven_multilingual_v2',
        voice_settings = {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        output_format = 'mp3_44100_128',
        optimize_streaming_latency = 0
      } = request;

      console.log('🎤 ElevenLabs v3 TTS Request:', { text: text.substring(0, 100), voice_id, model_id });

      const audio = await this.client.textToSpeech.textToSpeech(voice_id, {
        text,
        model_id,
        voice_settings,
        output_format,
        optimize_streaming_latency
      });

      return audio;
    } catch (error) {
      console.error('❌ ElevenLabs TTS Error:', error);
      throw error;
    }
  }

  /**
   * ElevenLabs v3 Conversational AI (BETA)
   */
  async conversationalAI(request: ConversationalAIRequest): Promise<ReadableStream> {
    try {
      const {
        text,
        voice_id = this.voices.daniella,
        conversation_id,
        system_prompt = this.getKfarSystemPrompt(),
        temperature = 0.7
      } = request;

      console.log('🤖 ElevenLabs v3 Conversational AI Request:', { text, voice_id, conversation_id });

      // Note: This is a beta feature - adjust based on latest API
      const response = await this.client.conversationalAi.conversationalAi({
        text,
        voice_id,
        conversation_id,
        system_prompt,
        temperature
      });

      return response;
    } catch (error) {
      console.error('❌ ElevenLabs Conversational AI Error:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    try {
      const voices = await this.client.voices.getVoices();
      return voices.voices || [];
    } catch (error) {
      console.error('❌ Error fetching voices:', error);
      return [];
    }
  }

  /**
   * Stream text-to-speech for real-time playback
   */
  async streamTextToSpeech(request: TTSRequest): Promise<ReadableStream> {
    try {
      const {
        text,
        voice_id = this.voices.daniella,
        model_id = 'eleven_multilingual_v2',
        voice_settings = {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        output_format = 'mp3_44100_128',
        optimize_streaming_latency = 4
      } = request;

      console.log('🌊 ElevenLabs v3 Streaming TTS:', { text: text.substring(0, 100), voice_id });

      const stream = await this.client.textToSpeech.textToSpeechStream(voice_id, {
        text,
        model_id,
        voice_settings,
        output_format,
        optimize_streaming_latency
      });

      return stream;
    } catch (error) {
      console.error('❌ ElevenLabs Streaming TTS Error:', error);
      throw error;
    }
  }

  /**
   * KFAR Marketplace specific system prompt
   */
  private getKfarSystemPrompt(): string {
    return `You are a helpful AI assistant for KFAR Marketplace, representing the Village of Peace community in Dimona, Israel. 

PERSONALITY & TONE:
- Warm, friendly, and knowledgeable about vegan lifestyle
- Passionate about sustainable living and community values
- Professional but approachable
- Speak with wisdom from 50+ years of community experience

KNOWLEDGE BASE:
- Village of Peace established in 1967 by Ben Ammi Ben-Israel
- 100% vegan community for over 50 years
- Specializes in plant-based foods, natural products, and holistic living
- 6 active vendors: Teva Deli, Garden of Light, Queen's Cuisine, Gahn Delight, VOP Shop, People Store
- All products are vegan, many are kosher, organic, and locally made

CAPABILITIES:
- Help users find products and navigate the marketplace
- Provide information about vendors and their specialties
- Answer questions about vegan lifestyle and nutrition
- Assist with orders, shipping, and customer service
- Share knowledge about the Village of Peace community and values

Keep responses conversational, helpful, and under 150 words unless detailed information is specifically requested.`;
  }

  /**
   * Get optimized voice settings for different scenarios
   */
  getVoiceSettings(scenario: 'conversation' | 'announcement' | 'storytelling' | 'customer_service'): VoiceSettings {
    const settings = {
      conversation: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      },
      announcement: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      },
      storytelling: {
        stability: 0.3,
        similarity_boost: 0.7,
        style: 0.4,
        use_speaker_boost: true
      },
      customer_service: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.1,
        use_speaker_boost: true
      }
    };

    return settings[scenario];
  }
}

// Singleton instance
export const elevenLabsV3 = new ElevenLabsV3Service();
export default elevenLabsV3;
