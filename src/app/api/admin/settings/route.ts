import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helper';

// GET /api/admin/settings — Fetch all site settings
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const configs = await db.siteConfig.findMany();
    const settings: Record<string, string> = {};
    for (const c of configs) {
      settings[c.key] = c.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/admin/settings — Update site settings (upsert)
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const entries = Object.entries(body) as [string, string][];

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No settings provided' }, { status: 400 });
    }

    for (const [key, value] of entries) {
      await db.siteConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Admin settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
