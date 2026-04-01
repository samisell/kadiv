import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod/v4';

const resendSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user by email
    const user = await db.user.findUnique({ where: { email } });

    // Don't reveal if email exists for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a verification email has been sent',
      });
    }

    // If already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(16).toString('hex');

    await db.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    const response: Record<string, unknown> = {
      success: true,
      message: 'Verification email sent',
    };

    // Include token in development for testing
    if (process.env.NODE_ENV === 'development') {
      response.token = verificationToken;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
