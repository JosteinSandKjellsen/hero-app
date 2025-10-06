import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';

const CreateSessionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

const UpdateSessionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  active: z.boolean().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') === 'true';

    const where = activeOnly ? { active: true } : {};

    const sessions = await prisma.session.findMany({
      where,
      orderBy: [
        { active: 'desc' },
        { startDate: 'desc' }
      ],
      include: {
        _count: {
          select: {
            heroes: true,
            stats: true
          }
        }
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const validatedData = CreateSessionSchema.parse(data);

    const session = await prisma.session.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const validatedData = UpdateSessionSchema.parse(data);

    const updateData: Partial<{
      name: string;
      description: string | null;
      startDate: Date;
      endDate: Date | null;
      active: boolean;
    }> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate);
    if (validatedData.active !== undefined) updateData.active = validatedData.active;

    const session = await prisma.session.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: {
            heroes: true,
            stats: true
          }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Delete the session (heroes and stats will keep their sessionId references)
    await prisma.session.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ 
      success: true,
      message: `Session deleted successfully. ${existingSession._count.heroes} heroes and ${existingSession._count.stats} stats remain in database.`,
      deletedSession: {
        id: existingSession.id,
        name: existingSession.name,
        heroCount: existingSession._count.heroes,
        statsCount: existingSession._count.stats
      }
    });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}