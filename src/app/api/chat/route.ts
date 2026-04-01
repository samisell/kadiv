import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

// GET /api/chat — Get or create conversation for current user, return with messages
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const userId = auth.payload.userId;

    // Find existing open conversation
    let conversation = await db.conversation.findFirst({
      where: {
        userId,
        status: { in: ['open', 'resolved'] },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    // If no conversation, create one
    if (!conversation) {
      conversation = await db.conversation.create({
        data: { userId },
        include: { messages: true },
      });
    }

    // Mark admin messages as read (user is reading them)
    await db.chatMessage.updateMany({
      where: {
        conversationId: conversation.id,
        senderType: 'admin',
        isRead: false,
      },
      data: { isRead: true },
    });

    // Reset user unread count
    await db.conversation.update({
      where: { id: conversation.id },
      data: { userUnreadCount: 0 },
    });

    // Re-fetch with updated read state
    const updated = await db.conversation.findUnique({
      where: { id: conversation.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json({
      conversationId: updated!.id,
      status: updated!.status,
      messages: updated!.messages,
    });
  } catch (error) {
    console.error('User chat GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// POST /api/chat — Send a message from user
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const userId = auth.payload.userId;
    const body = await request.json();
    const { content, conversationId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Find or create conversation
    let convId = conversationId;
    if (!convId) {
      let conv = await db.conversation.findFirst({
        where: {
          userId,
          status: { in: ['open', 'resolved'] },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
      if (!conv) {
        conv = await db.conversation.create({ data: { userId } });
      }
      convId = conv.id;
    }

    // If conversation was closed, reopen it
    const existing = await db.conversation.findUnique({ where: { id: convId } });
    if (existing && existing.status === 'closed') {
      await db.conversation.update({
        where: { id: convId },
        data: { status: 'open' },
      });
    }

    const message = await db.chatMessage.create({
      data: {
        conversationId: convId,
        senderType: 'user',
        senderId: userId,
        senderName: auth.payload.email,
        content: content.trim(),
      },
    });

    // Update conversation
    await db.conversation.update({
      where: { id: convId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        adminUnreadCount: { increment: 1 },
      },
    });

    return NextResponse.json({ message, conversationId: convId }, { status: 201 });
  } catch (error) {
    console.error('User chat POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
