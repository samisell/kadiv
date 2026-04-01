import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createBookingSchema } from '@/lib/validations/schemas';
import { authenticateRequest } from '@/lib/auth-helper';
import { sendEmail } from '@/lib/email';
import { bookingConfirmationEmail } from '@/lib/email-templates';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const bookings = await db.booking.findMany({
      where: { userId: auth.payload.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          select: { id: true, amount: true, status: true, method: true, createdAt: true },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const booking = await db.booking.create({
      data: {
        userId: auth.payload.userId,
        eventType: data.eventType,
        eventName: data.eventName,
        guestCount: data.guestCount,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        location: data.location || null,
        description: data.description || null,
        venueType: data.venueType || null,
        cateringPackage: data.cateringPackage || null,
        services: JSON.stringify(data.services || []),
        addOns: data.addOns ? JSON.stringify(data.addOns) : null,
        totalCost: data.totalCost || 0,
        notes: data.notes || null,
      },
    });

    // Send booking confirmation email (fire-and-forget)
    const user = await db.user.findUnique({ where: { id: auth.payload.userId }, select: { name: true, email: true } });
    if (user) {
      const bookingEmail = bookingConfirmationEmail(
        user.name || 'Valued Customer',
        booking.eventName,
        booking.eventType,
        booking.eventDate?.toISOString() || '',
        booking.location || '',
        booking.totalCost,
        booking.id,
      );
      sendEmail({ to: user.email, subject: bookingEmail.subject, html: bookingEmail.html, text: bookingEmail.text }).catch(() => {
        // Log but never throw
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
