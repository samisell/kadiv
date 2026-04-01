import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';
import { sendEmail } from '@/lib/email';
import { paymentReceiptEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { reference } = body;

    /* ─── Validation ─── */
    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    /* ─── Find payment in DB ─── */
    const payment = await db.payment.findFirst({
      where: {
        reference,
        userId: auth.payload.userId,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    /* ─── If already verified as paid, return cached result ─── */
    if (payment.status === 'paid') {
      return NextResponse.json({
        status: 'success',
        amount: payment.amount,
        reference: payment.reference,
        gateway: payment.gateway,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt?.toISOString() || null,
      });
    }

    /* ─── If already failed, return cached result ─── */
    if (payment.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        amount: payment.amount,
        reference: payment.reference,
        gateway: payment.gateway,
        transactionId: payment.transactionId,
      });
    }

    /* ─── Verify with the gateway ─── */
    let gatewayStatus: 'success' | 'failed' | 'pending' = 'pending';
    let gatewayTransactionId: string | null = null;

    if (payment.gateway === 'paystack') {
      /* Verify with Paystack */
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (paystackSecret) {
        try {
          const paystackRes = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
              headers: {
                Authorization: `Bearer ${paystackSecret}`,
              },
            }
          );
          const paystackData = await paystackRes.json();

          if (paystackData.status && paystackData.data) {
            if (paystackData.data.status === 'success') {
              gatewayStatus = 'success';
              gatewayTransactionId = paystackData.data.reference || payment.transactionId;
            } else if (['failed', 'abandoned', 'cancelled'].includes(paystackData.data.status)) {
              gatewayStatus = 'failed';
            }
          }
        } catch {
          /* Paystack verification failed — keep pending */
        }
      } else {
        /* No API key configured — simulate success in dev mode */
        gatewayStatus = 'success';
        gatewayTransactionId = payment.transactionId;
      }
    } else if (payment.gateway === 'flutterwave') {
      /* Verify with Flutterwave */
      const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (flutterwaveSecret) {
        try {
          const flutterwaveRes = await fetch(
            `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(reference)}/verify`,
            {
              headers: {
                Authorization: `Bearer ${flutterwaveSecret}`,
              },
            }
          );
          const flutterwaveData = await flutterwaveRes.json();

          if (flutterwaveData.status === 'success' && flutterwaveData.data) {
            if (flutterwaveData.data.status === 'successful') {
              gatewayStatus = 'success';
              gatewayTransactionId = flutterwaveData.data.id?.toString() || payment.transactionId;
            } else if (['failed', 'cancelled', 'error'].includes(flutterwaveData.data.status)) {
              gatewayStatus = 'failed';
            }
          }
        } catch {
          /* Flutterwave verification failed — keep pending */
        }
      } else {
        /* No API key configured — simulate success in dev mode */
        gatewayStatus = 'success';
        gatewayTransactionId = payment.transactionId;
      }
    }

    /* ─── Update payment record based on verification ─── */
    if (gatewayStatus === 'success') {
      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
          ...(gatewayTransactionId ? { transactionId: gatewayTransactionId } : {}),
        },
      });

      /* Update associated booking status if exists */
      if (payment.bookingId) {
        await db.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'confirmed' },
        });
      }

      /* Send payment receipt email (fire-and-forget) */
      const user = await db.user.findUnique({ where: { id: auth.payload.userId }, select: { name: true, email: true } });
      const booking = payment.bookingId
        ? await db.booking.findUnique({ where: { id: payment.bookingId }, select: { eventName: true } })
        : null;
      if (user) {
        const receiptEmail = paymentReceiptEmail(
          user.name || 'Valued Customer',
          updatedPayment.amount,
          updatedPayment.reference || '',
          updatedPayment.gateway,
          booking?.eventName || '',
          updatedPayment.paidAt?.toISOString() || new Date().toISOString(),
        );
        sendEmail({ to: user.email, subject: receiptEmail.subject, html: receiptEmail.html, text: receiptEmail.text }).catch(() => {
          // Log but never throw
        });
      }

      return NextResponse.json({
        status: 'success',
        amount: updatedPayment.amount,
        reference: updatedPayment.reference,
        gateway: updatedPayment.gateway,
        transactionId: updatedPayment.transactionId,
        paidAt: updatedPayment.paidAt?.toISOString() || null,
      });
    } else if (gatewayStatus === 'failed') {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });

      return NextResponse.json({
        status: 'failed',
        amount: payment.amount,
        reference: payment.reference,
        gateway: payment.gateway,
        transactionId: payment.transactionId,
      });
    }

    /* Still pending */
    return NextResponse.json({
      status: 'pending',
      amount: payment.amount,
      reference: payment.reference,
      gateway: payment.gateway,
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}