import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';
import { generateCSV } from '@/lib/csv-export';

// GET /api/admin/export/bookings — Export all bookings as CSV
export async function GET(request: NextRequest) {
  // Admin auth check
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const headers = [
      'Reference',
      'Event Name',
      'Event Type',
      'Client',
      'Email',
      'Date',
      'Location',
      'Status',
      'Total Cost (₦)',
    ];

    const rows = bookings.map((b) => ({
      'Reference': b.id.substring(0, 8).toUpperCase(),
      'Event Name': b.eventName,
      'Event Type': b.eventType,
      'Client': b.user.name || '',
      'Email': b.user.email,
      'Date': b.eventDate
        ? new Date(b.eventDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'TBD',
      'Location': b.location || '',
      'Status': b.status.charAt(0).toUpperCase() + b.status.slice(1),
      'Total Cost (₦)': Number(b.totalCost).toLocaleString('en-NG'),
    }));

    const csv = generateCSV(headers, rows);
    const today = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bookings-export-${today}.csv"`,
      },
    });
  } catch (error) {
    console.error('Bookings export error:', error);
    return NextResponse.json({ error: 'Failed to export bookings' }, { status: 500 });
  }
}
