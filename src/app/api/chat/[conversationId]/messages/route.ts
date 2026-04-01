import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

type RouteContext = { params: Promise<{ conversationId: string }> };

// GET /api/chat/[conversationId]/messages — Get messages for a user conversation
export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { conversationId } = await context.params;
    const userId = auth.payload.userId;

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Mark admin messages as read
    await db.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: 'admin',
        isRead: false,
      },
      data: { isRead: true },
    });

    await db.conversation.update({
      where: { id: conversationId },
      data: { userUnreadCount: 0 },
    });

    const messages = await db.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages, status: conversation.status });
  } catch (error) {
    console.error('User chat messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
