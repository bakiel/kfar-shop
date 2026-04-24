import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  
  const diagnostics = {
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.substring(0, 8) + '...',
    timestamp: new Date().toISOString()
  };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({
      status: 'success',
      message: 'Gemini API is working',
      response: text,
      diagnostics
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      errorType: error.constructor.name,
      diagnostics
    });
  }
}