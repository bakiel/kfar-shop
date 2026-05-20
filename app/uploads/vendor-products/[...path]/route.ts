import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs';

const UPLOAD_ROOT = process.env.KFAR_UPLOAD_DIR || '/opt/kfar-uploads';

function isSafePathSegment(segment: string) {
  return Boolean(segment) && segment !== '..' && !segment.includes('/') && !segment.includes('\\');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments?.length || !segments.every(isSafePathSegment)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const root = path.resolve(UPLOAD_ROOT, 'vendor-products');
  const filePath = path.resolve(root, ...segments);
  if (!filePath.startsWith(`${root}${path.sep}`) || path.extname(filePath) !== '.webp') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
