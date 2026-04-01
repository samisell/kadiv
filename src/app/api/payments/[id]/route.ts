import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { id } = await context.params;

    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            eventName: true,
            eventType: true,
            eventDate: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Ownership check: user must own the payment or be admin
    if (payment.userId !== auth.payload.userId && auth.payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    // Admin only
    if (auth.payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { status };

    // If setting to paid, set paidAt
    if (status === 'paid' && !payment.paidAt) {
      updateData.paidAt = new Date();
    }

    // If setting to refunded, clear paidAt
    if (status === 'refunded') {
      updateData.paidAt = null;
    }

    const updatedPayment = await db.payment.update({
      where: { id },
      data: updateData,
    });

    // If payment is now paid and has a booking, update booking status
    if (updatedPayment.status === 'paid' && updatedPayment.bookingId) {
      await db.booking.update({
        where: { id: updatedPayment.bookingId },
        data: { status: 'confirmed' },
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
