import { NextRequest, NextResponse } from 'next/server';
import { submitApplication } from '@/lib/services/driver-service';
import { DriverApplicationFormData, VehicleType } from '@/lib/types/driver';
import { sendRaw } from '@/lib/services/email/email-service';

const VALID_VEHICLE_TYPES: VehicleType[] = ['car', 'scooter', 'bicycle', 'ebike'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required: (keyof DriverApplicationFormData)[] = [
      'fullName', 'email', 'phone', 'vehicleType', 'areas', 'availability',
    ];
    const missing = required.filter(field => {
      const val = body[field];
      if (Array.isArray(val)) return val.length === 0;
      return !val || (typeof val === 'string' && val.trim() === '');
    });

    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate vehicle type
    if (!VALID_VEHICLE_TYPES.includes(body.vehicleType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vehicle type' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const formData: DriverApplicationFormData = {
      fullName: body.fullName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      idNumber: (body.idNumber || '').trim(),
      vehicleType: body.vehicleType,
      licenseNumber: (body.licenseNumber || '').trim(),
      areas: body.areas,
      availability: body.availability,
      experience: (body.experience || '').trim(),
      whyJoin: (body.whyJoin || '').trim(),
    };

    const result = await submitApplication(formData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to submit application' },
        { status: 500 }
      );
    }

    console.log(`New driver application: ${result.applicationId} - ${formData.fullName} (${formData.phone})`);

    // Send email notifications (fire-and-forget)
    const adminHtml = `
      <h2>New Driver Application</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;width:140px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.fullName}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.phone}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Vehicle</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.vehicleType}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Areas</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.areas.join(', ')}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Availability</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.availability.join(', ')}</td></tr>
        ${formData.experience ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Experience</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.experience}</td></tr>` : ''}
        ${formData.whyJoin ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#2D5A27;">Why Join</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${formData.whyJoin}</td></tr>` : ''}
      </table>
      <p style="font-size:12px;color:#777;">Application ID: ${result.applicationId}</p>
    `;

    sendRaw('admin@kfarapp.com', `[KFAR] New Driver Application - ${formData.fullName}`, adminHtml)
      .catch(err => console.error('Failed to send driver admin email:', err));

    const applicantHtml = `
      <h2>Thank you for applying, ${formData.fullName}!</h2>
      <p>We have received your delivery driver application for KFAR Marketplace.</p>
      <p>Our team will review your application and get back to you within 2-3 business days.</p>
      <div style="background:#f5f0e8;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 8px;font-weight:600;color:#2D5A27;">Application Summary</p>
        <p style="margin:0;"><strong>Vehicle:</strong> ${formData.vehicleType}</p>
        <p style="margin:0;"><strong>Areas:</strong> ${formData.areas.join(', ')}</p>
        <p style="margin:0;"><strong>Availability:</strong> ${formData.availability.join(', ')}</p>
      </div>
      <p>If you have any questions, reply to this email or contact us via WhatsApp.</p>
    `;

    sendRaw(formData.email, 'Application Received - KFAR Delivery Driver', applicantHtml)
      .catch(err => console.error('Failed to send driver applicant email:', err));

    return NextResponse.json({
      success: true,
      applicationId: result.applicationId,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Driver application error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
