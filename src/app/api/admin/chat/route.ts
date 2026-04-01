import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

// GET /api/admin/chat — List all chat conversations for admin
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const conversations = await db.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
    });

    // Attach the last message info to each conversation
    const result = conversations.map((conv) => ({
      id: conv.id,
      userId: conv.userId,
      user: conv.user,
      status: conv.status,
      lastMessage: conv.messages[0]?.content || conv.lastMessage || null,
      lastMessageAt: conv.lastMessageAt,
      userUnreadCount: conv.userUnreadCount,
      adminUnreadCount: conv.adminUnreadCount,
      createdAt: conv.createdAt,
    }));

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error('Admin chat GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
