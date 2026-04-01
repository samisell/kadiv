import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

type RouteContext = { params: Promise<{ conversationId: string }> };

// GET /api/admin/chat/[conversationId] — Get messages for a conversation
export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { conversationId } = await context.params;

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Mark admin messages as read (the admin is reading them)
    await db.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: 'user',
        isRead: false,
      },
      data: { isRead: true },
    });

    // Reset admin unread count
    await db.conversation.update({
      where: { id: conversationId },
      data: { adminUnreadCount: 0 },
    });

    // Assign admin to conversation
    if (!conversation.adminId) {
      await db.conversation.update({
        where: { id: conversationId },
        data: { adminId: auth.payload.userId },
      });
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        status: conversation.status,
        user: conversation.user,
        adminUnreadCount: conversation.adminUnreadCount,
        userUnreadCount: conversation.userUnreadCount,
        createdAt: conversation.createdAt,
      },
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('Admin chat conversation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// POST /api/admin/chat/[conversationId] — Send a message as admin
export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { conversationId } = await context.params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Create the message
    const message = await db.chatMessage.create({
      data: {
        conversationId,
        senderType: 'admin',
        senderId: auth.payload.userId,
        senderName: auth.payload.email,
        content: content.trim(),
      },
    });

    // Update conversation
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        userUnreadCount: { increment: 1 },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Admin chat conversation POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PATCH /api/admin/chat/[conversationId] — Update conversation status
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { conversationId } = await context.params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['open', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be open, resolved, or closed.' }, { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const updated = await db.conversation.update({
      where: { id: conversationId },
      data: { status },
    });

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error('Admin chat conversation PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}
