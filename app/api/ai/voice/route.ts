/**
 * Voice API Endpoint for KFAR AI Shopping Assistant
 * POST /api/ai/voice - Text-to-Speech conversion
 * GET /api/ai/voice - Voice configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { voiceAgent } from '@/lib/ai/agents/voice-agent';
import type { VoiceEmotion } from '@/lib/ai/config/voice-config';

interface VoiceTTSRequest {
  text: string;
  language: 'en' | 'he';
  emotion?: VoiceEmotion;
}

interface VoiceTTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  fallbackConfig?: {
    lang: string;
    rate: number;
    pitch: number;
  };
  error?: string;
}

/**
 * POST - Convert text to speech
 */
export async function POST(request: NextRequest): Promise<NextResponse<VoiceTTSResponse>> {
  try {
    const body: VoiceTTSRequest = await request.json();

    // Validate request
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const text = body.text.trim();
    if (text.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Text too long (max 500 characters for TTS)' },
        { status: 400 }
      );
    }

    const language = body.language || 'en';
    const emotion = body.emotion || 'helpful';

    // Try Gemini TTS
    const ttsResult = await voiceAgent.textToSpeech({
      text,
      language,
      emotion,
    });

    // If Gemini returns audio, convert PCM to WAV for browser playback
    if (ttsResult.audioBase64 && !ttsResult.fallbackToBrowser) {
      // Gemini returns PCM audio - convert to WAV for browser compatibility
      const wavBase64 = voiceAgent.convertPCMtoWAV(ttsResult.audioBase64);

      return NextResponse.json({
        success: true,
        audioBase64: wavBase64,
        mimeType: 'audio/wav',
      });
    }

    // Fallback to browser TTS configuration
    const browserConfig = voiceAgent.getBrowserTTSConfig(language);

    return NextResponse.json({
      success: true,
      fallbackConfig: browserConfig,
    });

  } catch (error) {
    console.error('Voice API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Voice processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get voice configuration
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const language = (searchParams.get('language') || 'en') as 'en' | 'he';

  const voiceConfig = voiceAgent.getVoiceConfig(language);
  const browserConfig = voiceAgent.getBrowserTTSConfig(language);
  const isGeminiAvailable = voiceAgent.isGeminiAvailable();

  return NextResponse.json({
    success: true,
    config: {
      geminiAvailable: isGeminiAvailable,
      currentVoice: voiceConfig,
      browserFallback: browserConfig,
      supportedLanguages: ['en', 'he'],
      features: {
        textToSpeech: true,
        speechToText: 'browser', // Using browser's Web Speech API
        emotions: ['neutral', 'excited', 'helpful', 'apologetic'],
      },
    },
  });
}
