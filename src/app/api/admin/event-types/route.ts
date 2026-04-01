import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';

// ── Types ────────────────────────────────────────────────────────────────────
interface EventType {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
}

const CONFIG_KEY = 'event_types_data';

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getEventTypes(): Promise<EventType[]> {
  const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
  if (!config) return [];
  try {
    return JSON.parse(config.value) as EventType[];
  } catch {
    return [];
  }
}

async function saveEventTypes(types: EventType[]) {
  await db.siteConfig.upsert({
    where: { key: CONFIG_KEY },
    update: { value: JSON.stringify(types) },
    create: { key: CONFIG_KEY, value: JSON.stringify(types) },
  });
}

// ── GET /api/admin/event-types ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
  }

  try {
    const eventTypes = await getEventTypes();
    return NextResponse.json({ eventTypes });
  } catch (error) {
    console.error('Failed to fetch event types:', error);
    return NextResponse.json({ error: 'Failed to fetch event types' }, { status: 500 });
  }
}

// ── POST /api/admin/event-types ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, icon, image } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const eventTypes = await getEventTypes();

    // Generate a slug-style id from the name
    const id = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure unique id
    const existingIds = new Set(eventTypes.map((et) => et.id));
    let finalId = id;
    let counter = 1;
    while (existingIds.has(finalId)) {
      finalId = `${id}-${counter}`;
      counter++;
    }

    const newEventType: EventType = {
      id: finalId,
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      icon: typeof icon === 'string' ? icon.trim() : '',
      image: typeof image === 'string' ? image.trim() : '',
    };

    eventTypes.push(newEventType);
    await saveEventTypes(eventTypes);

    return NextResponse.json({ eventType: newEventType }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event type:', error);
    return NextResponse.json({ error: 'Failed to create event type' }, { status: 500 });
  }
}

// ── PUT /api/admin/event-types ──────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, description, icon, image } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Event type id is required' }, { status: 400 });
    }

    const eventTypes = await getEventTypes();
    const index = eventTypes.findIndex((et) => et.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 });
    }

    const existing = eventTypes[index];

    // Apply partial updates
    const updated: EventType = {
      id: existing.id,
      name: typeof name === 'string' && name.trim().length > 0 ? name.trim() : existing.name,
      description: typeof description === 'string' ? description.trim() : existing.description,
      icon: typeof icon === 'string' ? icon.trim() : existing.icon,
      image: typeof image === 'string' ? image.trim() : existing.image,
    };

    eventTypes[index] = updated;
    await saveEventTypes(eventTypes);

    return NextResponse.json({ eventType: updated });
  } catch (error) {
    console.error('Failed to update event type:', error);
    return NextResponse.json({ error: 'Failed to update event type' }, { status: 500 });
  }
}

// ── DELETE /api/admin/event-types?id=xxx ────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  if (auth.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event type id is required as query parameter' }, { status: 400 });
    }

    const eventTypes = await getEventTypes();
    const index = eventTypes.findIndex((et) => et.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 });
    }

    eventTypes.splice(index, 1);
    await saveEventTypes(eventTypes);

    return NextResponse.json({ success: true, message: 'Event type deleted' });
  } catch (error) {
    console.error('Failed to delete event type:', error);
    return NextResponse.json({ error: 'Failed to delete event type' }, { status: 500 });
  }
}
