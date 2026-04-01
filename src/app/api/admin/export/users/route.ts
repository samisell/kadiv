import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';
import { generateCSV } from '@/lib/csv-export';

// GET /api/admin/export/users — Export all users as CSV
export async function GET(request: NextRequest) {
  // Admin auth check
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Role',
      'Verified',
      'Active',
      'Joined',
      'Bookings Count',
    ];

    const rows = users.map((u) => ({
      'Name': u.name || '',
      'Email': u.email,
      'Phone': u.phone || '',
      'Role': u.role.charAt(0).toUpperCase() + u.role.slice(1),
      'Verified': u.emailVerified ? 'Yes' : 'No',
      'Active': u.isActive ? 'Yes' : 'No',
      'Joined': new Date(u.createdAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      'Bookings Count': u._count.bookings,
    }));

    const csv = generateCSV(headers, rows);
    const today = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${today}.csv"`,
      },
    });
  } catch (error) {
    console.error('Users export error:', error);
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}
