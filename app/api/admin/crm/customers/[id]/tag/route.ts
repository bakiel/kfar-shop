import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { addTag, removeTag } from '@/lib/services/crm/crm-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.tag || !body.tag.trim()) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }

    const tags = await addTag(
      id,
      body.tag.trim().toLowerCase(),
      user.displayName || user.email
    );

    return NextResponse.json({ tags }, { status: 201 });
  } catch (error) {
    console.error('CRM tag POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag query parameter is required' },
        { status: 400 }
      );
    }

    const tags = await removeTag(id, tag);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('CRM tag DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    );
  }
}
