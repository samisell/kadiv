import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const message = await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        eventType: parsed.data.eventType || null,
        preferredDate: parsed.data.preferredDate || null,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ success: true, id: message.id }, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
