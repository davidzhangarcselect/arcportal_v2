import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const solicitationId = searchParams.get('solicitationId');

    if (!solicitationId) {
      return NextResponse.json({ error: 'Solicitation ID is required' }, { status: 400 });
    }

    const periods = await prisma.period.findMany({
      where: { solicitationId },
      orderBy: [
        { type: 'asc' }, // BASE first, then OPTION
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(periods);
  } catch (error) {
    console.error('Error fetching periods:', error);
    return NextResponse.json({ error: 'Failed to fetch periods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solicitationId, name, type, startDate, endDate } = body;

    if (!solicitationId || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const period = await prisma.period.create({
      data: {
        name,
        type: type.toUpperCase(),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        solicitationId
      }
    });

    return NextResponse.json(period);
  } catch (error) {
    console.error('Error creating period:', error);
    return NextResponse.json({ error: 'Failed to create period' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Period ID is required' }, { status: 400 });
    }

    const period = await prisma.period.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      }
    });

    return NextResponse.json(period);
  } catch (error) {
    console.error('Error updating period:', error);
    return NextResponse.json({ error: 'Failed to update period' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Period ID is required' }, { status: 400 });
    }

    // Check if period has associated CLINs
    const clinsCount = await prisma.clin.count({
      where: { periodId: id }
    });

    if (clinsCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete period with associated CLINs' 
      }, { status: 400 });
    }

    await prisma.period.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting period:', error);
    return NextResponse.json({ error: 'Failed to delete period' }, { status: 500 });
  }
}