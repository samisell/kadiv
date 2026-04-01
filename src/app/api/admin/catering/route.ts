import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

const CONFIG_KEY = 'catering_data';

// GET /api/admin/catering — List catering packages
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const packages = config ? JSON.parse(config.value) : [];
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Admin catering GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch catering packages' }, { status: 500 });
  }
}

// PUT /api/admin/catering — Add or update catering packages
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { action, pkg } = body;

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const packages: Array<Record<string, unknown>> = config ? JSON.parse(config.value) : [];

    if (action === 'add') {
      const newPkg = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: pkg.name,
        description: pkg.description || '',
        pricePerGuest: Number(pkg.pricePerGuest) || 0,
      };
      packages.push(newPkg);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(packages) },
        create: { key: CONFIG_KEY, value: JSON.stringify(packages) },
      });
      return NextResponse.json({ package: newPkg }, { status: 201 });
    }

    if (action === 'update') {
      const index = packages.findIndex((p) => p.id === pkg.id);
      if (index === -1) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
      packages[index] = { ...packages[index], ...pkg };
      if (pkg.pricePerGuest !== undefined) packages[index].pricePerGuest = Number(pkg.pricePerGuest);

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(packages) },
        create: { key: CONFIG_KEY, value: JSON.stringify(packages) },
      });
      return NextResponse.json({ package: packages[index] });
    }

    if (action === 'delete') {
      const filtered = packages.filter((p) => p.id !== pkg.id);
      if (filtered.length === packages.length) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

      await db.siteConfig.upsert({
        where: { key: CONFIG_KEY },
        update: { value: JSON.stringify(filtered) },
        create: { key: CONFIG_KEY, value: JSON.stringify(filtered) },
      });
      return NextResponse.json({ success: true, message: 'Package deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin catering PUT error:', error);
    return NextResponse.json({ error: 'Failed to update catering' }, { status: 500 });
  }
}
