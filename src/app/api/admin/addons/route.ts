import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

const CONFIG_KEY = 'addons_data';

// GET /api/admin/addons — List add-ons
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const addons = config ? JSON.parse(config.value) : [];
    return NextResponse.json({ addons });
  } catch (error) {
    console.error('Admin addons GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch add-ons' }, { status: 500 });
  }
}

// PUT /api/admin/addons — Add or update add-ons
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { action, addon } = body;

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const addons: Array<Record<string, unknown>> = config ? JSON.parse(config.value) : [];

    if (action === 'add') {
      const newAddon = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: addon.name,
        description: addon.description || '',
        price: Number(addon.price) || 0,
      };
      addons.push(newAddon);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(addons) },
        create: { key: CONFIG_KEY, value: JSON.stringify(addons) },
      });
      return NextResponse.json({ addon: newAddon }, { status: 201 });
    }

    if (action === 'update') {
      const index = addons.findIndex((a) => a.id === addon.id);
      if (index === -1) return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
      addons[index] = { ...addons[index], ...addon };
      if (addon.price !== undefined) addons[index].price = Number(addon.price);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(addons) },
        create: { key: CONFIG_KEY, value: JSON.stringify(addons) },
      });
      return NextResponse.json({ addon: addons[index] });
    }

    if (action === 'delete') {
      const filtered = addons.filter((a) => a.id !== addon.id);
      if (filtered.length === addons.length) return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(filtered) },
        create: { key: CONFIG_KEY, value: JSON.stringify(filtered) },
      });
      return NextResponse.json({ success: true, message: 'Add-on deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin addons PUT error:', error);
    return NextResponse.json({ error: 'Failed to update add-ons' }, { status: 500 });
  }
}
