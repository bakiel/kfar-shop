import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getSegments, createSegment } from '@/lib/services/crm/crm-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const segments = await getSegments();

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('CRM segments GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, segment_type, rules } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Segment name is required' },
        { status: 400 }
      );
    }

    if (!segment_type || !['manual', 'auto'].includes(segment_type)) {
      return NextResponse.json(
        { error: 'Segment type must be "manual" or "auto"' },
        { status: 400 }
      );
    }

    const segment = await createSegment({
      name: name.trim(),
      description: description?.trim(),
      segment_type,
      rules: rules || null,
    });

    return NextResponse.json({ segment }, { status: 201 });
  } catch (error) {
    console.error('CRM segments POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    );
  }
}
