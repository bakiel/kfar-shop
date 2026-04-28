import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Vendor promotion submission coming soon' }, { status: 501 });
}
