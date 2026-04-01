import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { registerSchema } from '@/lib/validations/schemas';
import { signToken } from '@/lib/auth-helper';
import { sendEmail } from '@/lib/email';
import { verificationEmail, welcomeEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email: userEmail, password, name } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email: userEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(16).toString('hex');

    const user = await db.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: name || null,
        verificationToken,
      },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    });

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: Record<string, unknown> = {
      user,
      token,
    };

    // Send verification email (fire-and-forget — don't block the response)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;
    const verifyEmail = verificationEmail(user.name || 'Valued Customer', verificationToken, verificationUrl);
    sendEmail({ to: user.email, subject: verifyEmail.subject, html: verifyEmail.html, text: verifyEmail.text }).catch(() => {
      // Log but never throw — email delivery should not block registration
    });

    // Also send a welcome email
    const welcome = welcomeEmail(user.name || 'Valued Customer');
    sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html, text: welcome.text }).catch(() => {
      // Log but never throw
    });

    // Include verification token in development for testing
    if (process.env.NODE_ENV === 'development') {
      response.verificationToken = verificationToken;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
