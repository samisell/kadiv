import { authenticateRequest } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/stats — Aggregated admin dashboard stats
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const [
      totalUsers,
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      unreadMessages,
      totalPayments,
      paidPayments,
      totalRevenue,
      totalEstimates,
      newsletterSubscribers,
      recentBookings,
    ] = await Promise.all([
      db.user.count(),
      db.booking.count(),
      db.booking.count({ where: { status: 'pending' } }),
      db.booking.count({ where: { status: 'completed' } }),
      db.booking.count({ where: { status: 'cancelled' } }),
      db.contactMessage.count({ where: { isRead: false } }),
      db.payment.count(),
      db.payment.count({ where: { status: 'paid' } }),
      db.payment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
      db.estimate.count(),
      db.newsletter.count({ where: { isActive: true } }),
      db.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    // Bookings by event type
    const bookingsByType = await db.booking.groupBy({
      by: ['eventType'],
      _count: { id: true },
      _sum: { totalCost: true },
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPayments = await db.payment.findMany({
      where: { status: 'paid', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const p of recentPayments) {
      const key = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount;
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        unreadMessages,
        totalPayments,
        paidPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalEstimates,
        newsletterSubscribers,
      },
      bookingsByType,
      monthlyRevenue,
      recentBookings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
