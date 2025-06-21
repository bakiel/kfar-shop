// app/api/webhooks/whatsapp/route.js
import { NextResponse } from 'next/server';
import whatsappService from '@/services/whatsappBusinessService';
import crypto from 'crypto';

// Helper to verify Twilio signature
function verifyTwilioSignature(request, body, signature) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const url = request.url;
  
  // Skip verification in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Create expected signature
  const params = body;
  const data = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');
  
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(url + data)
    .digest('base64');
  
  return signature === expectedSignature;
}

export async function POST(request) {
  try {
    const body = await request.formData();
    const data = Object.fromEntries(body);
    const twilioSignature = request.headers.get('x-twilio-signature');
    
    // Verify signature
    if (!verifyTwilioSignature(request, data, twilioSignature)) {
      return new NextResponse('Invalid signature', { status: 403 });
    }
    
    console.log('Incoming WhatsApp webhook:', data);
    
    // Handle the incoming message
    const result = await whatsappService.handleIncomingWhatsApp(data);
    
    // Return TwiML response
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new NextResponse('<Response></Response>', {
      status: 500,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
