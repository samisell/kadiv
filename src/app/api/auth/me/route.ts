import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request as unknown as import('next/server').NextRequest);
    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;

    // Fetch full user profile
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Aggregate dashboard stats
    const [activeBookings, upcomingEvents, totalSpentResult, savedEstimates] = await Promise.all([
      db.booking.count({
        where: {
          userId: payload.userId,
          status: { in: ['confirmed', 'pending'] },
        },
      }),
      db.booking.count({
        where: {
          userId: payload.userId,
          status: { in: ['confirmed', 'pending'] },
          eventDate: { gte: new Date() },
        },
      }),
      db.payment.aggregate({
        where: { userId: payload.userId, status: 'paid' },
        _sum: { amount: true },
      }),
      db.estimate.count({
        where: { userId: payload.userId },
      }),
    ]);

    return NextResponse.json({
      user,
      stats: {
        activeBookings,
        upcomingEvents,
        totalSpent: totalSpentResult._sum.amount || 0,
        savedEstimates,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
