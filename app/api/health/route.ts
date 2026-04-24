import { NextResponse } from 'next/server';
import { isDbAvailable } from '@/lib/db/postgres-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbOk = await isDbAvailable();

  return NextResponse.json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: dbOk,
  });
}
