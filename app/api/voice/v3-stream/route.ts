import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';
import { VOICE_CONFIG } from '@/config/voice';

// Get API key from environment or use hardcoded fallback
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 'sk_cfa44ba688a4d66ad758ccd75305de5b6a6abc7d3b3ba215';

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY
});

// Log initialization
console.log('🎤 ElevenLabs V3 API initialized with key:', ELEVENLABS_API_KEY ? '***' + ELEVENLABS_API_KEY.slice(-4) : 'NO KEY');

export async function POST(request: NextRequest) {
  console.log('🔵 V3 Stream API called');
  console.log('🔑 API Key available:', !!ELEVENLABS_API_KEY);
  
  try {
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { 
      text, 
      voice = 'daniella', 
      language = 'en',
      stream = true 
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get voice configuration
    const voiceConfig = VOICE_CONFIG[voice as keyof typeof VOICE_CONFIG];
    if (!voiceConfig) {
      return NextResponse.json(
        { error: 'Invalid voice selection' },
        { status: 400 }
      );
    }

    console.log('🎤 ElevenLabs V3 Stream Request:', { 
      text: text.substring(0, 50) + '...', 
      voice,
      voiceId: voiceConfig.id,
      language,
      hasApiKey: !!ELEVENLABS_API_KEY
    });

    try {
      // For streaming response
      if (stream) {
        console.log('🌊 Attempting streaming generation...');
        const audioStream = await client.textToSpeech.convertAsStream(
          voiceConfig.id,
          {
            text: text,
            model_id: "eleven_turbo_v2_5", // Using turbo model for lower latency
            voice_settings: voiceConfig.settings
          }
        );

        // Create a ReadableStream for the response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of audioStream) {
                controller.enqueue(chunk);
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          }
        });

        // Return streaming response
        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'X-Voice-Id': voiceConfig.id,
            'X-Voice-Name': voiceConfig.name
          }
        });
      } 
      
      // For non-streaming response (backwards compatibility)
      else {
        console.log('📦 Attempting non-streaming generation...');
        const audioStream = await client.textToSpeech.convertAsStream(
          voiceConfig.id,
          {
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: voiceConfig.settings
          }
        );

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of audioStream) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        console.log('✅ Audio generated successfully:', audioBuffer.length, 'bytes');

        // Return audio as base64
        const audioBase64 = audioBuffer.toString('base64');
        
        return NextResponse.json({
          audio: audioBase64,
          format: 'mp3',
          voice: voiceConfig.name,
          success: true
        });
      }

    } catch (elevenLabsError: any) {
      console.error('❌ ElevenLabs V3 API error:', {
        message: elevenLabsError.message,
        stack: elevenLabsError.stack,
        response: elevenLabsError.response,
        status: elevenLabsError.status,
        data: elevenLabsError.data
      });
      
      // If ElevenLabs fails, return error (NO FALLBACK)
      return NextResponse.json(
        { 
          success: false,
          error: elevenLabsError.message,
          errorDetails: {
            type: elevenLabsError.constructor.name,
            status: elevenLabsError.status,
            data: elevenLabsError.data,
            voiceId: voiceConfig.id,
            apiKeyPresent: !!ELEVENLABS_API_KEY
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Voice V3 API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Voice generation failed',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

// Support for WebSocket upgrade (future enhancement)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Voice V3 Streaming API',
    endpoints: {
      POST: '/api/voice/v3-stream',
      body: {
        text: 'string (required)',
        voice: 'yaakov | daniella (default: daniella)',
        language: 'en | he | ar (default: en)',
        stream: 'boolean (default: true)'
      }
    },
    voices: Object.keys(VOICE_CONFIG).map(key => ({
      id: key,
      name: VOICE_CONFIG[key as keyof typeof VOICE_CONFIG].name,
      voiceId: VOICE_CONFIG[key as keyof typeof VOICE_CONFIG].id
    }))
  });
}