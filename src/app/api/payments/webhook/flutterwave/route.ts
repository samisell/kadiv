import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyFlutterwaveWebhook, verifyFlutterwave } from '@/lib/payment-gateways';

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();

    // Get signature from header
    const signature = request.headers.get('verif-hash');
    if (!signature) {
      return NextResponse.json({ error: 'Missing verification hash' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifyFlutterwaveWebhook(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse JSON body
    const body = JSON.parse(rawBody);
    const { data } = body;

    if (!data?.id || !data?.tx_ref) {
      return NextResponse.json({ error: 'Missing required fields in webhook payload' }, { status: 400 });
    }

    // Verify with Flutterwave API
    const verification = await verifyFlutterwave(String(data.id));

    if ('error' in verification) {
      console.error('Flutterwave webhook verification failed:', verification.error);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Find payment by reference (tx_ref)
    const payment = await db.payment.findFirst({
      where: { reference: data.tx_ref },
    });

    if (!payment) {
      console.warn(`Flutterwave webhook: Payment with reference ${data.tx_ref} not found`);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment based on verification status
    const gwStatus = verification.status;
    const newPaymentStatus = gwStatus === 'successful' ? 'paid' : gwStatus === 'failed' ? 'failed' : payment.status;

    const paidAt = newPaymentStatus === 'paid' ? new Date() : undefined;

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        transactionId: String(data.id),
        method: verification.paymentType || payment.method,
        customerEmail: verification.customerEmail || payment.customerEmail,
        customerName: verification.customerName || payment.customerName,
        metadata: JSON.stringify(body),
        ...(paidAt && { paidAt }),
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
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
