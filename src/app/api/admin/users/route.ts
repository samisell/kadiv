import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users — List all users with booking count and search
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users — Delete user by query param id
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User id is required as query param' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true, estimates: true, payments: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for active bookings (pending or confirmed)
    const activeBookings = await db.booking.count({
      where: {
        userId: id,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: `Cannot delete user with ${activeBookings} active booking(s). Cancel bookings first.` },
        { status: 400 },
      );
    }

    // Cascade delete related records
    await db.chatMessage.deleteMany({
      where: {
        conversation: { userId: id },
      },
    });
    await db.conversation.deleteMany({
      where: { userId: id },
    });
    await db.payment.deleteMany({ where: { userId: id } });
    await db.estimate.deleteMany({ where: { userId: id } });
    await db.booking.deleteMany({ where: { userId: id } });
    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
