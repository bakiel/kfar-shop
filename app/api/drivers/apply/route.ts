import { NextRequest, NextResponse } from 'next/server';
import { submitApplication } from '@/lib/services/driver-service';
import { DriverApplicationFormData, VehicleType } from '@/lib/types/driver';

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

    // Log for admin notification (WhatsApp integration hook)
    console.log(`New driver application: ${result.applicationId} - ${formData.fullName} (${formData.phone})`);

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
