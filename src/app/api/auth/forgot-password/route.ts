import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod/v4';
import { sendEmail } from '@/lib/email';
import { passwordResetEmail } from '@/lib/email-templates';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

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
        message: 'Password reset instructions sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email (fire-and-forget)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const pwdEmail = passwordResetEmail(user.name || 'Valued Customer', resetToken, resetUrl);
    sendEmail({ to: user.email, subject: pwdEmail.subject, html: pwdEmail.html, text: pwdEmail.text }).catch(() => {
      // Log but never throw — email delivery should not block the response
    });

    const response: Record<string, unknown> = {
      success: true,
      message: 'Password reset instructions sent',
    };

    // Include token in development for testing
    if (process.env.NODE_ENV === 'development') {
      response.token = resetToken;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
