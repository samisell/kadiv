import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

const CONFIG_KEY = 'locations_data';

// GET /api/admin/locations — List location groups with their locations
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const groups = config ? JSON.parse(config.value) : [];
    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Admin locations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// PUT /api/admin/locations — Add/update/delete location groups and their locations
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { action } = body;

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const groups: Array<Record<string, unknown>> = config ? JSON.parse(config.value) : [];

    if (action === 'add_group') {
      const newGroup = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: body.name,
        locations: [],
      };
      groups.push(newGroup);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(groups) },
        create: { key: CONFIG_KEY, value: JSON.stringify(groups) },
      });
      return NextResponse.json({ group: newGroup }, { status: 201 });
    }

    if (action === 'delete_group') {
      const filtered = groups.filter((g) => g.id !== body.groupId);
      if (filtered.length === groups.length) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(filtered) },
        create: { key: CONFIG_KEY, value: JSON.stringify(filtered) },
      });
      return NextResponse.json({ success: true, message: 'Group deleted' });
    }

    if (action === 'add_location') {
      const group = groups.find((g) => g.id === body.groupId);
      if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

      const locs = (group.locations as Array<Record<string, unknown>>) || [];
      const newLoc = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        value: body.value,
        label: body.label,
      };
      locs.push(newLoc);
      group.locations = locs;

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(groups) },
        create: { key: CONFIG_KEY, value: JSON.stringify(groups) },
      });
      return NextResponse.json({ location: newLoc }, { status: 201 });
    }

    if (action === 'update_location') {
      const group = groups.find((g) => g.id === body.groupId);
      if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

      const locs = (group.locations as Array<Record<string, unknown>>) || [];
      const locIndex = locs.findIndex((l) => l.id === body.locationId);
      if (locIndex === -1) return NextResponse.json({ error: 'Location not found' }, { status: 404 });

      locs[locIndex] = { ...locs[locIndex], value: body.value, label: body.label };
      group.locations = locs;

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(groups) },
        create: { key: CONFIG_KEY, value: JSON.stringify(groups) },
      });
      return NextResponse.json({ location: locs[locIndex] });
    }

    if (action === 'delete_location') {
      const group = groups.find((g) => g.id === body.groupId);
      if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

      const locs = (group.locations as Array<Record<string, unknown>>) || [];
      const filteredLocs = locs.filter((l) => l.id !== body.locationId);
      if (filteredLocs.length === locs.length) return NextResponse.json({ error: 'Location not found' }, { status: 404 });

      group.locations = filteredLocs;

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(groups) },
        create: { key: CONFIG_KEY, value: JSON.stringify(groups) },
      });
      return NextResponse.json({ success: true, message: 'Location deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin locations PUT error:', error);
    return NextResponse.json({ error: 'Failed to update locations' }, { status: 500 });
  }
}
