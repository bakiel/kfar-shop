import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, gender = 'female', language = 'en' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Voice selection based on gender using V3 voices
    const voiceId = gender === 'male' 
      ? process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YAAKOV || 'TX3LPaxmHKxFdv7VOQHJ' // Yaakov - V3 Male voice
      : process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DANIELLA || 'Z3R5wn05IrDiVCyEkUrK'; // Daniella - V3 Female voice

    console.log('🎤 ElevenLabs TTS Request:', { 
      text: text.substring(0, 50) + '...', 
      voiceId,
      gender 
    });

    try {
      // Generate audio using ElevenLabs v3
      const audioStream = await client.generate({
        voice: voiceId,
        text: text,
        model_id: "eleven_multilingual_v2", // Using v2 for stability
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      });

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
        success: true
      });

    } catch (elevenLabsError: any) {
      console.error('❌ ElevenLabs API error:', elevenLabsError);
      
      // If ElevenLabs fails, return fallback flag
      return NextResponse.json(
        { 
          fallback: true, 
          message: 'ElevenLabs unavailable, using browser TTS',
          error: elevenLabsError.message 
        },
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error('❌ TTS API error:', error);
    
    // Always return fallback flag so client can use browser TTS
    return NextResponse.json(
      { 
        fallback: true, 
        error: error.message || 'TTS generation failed' 
      },
      { status: 200 }
    );
  }
}