import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema } from '@/lib/validations/schemas';
import { authenticateRequest } from '@/lib/auth-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Verify the user is requesting their own data or is an admin
    if (auth.payload.userId !== id && auth.payload.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, emailVerified: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Verify the user is updating their own data or is an admin
    if (auth.payload.userId !== id && auth.payload.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
