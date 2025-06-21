// app/api/webhooks/test/route.js
import { NextResponse } from 'next/server';
import whatsappService from '@/services/whatsappBusinessService';

export async function POST(request) {
  try {
    const data = await request.json();
    const { phone, message, type = 'order' } = data;
    
    let result;
    
    switch (type) {
      case 'order':
        result = await whatsappService.sendOrderConfirmation({
          customerName: 'Test User',
          customerPhone: phone,
          customerEmail: 'test@example.com',
          id: '12345',
          total: 150
        });
        break;
        
      case 'payment':
        result = await whatsappService.sendPaymentConfirmation({
          customerPhone: phone,
          orderId: '12345',
          amount: 150
        });
        break;
        
      case 'delivery':
        result = await whatsappService.sendDeliveryUpdate({
          customerPhone: phone,
          orderId: '12345',
          status: 'ready',
          estimatedTime: '15 דקות'
        });
        break;
        
      case 'custom':
        result = await whatsappService.sendMessage(phone, message);
        break;
        
      default:
        throw new Error('Invalid message type');
    }
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'whatsapp-webhooks',
    timestamp: new Date().toISOString()
  });
}
