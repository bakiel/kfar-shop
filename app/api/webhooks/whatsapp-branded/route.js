// Force rebuild - fixed escape sequences
import { NextResponse } from 'next/server';
// import BrandedWhatsAppService from '@/services/brandedWhatsAppService';
// import { db } from '@/lib/db';

// Initialize the branded WhatsApp service
// const whatsappService = new BrandedWhatsAppService();

// Webhook verification (GET request from Twilio)
export async function GET(request) {
  return NextResponse.json({ status: 'OK' });
}

// Handle incoming WhatsApp messages
export async function POST(request) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp webhook temporarily disabled' 
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
