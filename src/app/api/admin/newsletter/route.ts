import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/newsletter — Return all newsletter subscribers
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const [subscribers, total] = await Promise.all([
      db.newsletter.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      db.newsletter.count(),
    ]);

    return NextResponse.json({
      subscribers,
      total,
    });
  } catch (error) {
    console.error('Admin newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscribers' },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/newsletter — Toggle subscriber active status
export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;
  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Subscriber id is required' }, { status: 400 });
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    const subscriber = await db.newsletter.findUnique({ where: { id } });
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    const updated = await db.newsletter.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin newsletter PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

// DELETE /api/admin/newsletter — Delete subscriber by query param id
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
      return NextResponse.json({ error: 'Subscriber id is required as query param' }, { status: 400 });
    }

    const subscriber = await db.newsletter.findUnique({ where: { id } });
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    await db.newsletter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin newsletter DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
