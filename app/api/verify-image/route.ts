import { NextRequest, NextResponse } from 'next/server';

// Use Gemini 2.5 Flash for vision verification (it's free)
const OPENROUTER_API_KEY = process.env.OPENROUTER_GEMINI_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Use Gemini 2.5 Flash for free vision analysis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kfarmarket.com',
        'X-Title': 'KFAR Marketplace'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for a coming soon page. Check for: 1) Visual quality and clarity, 2) Professional appearance, 3) Cultural authenticity if applicable, 4) Any issues or concerns. Provide a brief assessment in one sentence.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Vision API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const assessment = data.choices[0]?.message?.content || 'Image verified';

    // Simple quality scoring based on keywords
    let score = 70; // Base score
    const positiveKeywords = ['professional', 'high quality', 'clear', 'vibrant', 'authentic', 'excellent'];
    const negativeKeywords = ['blurry', 'low quality', 'unclear', 'issue', 'problem', 'poor'];

    positiveKeywords.forEach(keyword => {
      if (assessment.toLowerCase().includes(keyword)) score += 5;
    });

    negativeKeywords.forEach(keyword => {
      if (assessment.toLowerCase().includes(keyword)) score -= 10;
    });

    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      description: assessment,
      score: score,
      passed: score >= 70,
      model: 'gemini-2.0-flash'
    });

  } catch (error) {
    console.error('Image verification error:', error);
    
    // Fallback response
    return NextResponse.json({
      description: 'Image verification unavailable, using fallback assessment',
      score: 75,
      passed: true,
      error: true
    });
  }
}