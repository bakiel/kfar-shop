import { VendorData } from '@/types/vendor';
import QRCode from 'qrcode';

// Twilio credentials from environment (Production ready)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SMS_FROM = process.env.TWILIO_PHONE_NUMBER || '+14706605657'; // Atlanta number
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Sandbox (join known-could)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'welcome@kfar.market';

interface WelcomePackageData {
  vendor: VendorData;
  vendorId: string;
  qrCodeUrl: string;
  dashboardUrl: string;
  marketingMaterialsUrl: string;
}

export class VendorWelcomeService {
  private twilioClient: any;
  private sendgridClient: any;

  constructor() {
    // Initialize Twilio client
    if (typeof window === 'undefined') {
      // Server-side only
      const twilio = require('twilio');
      this.twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      
      // Initialize SendGrid
      const sgMail = require('@sendgrid/mail');
      if (SENDGRID_API_KEY) {
        sgMail.setApiKey(SENDGRID_API_KEY);
        this.sendgridClient = sgMail;
      }
    }
  }

  // Generate QR codes for vendor
  async generateVendorQRCodes(vendorId: string, vendor: VendorData) {
    const qrCodes: Record<string, string> = {};
    
    // Store page QR
    const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kfar.market'}/store/${vendorId}`;
    qrCodes.store = await QRCode.toDataURL(storeUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#478c0b', // Leaf green
        light: '#ffffff'
      }
    });

    // WhatsApp contact QR
    const whatsappMessage = encodeURIComponent(`Hi! I found your store ${vendor.businessName} on KFAR Marketplace and I'm interested in your products.`);
    const whatsappUrl = `https://wa.me/${this.formatPhoneForWhatsApp(vendor.phone)}?text=${whatsappMessage}`;
    qrCodes.whatsapp = await QRCode.toDataURL(whatsappUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#25D366', // WhatsApp green
        light: '#ffffff'
      }
    });

    // Menu/catalog QR (if restaurant)
    if (vendor.businessType === 'restaurant' || vendor.businessType === 'cafe') {
      const menuUrl = `${storeUrl}/menu`;
      qrCodes.menu = await QRCode.toDataURL(menuUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#c23c09', // Earth flame
          light: '#ffffff'
        }
      });
    }

    return qrCodes;
  }

  // Send welcome package via email and WhatsApp
  async sendWelcomePackage(data: WelcomePackageData) {
    const { vendor, vendorId, qrCodeUrl, dashboardUrl, marketingMaterialsUrl } = data;

    // Generate QR codes
    const qrCodes = await this.generateVendorQRCodes(vendorId, vendor);

    // Send WhatsApp welcome message
    await this.sendWhatsAppWelcome(vendor, vendorId, dashboardUrl);

    // Send email with full welcome package
    if (vendor.email) {
      await this.sendEmailWelcome(vendor, vendorId, qrCodes, dashboardUrl, marketingMaterialsUrl);
    }

    return {
      success: true,
      qrCodes,
      dashboardUrl
    };
  }

  // Send WhatsApp welcome message
  private async sendWhatsAppWelcome(vendor: VendorData, vendorId: string, dashboardUrl: string) {
    if (!this.twilioClient) return;

    const message = `🎉 Welcome to KFAR Marketplace, ${vendor.ownerName}!

Your store "${vendor.businessName}" is now live! 🌱

✅ Your vendor dashboard: ${dashboardUrl}
✅ Your store page: https://kfar.market/store/${vendorId}

What's next?
1. Check your email for QR codes and marketing materials
2. Add more products in your dashboard
3. Share your store link with customers

We've sent you:
📧 Email with QR codes for your store
📱 Marketing materials you can print
🎯 Tips for growing your business

Need help? Reply to this message or visit your dashboard.

Welcome to the KFAR family! 🌿`;

    try {
      const formattedPhone = this.formatPhoneForWhatsApp(vendor.phone);
      
      await this.twilioClient.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${formattedPhone}`,
        body: message
      });

      console.log('WhatsApp welcome message sent successfully');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      // Don't throw - email might still work
    }
  }

  // Send email welcome package
  private async sendEmailWelcome(
    vendor: VendorData, 
    vendorId: string, 
    qrCodes: Record<string, string>,
    dashboardUrl: string,
    marketingMaterialsUrl: string
  ) {
    if (!this.sendgridClient) {
      console.log('SendGrid not configured, skipping email');
      return;
    }

    const emailHtml = this.generateWelcomeEmailHTML(vendor, vendorId, dashboardUrl, marketingMaterialsUrl);

    // Convert QR codes to attachments
    const attachments = Object.entries(qrCodes).map(([type, dataUrl]) => {
      const base64Data = dataUrl.split(',')[1];
      return {
        content: base64Data,
        filename: `${vendor.businessName.toLowerCase().replace(/\s+/g, '-')}-qr-${type}.png`,
        type: 'image/png',
        disposition: 'attachment'
      };
    });

    try {
      await this.sendgridClient.send({
        to: vendor.email,
        from: FROM_EMAIL,
        subject: `Welcome to KFAR Marketplace - ${vendor.businessName} is Live! 🎉`,
        html: emailHtml,
        attachments
      });

      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  // Generate welcome email HTML
  private generateWelcomeEmailHTML(
    vendor: VendorData, 
    vendorId: string, 
    dashboardUrl: string,
    marketingMaterialsUrl: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to KFAR Marketplace</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #478c0b, #f6af0d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #c23c09; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .qr-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
    .feature { margin: 15px 0; padding-left: 30px; position: relative; }
    .feature:before { content: "✅"; position: absolute; left: 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to KFAR Marketplace! 🌱</h1>
    </div>
    
    <div class="content">
      <h2>Congratulations, ${vendor.ownerName}!</h2>
      <p>Your store <strong>${vendor.businessName}</strong> is now live on KFAR Marketplace!</p>
      
      <h3>🚀 Quick Links</h3>
      <div class="feature">
        <a href="${dashboardUrl}" class="button">Access Your Dashboard</a>
      </div>
      <div class="feature">
        <a href="https://kfar.market/store/${vendorId}" class="button">View Your Store Page</a>
      </div>
      <div class="feature">
        <a href="${marketingMaterialsUrl}" class="button">Download Marketing Materials</a>
      </div>
      
      <div class="qr-section">
        <h3>📱 Your QR Codes (Attached)</h3>
        <p>We've attached QR codes that you can print and display:</p>
        <ul>
          <li><strong>Store QR Code:</strong> Links directly to your store page</li>
          <li><strong>WhatsApp QR Code:</strong> Lets customers contact you instantly</li>
          ${vendor.businessType === 'restaurant' || vendor.businessType === 'cafe' ? 
            '<li><strong>Menu QR Code:</strong> Quick access to your menu</li>' : ''}
        </ul>
        <p><em>💡 Tip: Print these at 10x10cm for table tents or 20x20cm for wall displays</em></p>
      </div>
      
      <h3>✨ What's Next?</h3>
      <ol>
        <li><strong>Add More Products:</strong> Use your dashboard to expand your catalog</li>
        <li><strong>Share Your Store:</strong> Send your store link to customers</li>
        <li><strong>Display QR Codes:</strong> Print and place them in your physical location</li>
        <li><strong>Track Performance:</strong> Monitor views and orders in your dashboard</li>
      </ol>
      
      <h3>💪 Pro Tips for Success</h3>
      <ul>
        <li>Update your products regularly to keep customers engaged</li>
        <li>Use high-quality photos - our AI will enhance them automatically</li>
        <li>Respond quickly to customer inquiries via WhatsApp</li>
        <li>Share your store link on social media</li>
      </ul>
      
      <p style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>🎁 Special Launch Offer:</strong> For your first 30 days, enjoy our "New Store" badge 
        that helps customers discover you! This badge appears automatically on your store.
      </p>
    </div>
    
    <div class="footer">
      <p>Need help? Contact our vendor support team:</p>
      <p>📧 support@kfar.market | 📱 WhatsApp: +972-XX-XXX-XXXX</p>
      <p>KFAR Marketplace - The Whole Village, In Your Hand</p>
    </div>
  </div>
</body>
</html>
`;
  }

  // Format phone number for WhatsApp
  private formatPhoneForWhatsApp(phone: string): string {
    // Remove any non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle Israeli numbers
    if (cleaned.startsWith('0')) {
      // Local format: 0541234567 -> 972541234567
      return `972${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('972')) {
      // Already has country code
      return cleaned;
    } else if (cleaned.length === 9) {
      // Just the number: 541234567 -> 972541234567
      return `972${cleaned}`;
    }
    
    // Return as-is if format is unclear
    return cleaned;
  }

  // Send vendor notification for new order
  async sendOrderNotification(vendorId: string, orderData: any) {
    // This would be called when a new order comes in
    const vendor = await this.getVendorData(vendorId);
    if (!vendor) return;

    const itemsList = orderData.items
      .map((item: any) => `• ${item.name} (×${item.quantity}) - ₪${item.price * item.quantity}`)
      .join('\n');

    const message = `📦 New Order Alert!

Order #${orderData.orderId}
Customer: ${orderData.customerName}

Items:
${itemsList}

Total: ₪${orderData.total}
Delivery: ${orderData.deliveryMethod}

📱 View full details in your dashboard:
${process.env.NEXT_PUBLIC_APP_URL}/vendor/orders/${orderData.orderId}

Please confirm order acceptance within 30 minutes.`;

    // Send via WhatsApp
    if (this.twilioClient && vendor.phone) {
      try {
        await this.twilioClient.messages.create({
          from: TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${this.formatPhoneForWhatsApp(vendor.phone)}`,
          body: message
        });
      } catch (error) {
        console.error('Error sending order notification:', error);
      }
    }

    // Also send email notification
    if (this.sendgridClient && vendor.email) {
      try {
        await this.sendgridClient.send({
          to: vendor.email,
          from: FROM_EMAIL,
          subject: `New Order #${orderData.orderId} - ${orderData.customerName}`,
          text: message,
          html: this.generateOrderEmailHTML(orderData, vendor)
        });
      } catch (error) {
        console.error('Error sending order email:', error);
      }
    }
  }

  // Helper to get vendor data (would connect to your database)
  private async getVendorData(vendorId: string): Promise<VendorData | null> {
    // This would fetch from your database
    // For now, returning null as placeholder
    return null;
  }

  // Generate order notification email
  private generateOrderEmailHTML(orderData: any, vendor: VendorData): string {
    // Similar structure to welcome email but for order notifications
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Similar styles as welcome email */
  </style>
</head>
<body>
  <div class="container">
    <h1>New Order Received!</h1>
    <!-- Order details here -->
  </div>
</body>
</html>
`;
  }
}

// Export singleton instance
export const vendorWelcomeService = new VendorWelcomeService();