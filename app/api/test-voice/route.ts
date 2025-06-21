import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

export async function GET(request: NextRequest) {
  try {
    const apiKey = 'sk_cfa44ba688a4d66ad758ccd75305de5b6a6abc7d3b3ba215';
    const client = new ElevenLabsClient({ apiKey });

    // Test the client
    const voices = await client.voices.getAll();
    
    return NextResponse.json({
      success: true,
      voiceCount: voices.voices.length,
      daniellaFound: voices.voices.find(v => v.voice_id === 'EXAVITQu4vr4xnSDxMaL')?.name,
      yaakovFound: voices.voices.find(v => v.voice_id === 'ZMK5OD2jmsdse3EKE4W5')?.name,
      apiKeyValid: true
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}