import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  
  try {
    // Test both male and female African American voices
    const maleResponse = await fetch('https://api.replicate.com/v1/models/minimax/speech-02-turbo/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          text: "Shalom Shalom! <#0.2#> Welcome to Kee-Far Marketplace. <#0.3#> We got the best vegan food in town!",
          voice_id: "English_ManWithDeepVoice",
          emotion: "happy",
          speed: 1.1,
          temperature: 0.8
        }
      })
    });

    const femaleResponse = await fetch('https://api.replicate.com/v1/models/minimax/speech-02-turbo/predictions', {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          text: "Hey there! <#0.2#> Welcome to Kee-Far! <#0.3#> Let me show you around our amazing marketplace.",
          voice_id: "English_ConfidentWoman",
          emotion: "happy",
          speed: 1.1,
          temperature: 0.8
        }
      })
    });

    const maleResult = await maleResponse.json();
    const femaleResult = await femaleResponse.json();
    
    return NextResponse.json({
      status: 'success',
      male: {
        voiceId: "English_ManWithDeepVoice",
        audioUrl: maleResult.output,
        speed: 1.1
      },
      female: {
        voiceId: "English_ConfidentWoman", 
        audioUrl: femaleResult.output,
        speed: 1.1
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    });
  }
}