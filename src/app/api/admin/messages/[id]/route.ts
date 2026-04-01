import { authenticateRequest } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

// DELETE /api/admin/messages/[id] — Delete a contact message
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await context.params;

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 },
      );
    }

    await db.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Admin delete message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 },
    );
  }
}
