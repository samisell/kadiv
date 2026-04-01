import crypto from 'crypto';

// ─── Reference Generator ───

/**
 * Generate a unique payment reference with the given prefix.
 * Format: {prefix}-{timestamp}-{random}
 */
export function generatePaymentReference(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ─── Flutterwave ───

interface FlutterwaveInitParams {
  amount: number;
  email: string;
  name: string;
  reference: string;
  redirectUrl: string;
  currency?: string;
}

export async function initializeFlutterwave(
  params: FlutterwaveInitParams
): Promise<{ paymentUrl: string; reference: string } | { error: string }> {
  try {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return { error: 'Flutterwave secret key is not configured' };
    }

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: params.reference,
        amount: params.amount,
        currency: params.currency || 'NGN',
        redirect_url: params.redirectUrl,
        customer: {
          email: params.email,
          name: params.name,
        },
        customizations: {
          title: 'KADIV Events',
        },
      }),
    });

    const data = await response.json();

    if (data.status === 'success' && data.data?.link) {
      return {
        paymentUrl: data.data.link,
        reference: params.reference,
      };
    }

    return { error: data.message || 'Failed to initialize Flutterwave transaction' };
  } catch (error) {
    console.error('Flutterwave initialize error:', error);
    return { error: 'Failed to connect to Flutterwave' };
  }
}

interface FlutterwaveVerifyResult {
  status: string;
  amount: number;
  reference: string;
  customerEmail: string;
  customerName: string;
  paymentType: string;
}

export async function verifyFlutterwave(
  transactionId: string
): Promise<FlutterwaveVerifyResult | { error: string }> {
  try {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return { error: 'Flutterwave secret key is not configured' };
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === 'success' && data.data) {
      const tx = data.data;
      return {
        status: tx.status,
        amount: tx.amount,
        reference: tx.tx_ref,
        customerEmail: tx.customer?.email || '',
        customerName: tx.customer?.name || '',
        paymentType: tx.payment_type || '',
      };
    }

    return { error: data.message || 'Transaction verification failed' };
  } catch (error) {
    console.error('Flutterwave verify error:', error);
    return { error: 'Failed to verify Flutterwave transaction' };
  }
}

/**
 * Verify Flutterwave webhook signature.
 * Compares SHA512(payload) using FLUTTERWAVE_WEBHOOK_SECRET against the verif-hash header.
 */
export function verifyFlutterwaveWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret) return false;

  const hash = crypto.createHash('sha512').update(payload, 'utf8').digest('hex');
  return hash === signature;
}

// ─── Paystack ───

interface PaystackInitParams {
  amount: number; // in kobo (smallest currency unit)
  email: string;
  reference: string;
  redirectUrl: string;
  currency?: string;
}

export async function initializePaystack(
  params: PaystackInitParams
): Promise<{ authorizationUrl: string; reference: string } | { error: string }> {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { error: 'Paystack secret key is not configured' };
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        callback_url: params.redirectUrl,
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
        currency: params.currency || 'NGN',
      }),
    });

    const data = await response.json();

    if (data.status && data.data?.authorization_url) {
      return {
        authorizationUrl: data.data.authorization_url,
        reference: params.reference,
      };
    }

    return { error: data.message || 'Failed to initialize Paystack transaction' };
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return { error: 'Failed to connect to Paystack' };
  }
}

interface PaystackVerifyResult {
  status: string;
  amount: number; // in kobo
  reference: string;
  customerEmail: string;
  customerName: string;
  paidAt: string;
  channel: string;
}

export async function verifyPaystack(
  reference: string
): Promise<PaystackVerifyResult | { error: string }> {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { error: 'Paystack secret key is not configured' };
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.status && data.data) {
      const tx = data.data;
      return {
        status: tx.status,
        amount: tx.amount,
        reference: tx.reference,
        customerEmail: tx.customer?.email || '',
        customerName: tx.customer?.first_name
          ? `${tx.customer.first_name} ${tx.customer.last_name || ''}`.trim()
          : '',
        paidAt: tx.paid_at || '',
        channel: tx.channel || '',
      };
    }

    return { error: data.message || 'Transaction verification failed' };
  } catch (error) {
    console.error('Paystack verify error:', error);
    return { error: 'Failed to verify Paystack transaction' };
  }
}

/**
 * Verify Paystack webhook signature.
 * Computes SHA512 of raw payload using PAYSTACK_SECRET_KEY and compares to x-paystack-signature header.
 */
export function verifyPaystackWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const hash = crypto.createHmac('sha512', secret).update(payload, 'utf8').digest('hex');
  return hash === signature;
}
