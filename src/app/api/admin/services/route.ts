import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

const CONFIG_KEY = 'services_data';

// GET /api/admin/services — List services (stored as JSON in SiteConfig)
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const services = config ? JSON.parse(config.value) : [];
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Admin services GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST /api/admin/services — Create a new service
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { name, description, startingPrice, icon, image } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    const services: Array<Record<string, unknown>> = config ? JSON.parse(config.value) : [];

    const newService = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      description,
      startingPrice: Number(startingPrice) || 0,
      icon: icon || 'Sparkles',
      image: image || '',
    };

    services.push(newService);

    await db.siteConfig.upsert({
      where: { key: CONFIG_KEY },
      update: { value: JSON.stringify(services) },
      create: { key: CONFIG_KEY, value: JSON.stringify(services) },
    });

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error('Admin services POST error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

// PUT /api/admin/services — Update a service
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    if (!config) {
      return NextResponse.json({ error: 'No services found' }, { status: 404 });
    }

    const services: Array<Record<string, unknown>> = JSON.parse(config.value);
    const index = services.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    services[index] = { ...services[index], ...updates };
    if (updates.startingPrice !== undefined) {
      services[index].startingPrice = Number(updates.startingPrice);
    }

    await db.siteConfig.update({
      where: { key: CONFIG_KEY },
      data: { value: JSON.stringify(services) },
    });

    return NextResponse.json({ service: services[index] });
  } catch (error) {
    console.error('Admin services PUT error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE /api/admin/services — Delete a service
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const config = await db.siteConfig.findUnique({ where: { key: CONFIG_KEY } });
    if (!config) {
      return NextResponse.json({ error: 'No services found' }, { status: 404 });
    }

    const services: Array<Record<string, unknown>> = JSON.parse(config.value);
    const filtered = services.filter((s) => s.id !== id);

    if (filtered.length === services.length) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    await db.siteConfig.update({
      where: { key: CONFIG_KEY },
      data: { value: JSON.stringify(filtered) },
    });

    return NextResponse.json({ success: true, message: 'Service deleted' }, { status: 200 });
  } catch (error) {
    console.error('Admin services DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}