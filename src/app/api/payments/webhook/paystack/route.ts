import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackWebhook, verifyPaystack } from '@/lib/payment-gateways';

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();

    // Get signature from header
    const signature = request.headers.get('x-paystack-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifyPaystackWebhook(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse JSON body
    const body = JSON.parse(rawBody);
    const { data } = body;

    // Paystack sends 'charge.success' event on successful payment
    if (body.event !== 'charge.success' || !data?.reference) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // Verify with Paystack API
    const verification = await verifyPaystack(data.reference);

    if ('error' in verification) {
      console.error('Paystack webhook verification failed:', verification.error);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Find payment by reference
    const payment = await db.payment.findFirst({
      where: { reference: data.reference },
    });

    if (!payment) {
      console.warn(`Paystack webhook: Payment with reference ${data.reference} not found`);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment based on verification status
    const gwStatus = verification.status;
    const newPaymentStatus = gwStatus === 'success' ? 'paid' : gwStatus === 'failed' ? 'failed' : payment.status;

    const paidAt = newPaymentStatus === 'paid' ? new Date() : undefined;

    // Convert paidAt string from Paystack to Date if available
    let paidDate = paidAt;
    if (!paidDate && verification.paidAt) {
      paidDate = new Date(verification.paidAt);
    }

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        transactionId: data.id ? String(data.id) : payment.transactionId,
        method: verification.channel || payment.method,
        customerEmail: verification.customerEmail || payment.customerEmail,
        customerName: verification.customerName || payment.customerName,
        metadata: JSON.stringify(body),
        ...(paidDate && { paidAt: paidDate }),
      },
    });

    // If payment is now paid and has a booking, update booking status
    if (updatedPayment.status === 'paid' && updatedPayment.bookingId) {
      await db.booking.update({
        where: { id: updatedPayment.bookingId },
        data: { status: 'confirmed' },
      });
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
