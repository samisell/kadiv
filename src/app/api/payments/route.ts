import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const statusFilter = searchParams.get('status');
    const gatewayFilter = searchParams.get('gateway');

    const where: Record<string, unknown> = { userId: auth.payload.userId };
    if (bookingId) where.bookingId = bookingId;
    if (statusFilter) where.status = statusFilter;
    if (gatewayFilter) where.gateway = gatewayFilter;

    const payments = await db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const {
      bookingId,
      amount,
      method,
      status,
      gateway,
      reference,
      customerEmail,
      customerName,
    } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { error: 'amount and method are required' },
        { status: 400 }
      );
    }

    const payment = await db.payment.create({
      data: {
        userId: auth.payload.userId,
        bookingId: bookingId || null,
        amount: parseFloat(amount) || 0,
        method,
        status: status || 'pending',
        gateway: gateway || 'manual',
        reference: reference || null,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });

    // Update booking status if payment is successful
    if (payment.status === 'paid' && payment.bookingId) {
      await db.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
