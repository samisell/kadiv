import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';
import { generateCSV } from '@/lib/csv-export';

// GET /api/admin/export/payments — Export all payments as CSV
export async function GET(request: NextRequest) {
  // Admin auth check
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const payments = await db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: { select: { id: true, eventName: true } },
      },
    });

    const headers = [
      'Reference',
      'Amount',
      'Gateway',
      'Method',
      'Status',
      'Client',
      'Date',
      'Transaction ID',
    ];

    const rows = payments.map((p) => ({
      'Reference': p.id.substring(0, 8).toUpperCase(),
      'Amount': `₦${Number(p.amount).toLocaleString('en-NG')}`,
      'Gateway': p.gateway.charAt(0).toUpperCase() + p.gateway.slice(1),
      'Method': p.method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      'Status': p.status.charAt(0).toUpperCase() + p.status.slice(1),
      'Client': p.user.name || p.user.email,
      'Date': new Date(p.createdAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      'Transaction ID': p.transactionId || p.reference || '',
    }));

    const csv = generateCSV(headers, rows);
    const today = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments-export-${today}.csv"`,
      },
    });
  } catch (error) {
    console.error('Payments export error:', error);
    return NextResponse.json({ error: 'Failed to export payments' }, { status: 500 });
  }
}
