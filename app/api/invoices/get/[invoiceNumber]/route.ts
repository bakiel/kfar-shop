import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number required' },
        { status: 400 }
      );
    }

    try {
      // Get invoice from database
      const { rows } = await query(
        `SELECT i.*,
          o.id as order_id, o.order_number, o.customer_name, o.customer_email,
          o.customer_phone, o.total as total_amount, o.status as order_status
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.id
        WHERE i.invoice_number = $1`,
        [invoiceNumber]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        invoice: rows[0]
      });
    } catch (dbError) {
      console.log('Database operation failed, returning not found');
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ Invoice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
