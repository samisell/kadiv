import { authenticateRequest } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/overview — Aggregated dashboard stats
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const [
      totalBookings,
      activeUsers,
      pendingMessages,
      totalRevenueResult,
      recentBookings,
      recentMessages,
    ] = await Promise.all([
      db.booking.count(),
      db.user.count(),
      db.contactMessage.count({ where: { isRead: false } }),
      db.payment.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
      db.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true, email: true, avatar: true } },
        },
      }),
      db.contactMessage.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalRevenue = totalRevenueResult._sum.amount || 0;

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPayments = await db.payment.findMany({
      where: {
        status: 'paid',
        createdAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, createdAt: true },
    });

    // Group by month (YYYY-MM format)
    const monthlyMap: Record<string, number> = {};
    for (const payment of recentPayments) {
      const key = payment.createdAt.toISOString().substring(0, 7);
      monthlyMap[key] = (monthlyMap[key] || 0) + payment.amount;
    }

    // Build array of last 6 months with labels
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenue.push({
        month: label,
        revenue: monthlyMap[key] || 0,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalBookings,
      activeUsers,
      pendingMessages,
      recentBookings,
      recentMessages,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 },
    );
  }
}
