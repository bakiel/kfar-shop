// Test script to verify Gemini API connection
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiConnection() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  
  console.log('Testing Gemini API connection...');
  console.log('API Key present:', apiKey ? 'Yes' : 'No');
  console.log('API Key length:', apiKey.length);
  console.log('API Key starts with:', apiKey.substring(0, 8) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Gemini responded:', text);
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API_KEY')) {
      console.error('Issue with API key authentication');
    } else if (error.message.includes('quota')) {
      console.error('API quota exceeded');
    } else if (error.message.includes('model')) {
      console.error('Model not available');
    }
    return false;
  }
}

// Export for use in API route
export { testGeminiConnection };