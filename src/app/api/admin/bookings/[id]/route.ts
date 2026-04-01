import { authenticateRequest } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
});

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/bookings/[id] — Update booking status
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 },
      );
    }

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 },
      );
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Admin update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/bookings/[id] — Delete booking and cascade payments
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await context.params;

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 },
      );
    }

    // Cascade delete payments first, then booking
    await db.payment.deleteMany({ where: { bookingId: id } });
    await db.booking.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Admin delete booking error:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 },
    );
  }
}
