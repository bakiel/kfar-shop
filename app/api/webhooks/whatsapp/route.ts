import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'WhatsApp webhook temporarily disabled' 
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'OK' });
}
