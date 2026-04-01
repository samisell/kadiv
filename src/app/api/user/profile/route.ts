import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema } from '@/lib/validations/schemas';
import { authenticateRequest } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const user = await db.user.findUnique({
      where: { id: auth.payload.userId },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, emailVerified: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Aggregate dashboard stats
    const [bookingCount, upcomingCount, totalSpent, estimateCount] = await Promise.all([
      db.booking.count({ where: { userId: auth.payload.userId } }),
      db.booking.count({ where: { userId: auth.payload.userId, status: { in: ['confirmed', 'pending'] }, eventDate: { gte: new Date() } } }),
      db.payment.aggregate({ where: { userId: auth.payload.userId, status: 'paid' }, _sum: { amount: true } }),
      db.estimate.count({ where: { userId: auth.payload.userId } }),
    ]);

    return NextResponse.json({
      ...user,
      stats: {
        activeBookings: bookingCount,
        upcomingEvents: upcomingCount,
        totalSpent: totalSpent._sum.amount || 0,
        savedEstimates: estimateCount,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: auth.payload.userId },
      data: parsed.data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
