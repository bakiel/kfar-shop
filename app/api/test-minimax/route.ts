import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  
  try {
    // Test MiniMax Speech-02 using direct API call (official model format)
    const response = await fetch('https://api.replicate.com/v1/models/minimax/speech-02-turbo/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          text: "Shalom Shalom! <#0.3#> Welcome to KiFar Marketplace. <#0.5#> Todaraba for visiting us today!",
          voice_id: "English_Gentle-voiced_man",
          emotion: "happy",
          speed: 0.95
        }
      })
    });

    const result = await response.json();
    
    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      result: result,
      hasOutput: !!result.output,
      outputType: typeof result.output,
      model: 'minimax-speech-02-turbo'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      errorType: error.constructor.name
    });
  }
}