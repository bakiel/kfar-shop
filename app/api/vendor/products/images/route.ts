import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { verifyAccessToken } from '@/lib/services/auth-service';

export const runtime = 'nodejs';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const UPLOAD_ROOT = process.env.KFAR_UPLOAD_DIR || '/opt/kfar-uploads';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'vendor';
}

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files').filter((entry): entry is File => (
      typeof entry === 'object' && entry !== null && 'arrayBuffer' in entry && 'size' in entry
    ));
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No image files provided' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ success: false, error: `Upload up to ${MAX_FILES} images at a time` }, { status: 400 });
    }

    const now = new Date();
    const vendorSegment = safeSegment(user.vendorId);
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const uploadDir = path.join(UPLOAD_ROOT, 'vendor-products', vendorSegment, year, month);
    await fs.mkdir(uploadDir, { recursive: true });

    const images = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ success: false, error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: 'Each image must be 5MB or smaller' }, { status: 400 });
      }

      const input = Buffer.from(await file.arrayBuffer());
      const image = sharp(input, { failOn: 'warning' }).rotate();
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height) {
        return NextResponse.json({ success: false, error: 'Invalid image file' }, { status: 400 });
      }

      const filename = `${randomUUID()}.webp`;
      const diskPath = path.join(uploadDir, filename);
      const output = await image
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(diskPath);

      images.push({
        url: `/uploads/vendor-products/${vendorSegment}/${year}/${month}/${filename}`,
        width: output.width,
        height: output.height,
      });
    }

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error('Vendor product image upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload product image' },
      { status: 500 }
    );
  }
}
