import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET(request: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  
  const diagnostics = {
    tokenPresent: !!token,
    tokenLength: token?.length || 0,
    tokenPrefix: token?.substring(0, 8) + '...' || 'missing',
    timestamp: new Date().toISOString()
  };

  try {
    const replicate = new Replicate({
      auth: token,
    });

    // Test with MiniMax Speech-02 Turbo
    const output = await replicate.run(
      "minimax/speech-02-turbo",
      {
        input: {
          text: "Shalom Shalom! <#0.3#> Welcome to KiFar Marketplace. <#0.5#> Todaraba for visiting us today!",
          voice_id: "English_Gentle-voiced_man",
          emotion: "happy",
          speed: 0.95
        }
      }
    );
    
    return NextResponse.json({
      status: 'success',
      message: 'MiniMax Speech-02 Turbo is working',
      output: output,
      outputStructure: Object.keys(output || {}),
      outputType: typeof output,
      model: 'minimax-speech-02-turbo',
      diagnostics
    });
  } catch (error: any) {
    // Try XTTS-v2 as fallback
    try {
      const replicate = new Replicate({ auth: token });
      
      const xttsOutput = await replicate.run(
        "bzikst/xtts-v2-fork",
        {
          input: {
            text: "Shalom Shalom! Welcome to KiFar Marketplace. Todaraba!",
            language: "en",
            temperature: 0.7,
            speed: 0.95
          }
        }
      );
      
      return NextResponse.json({
        status: 'success',
        message: 'XTTS-v2 is working (MiniMax failed)',
        output: xttsOutput,
        outputType: typeof xttsOutput,
        model: 'xtts-v2',
        miniMaxError: error.message,
        diagnostics
      });
    } catch (xttsError: any) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        errorType: error.constructor.name,
        xttsError: xttsError.message,
        diagnostics
      });
    }
  }
}