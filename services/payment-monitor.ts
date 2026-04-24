/**
 * Payment Monitoring Service
 * Monitors pending payments every 60 seconds and updates order status
 */

import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface PaymentCheckResult {
  orderId: string;
  status: 'paid' | 'pending' | 'expired';
  transactionId?: string;
  amount?: number;
  timestamp?: Date;
}

export class PaymentMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private checkInterval = 60000; // 60 seconds

  /**
   * Start the payment monitoring service
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Payment monitor already running');
      return;
    }

    console.log('🚀 Starting payment monitoring service');
    console.log(`⏰ Checking every ${this.checkInterval / 1000} seconds`);

    this.isRunning = true;
    
    // Run immediately on start
    this.checkPendingPayments();
    
    // Then run every 60 seconds
    this.intervalId = setInterval(() => {
      this.checkPendingPayments();
    }, this.checkInterval);
  }

  /**
   * Stop the payment monitoring service
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Payment monitor not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Payment monitoring service stopped');
  }

  /**
   * Check all pending payments
   */
  private async checkPendingPayments() {
    const startTime = Date.now();
    console.log(`\n🔍 [${new Date().toISOString()}] Checking pending payments...`);

    try {
      // Get all orders with pending payments
      const pendingOrders = await prisma.order.findMany({
        where: {
          status: 'pending_payment',
          createdAt: {
            // Only check orders created in the last 24 hours
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log(`📋 Found ${pendingOrders.length} pending orders`);

      // Check each pending order
      for (const order of pendingOrders) {
        await this.checkOrderPayment(order);
      }

      // Check for expired orders (older than 2 hours)
      const expiredOrders = pendingOrders.filter(order => {
        const orderAge = Date.now() - order.createdAt.getTime();
        return orderAge > 2 * 60 * 60 * 1000; // 2 hours
      });

      if (expiredOrders.length > 0) {
        console.log(`⏰ Found ${expiredOrders.length} expired orders`);
        for (const order of expiredOrders) {
          await this.handleExpiredOrder(order);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Payment check completed in ${duration}ms\n`);

    } catch (error) {
      console.error('❌ Error checking payments:', error);
    }
  }

  /**
   * Check payment status for a specific order
   */
  private async checkOrderPayment(order: any): Promise<PaymentCheckResult> {
    console.log(`💳 Checking payment for order #${order.id}`);

    // In a real implementation, this would check with your payment provider
    // For now, we'll simulate different payment scenarios
    const mockPaymentCheck = await this.mockCheckPaymentStatus(order);

    if (mockPaymentCheck.status === 'paid') {
      await this.handleSuccessfulPayment(order, mockPaymentCheck);
    }

    return mockPaymentCheck;
  }

  /**
   * Mock payment status check (replace with actual payment provider integration)
   */
  private async mockCheckPaymentStatus(order: any): Promise<PaymentCheckResult> {
    // Simulate different payment scenarios
    const random = Math.random();
    
    if (random < 0.3) {
      // 30% chance payment completed
      return {
        orderId: order.id,
        status: 'paid',
        transactionId: `TXN-${Date.now()}-${order.id}`,
        amount: order.totalAmount,
        timestamp: new Date()
      };
    } else if (order.createdAt.getTime() < Date.now() - 2 * 60 * 60 * 1000) {
      // Order older than 2 hours = expired
      return {
        orderId: order.id,
        status: 'expired'
      };
    } else {
      // Still pending
      return {
        orderId: order.id,
        status: 'pending'
      };
    }
  }

  /**
   * Handle successful payment
   */
  private async handleSuccessfulPayment(order: any, paymentResult: PaymentCheckResult) {
    console.log(`✅ Payment confirmed for order #${order.id}`);

    try {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'processing',
          paymentStatus: 'paid',
          paymentId: paymentResult.transactionId,
          paidAt: paymentResult.timestamp
        }
      });

      // Calculate vendor payouts (85/15 split)
      await this.calculateVendorPayouts(order);

      // Send confirmation email
      await this.sendPaymentConfirmationEmail(order);

      // Notify vendor via WhatsApp (if configured)
      await this.notifyVendor(order);

      console.log(`📧 Notifications sent for order #${order.id}`);

    } catch (error) {
      console.error(`❌ Error processing payment for order #${order.id}:`, error);
    }
  }

  /**
   * Calculate vendor payouts (85% to vendor, 15% platform fee)
   */
  private async calculateVendorPayouts(order: any) {
    const vendorPayouts = new Map<string, number>();

    // Group items by vendor
    for (const item of order.items) {
      const vendorId = item.product.vendorId;
      const itemTotal = item.price * item.quantity;
      const vendorPayout = itemTotal * 0.85; // 85% to vendor
      
      if (vendorPayouts.has(vendorId)) {
        vendorPayouts.set(vendorId, vendorPayouts.get(vendorId)! + vendorPayout);
      } else {
        vendorPayouts.set(vendorId, vendorPayout);
      }
    }

    // Create payout records
    for (const [vendorId, amount] of vendorPayouts) {
      await prisma.vendorPayout.create({
        data: {
          vendorId,
          orderId: order.id,
          amount,
          status: 'pending',
          platformFee: amount * (15 / 85), // Calculate platform fee
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      });
    }

    console.log(`💰 Created ${vendorPayouts.size} vendor payouts for order #${order.id}`);
  }

  /**
   * Handle expired orders
   */
  private async handleExpiredOrder(order: any) {
    console.log(`⏰ Handling expired order #${order.id}`);

    try {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Payment timeout - order expired after 2 hours'
        }
      });

      // Restore product inventory
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // Send cancellation email
      await this.sendOrderCancellationEmail(order);

      console.log(`❌ Order #${order.id} cancelled due to payment timeout`);

    } catch (error) {
      console.error(`❌ Error handling expired order #${order.id}:`, error);
    }
  }

  /**
   * Send payment confirmation email
   */
  private async sendPaymentConfirmationEmail(order: any) {
    const msg = {
      to: order.user.email,
      from: 'orders@kfarmarket.com',
      subject: `Payment Confirmed - Order #${order.id} 🎉`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #478c0b, #3a7209); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0;">Payment Confirmed! ✅</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order #${order.id}</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
            <h2 style="color: #3a3a1d; margin: 0 0 20px 0;">Thank you, ${order.user.name}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6;">
              We've received your payment of <strong>₪${order.totalAmount}</strong> and your order is now being processed.
            </p>
            
            <div style="background: #cfe7c1; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #3a7209; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li>Your order is being prepared by the vendor</li>
                <li>You'll receive a notification when it's ready</li>
                <li>Estimated delivery: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://kfarmarket.com/orders/${order.id}" 
                 style="display: inline-block; background: #478c0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Track Your Order
              </a>
            </div>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  }

  /**
   * Send order cancellation email
   */
  private async sendOrderCancellationEmail(order: any) {
    const msg = {
      to: order.user.email,
      from: 'orders@kfarmarket.com',
      subject: `Order Cancelled - #${order.id}`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #c23c09; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0;">Order Cancelled</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px;">
            <p>Dear ${order.user.name},</p>
            <p>Your order #${order.id} has been cancelled due to payment timeout.</p>
            <p>The payment window expired after 2 hours. If you'd still like to purchase these items, please place a new order.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://kfarmarket.com" 
                 style="display: inline-block; background: #478c0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }
  }

  /**
   * Notify vendor via WhatsApp
   */
  private async notifyVendor(order: any) {
    // This would integrate with Twilio WhatsApp API
    // For now, just log
    console.log(`📱 Would notify vendor about order #${order.id} via WhatsApp`);
  }

  /**
   * Get monitoring statistics
   */
  async getStats() {
    const stats = await prisma.$transaction([
      prisma.order.count({ where: { status: 'pending_payment' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.vendorPayout.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true }
      })
    ]);

    return {
      pendingPayments: stats[0],
      processingOrders: stats[1],
      cancelledOrders: stats[2],
      pendingPayouts: stats[3]._sum.amount || 0,
      isRunning: this.isRunning,
      checkInterval: this.checkInterval
    };
  }
}

// Create singleton instance
export const paymentMonitor = new PaymentMonitor();