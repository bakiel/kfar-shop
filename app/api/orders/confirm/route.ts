import { NextRequest, NextResponse } from 'next/server';
import TwilioService from '@/services/twilioService';
import UpstashService from '@/services/upstashService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, customer, total } = body;

    // Save order to cache for quick access
    await UpstashService.cacheSet(`order:${orderId}`, {
      orderId,
      items,
      customer,
      total,
      status: 'confirmed',
      timestamp: new Date().toISOString()
    }, 86400); // 24 hour cache

    // Send SMS confirmation to customer
    if (customer.phone) {
      await TwilioService.sendOrderConfirmation(customer.phone, {
        id: orderId,
        total
      });
    }

    // Notify vendors about their items
    const vendorNotifications = [];
    for (const item of items) {
      if (item.vendorPhone) {
        const notification = TwilioService.notifyVendor(item.vendorPhone, {
          productName: item.name,
          quantity: item.quantity,
          customerName: customer.name
        });
        vendorNotifications.push(notification);
      }

      // Update inventory
      await UpstashService.updateInventory(
        item.productId, 
        item.currentStock - item.quantity
      );

      // Track popular products
      await UpstashService.trackPopularProduct(item.productId);
    }

    // Wait for all vendor notifications
    await Promise.all(vendorNotifications);

    // Clear customer cart
    if (customer.id) {
      await UpstashService.clearCart(customer.id);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order confirmed and notifications sent'
    });

  } catch (error: any) {
    console.error('Order confirmation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process order confirmation' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Get order from cache
    const order = await UpstashService.cacheGet(`order:${orderId}`);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
