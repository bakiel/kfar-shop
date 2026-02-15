import { NextRequest, NextResponse } from 'next/server';
import { sendRaw } from '@/lib/services/email/email-service';

// POST /api/contact - Process contact form submission and send email to admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone, category, message, tags } = body;

    if (!firstName || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName || ''}`.trim();
    const tagList = (tags || []).join(', ') || 'None';
    const priority = (tags || []).includes('urgent') ? 'URGENT' :
                     (tags || []).includes('payment') ? 'High' :
                     (tags || []).includes('technical') ? 'Medium' : 'Standard';

    // Build HTML for admin notification email
    const adminHtml = `
      <h2>New Contact Form Submission</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;width:120px;color:#2D5A27;">Name</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Email</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${phone ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Phone</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${phone}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Category</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${category || 'General'}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Tags</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${tagList}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Priority</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:${priority === 'URGENT' ? '#c23c09' : priority === 'High' ? '#f6af0d' : '#478c0b'};">${priority}</td>
        </tr>
      </table>
      <h3 style="color:#2D5A27;">Message</h3>
      <div style="background:#f5f0e8;padding:16px;border-radius:8px;border-left:4px solid #478c0b;margin:8px 0;">
        <p style="white-space:pre-wrap;margin:0;">${message}</p>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#777;">Reply directly to this email to respond to the customer.</p>
    `;

    // Send notification to admin
    const adminResult = await sendRaw(
      'admin@kfarapp.com',
      `[KFAR Contact] ${priority !== 'Standard' ? `[${priority}] ` : ''}${category || 'General'} - ${fullName}`,
      adminHtml
    );

    // Send confirmation to the customer
    const confirmHtml = `
      <h2>Thank you for contacting us, ${firstName}!</h2>
      <p>We have received your message and will get back to you within the estimated response time.</p>
      <div style="background:#f5f0e8;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 4px;font-weight:600;color:#2D5A27;">Your message:</p>
        <p style="margin:0;color:#444;">${message.length > 200 ? message.substring(0, 200) + '...' : message}</p>
      </div>
      <p><strong>Category:</strong> ${category || 'General'}</p>
      <p><strong>Expected response:</strong> ${
        priority === 'URGENT' ? 'Within 1 hour' :
        priority === 'High' ? '2-4 hours' :
        priority === 'Medium' ? 'Within 24 hours' : 'Within 48 hours'
      }</p>
      <p style="margin-top:24px;">In the meantime, you can also reach us via WhatsApp for urgent matters.</p>
    `;

    await sendRaw(
      email,
      'We received your message - KFAR Marketplace',
      confirmHtml
    );

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      emailSent: adminResult.success,
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
