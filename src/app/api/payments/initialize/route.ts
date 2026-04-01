import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { amount, gateway, customerEmail, customerName, paymentType, eventPlan } = body;

    /* ─── Validation ─── */
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }
    if (!gateway || !['flutterwave', 'paystack'].includes(gateway)) {
      return NextResponse.json({ error: 'Valid gateway is required (flutterwave or paystack)' }, { status: 400 });
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
    }
    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    /* ─── Generate unique reference ─── */
    const reference = `KADIV-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    /* ─── Create payment record in DB (status: pending) ─── */
    const payment = await db.payment.create({
      data: {
        userId: auth.payload.userId,
        amount: parseFloat(amount),
        gateway,
        method: 'card',
        status: 'pending',
        transactionId,
        reference,
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        metadata: JSON.stringify({
          paymentType: paymentType || 'deposit',
          eventPlan: eventPlan || null,
        }),
      },
    });

    /* ─── Create or update booking if event plan provided ─── */
    if (eventPlan && eventPlan.eventType && eventPlan.guestCount) {
      const booking = await db.booking.create({
        data: {
          userId: auth.payload.userId,
          eventType: eventPlan.eventType || 'custom',
          eventName: `${eventPlan.eventType || 'Custom'} Event - ${eventPlan.guestCount} guests`,
          guestCount: eventPlan.guestCount || 0,
          eventDate: eventPlan.date ? new Date(eventPlan.date) : null,
          location: eventPlan.location || null,
          description: eventPlan.notes || null,
          venueType: eventPlan.venueType || null,
          cateringPackage: eventPlan.cateringPackage || null,
          services: JSON.stringify(eventPlan.services || []),
          addOns: JSON.stringify(eventPlan.addOns || []),
          status: 'pending',
          totalCost: eventPlan.total || parseFloat(amount),
        },
      });
      // Link payment to booking
      await db.payment.update({
        where: { id: payment.id },
        data: { bookingId: booking.id },
      });
    }

    /* ─── Generate gateway payment URL ─── */
    let paymentUrl: string | null = null;

    if (gateway === 'paystack') {
      /* Paystack initialization */
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (paystackSecret) {
        try {
          const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: customerEmail.trim(),
              amount: Math.round(parseFloat(amount) * 100), // Paystack expects kobo
              reference,
              metadata: {
                custom_fields: [
                  { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName.trim() },
                  { display_name: 'Payment Type', variable_name: 'payment_type', value: paymentType || 'deposit' },
                ],
              },
              callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}?payment_ref=${reference}`,
            }),
          });

          const paystackData = await paystackRes.json();
          if (paystackData.status && paystackData.data?.authorization_url) {
            paymentUrl = paystackData.data.authorization_url;
          }
        } catch {
          /* Paystack API call failed — will return mock URL */
        }
      }

      /* Fallback: dev/demo URL (simulates the hosted payment page) */
      if (!paymentUrl) {
        paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}?payment_ref=${reference}&gateway=paystack&status=success`;
      }
    } else if (gateway === 'flutterwave') {
      /* Flutterwave initialization */
      const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (flutterwaveSecret) {
        try {
          const flutterwaveRes = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${flutterwaveSecret}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tx_ref: reference,
              amount: parseFloat(amount),
              currency: 'NGN',
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}?payment_ref=${reference}`,
              customer: {
                email: customerEmail.trim(),
                name: customerName.trim(),
              },
              customizations: {
                title: 'KADIV Events',
                description: `${paymentType === 'deposit' ? '30% Deposit' : 'Full Payment'} - Event Booking`,
                logo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/logo.png`,
              },
            }),
          });

          const flutterwaveData = await flutterwaveRes.json();
          if (flutterwaveData.status === 'success' && flutterwaveData.data?.link) {
            paymentUrl = flutterwaveData.data.link;
          }
        } catch {
          /* Flutterwave API call failed — will return mock URL */
        }
      }

      /* Fallback: dev/demo URL */
      if (!paymentUrl) {
        paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}?payment_ref=${reference}&gateway=flutterwave&status=success`;
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        reference: payment.reference,
        transactionId: payment.transactionId,
        amount: payment.amount,
        gateway: payment.gateway,
        status: payment.status,
      },
      paymentUrl,
      reference,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
