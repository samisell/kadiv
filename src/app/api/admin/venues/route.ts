import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

const CONFIG_KEY = 'venues_data';

// GET /api/admin/venues — List venues
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const venues = config ? JSON.parse(config.value) : [];
    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Admin venues GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

// PUT /api/admin/venues — Add or update venues (full replace)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { action, venue } = body;

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const venues: Array<Record<string, unknown>> = config ? JSON.parse(config.value) : [];

    if (action === 'add') {
      const newVenue = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: venue.name,
        description: venue.description || '',
        price: Number(venue.price) || 0,
      };
      venues.push(newVenue);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(venues) },
        create: { key: CONFIG_KEY, value: JSON.stringify(venues) },
      });
      return NextResponse.json({ venue: newVenue }, { status: 201 });
    }

    if (action === 'update') {
      const index = venues.findIndex((v) => v.id === venue.id);
      if (index === -1) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      venues[index] = { ...venues[index], ...venue };
      if (venue.price !== undefined) venues[index].price = Number(venue.price);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(venues) },
        create: { key: CONFIG_KEY, value: JSON.stringify(venues) },
      });
      return NextResponse.json({ venue: venues[index] });
    }

    if (action === 'delete') {
      const filtered = venues.filter((v) => v.id !== venue.id);
      if (filtered.length === venues.length) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(filtered) },
        create: { key: CONFIG_KEY, value: JSON.stringify(filtered) },
      });
      return NextResponse.json({ success: true, message: 'Venue deleted' });
    }

    return NextResponse.json({ error: 'Invalid action. Use add, update, or delete.' }, { status: 400 });
  } catch (error) {
    console.error('Admin venues PUT error:', error);
    return NextResponse.json({ error: 'Failed to update venues' }, { status: 500 });
  }
}
