import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createEstimateSchema } from '@/lib/validations/schemas';
import { authenticateRequest } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const estimates = await db.estimate.findMany({
      where: { userId: auth.payload.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(estimates);
  } catch (error) {
    console.error('Get estimates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const parsed = createEstimateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const estimate = await db.estimate.create({
      data: {
        userId: auth.payload.userId,
        eventType: data.eventType,
        guestCount: data.guestCount,
        venueType: data.venueType || null,
        cateringPackage: data.cateringPackage || null,
        services: JSON.stringify(data.services || []),
        addOns: data.addOns ? JSON.stringify(data.addOns) : null,
        subtotal: data.subtotal || 0,
        serviceFee: data.serviceFee || 0,
        tax: data.tax || 0,
        totalCost: data.totalCost || 0,
      },
    });

    return NextResponse.json(estimate, { status: 201 });
  } catch (error) {
    console.error('Create estimate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('id');

    if (!estimateId) {
      return NextResponse.json({ error: 'Estimate ID is required' }, { status: 400 });
    }

    // Verify ownership
    const estimate = await db.estimate.findUnique({ where: { id: estimateId } });
    if (!estimate) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }
    if (estimate.userId !== auth.payload.userId && auth.payload.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db.estimate.delete({ where: { id: estimateId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete estimate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
