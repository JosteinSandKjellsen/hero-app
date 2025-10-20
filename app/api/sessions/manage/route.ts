import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';

// Force dynamic rendering - this is a write endpoint
export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const validatedData = CreateSessionSchema.parse(data);

    // Use raw SQL to bypass Prisma bugs
    const id = crypto.randomUUID();
    const now = new Date();
    
    await prisma.$executeRaw`
      INSERT INTO "Session" (id, name, description, "startDate", "endDate", active, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${validatedData.name},
        ${validatedData.description || null},
        ${new Date(validatedData.startDate)},
        ${new Date(validatedData.endDate)},
        true,
        ${now},
        ${now}
      )
    `;

    // Fetch the created session using raw SQL
    const sessions = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      description: string | null;
      startDate: Date;
      endDate: Date | null;
      active: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT id, name, description, "startDate", "endDate", active, "createdAt", "updatedAt"
      FROM "Session"
      WHERE id = ${id}
    `;

    return NextResponse.json(sessions[0]);
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

    // Build the update data object
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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Use raw SQL to bypass Prisma bugs, but with safe parameterization
    // Build separate update queries for each field to avoid SQL injection
    const now = new Date();
    
    await prisma.$transaction(async (tx) => {
      if (updateData.name !== undefined) {
        await tx.$executeRaw`UPDATE "Session" SET name = ${updateData.name}, "updatedAt" = ${now} WHERE id = ${validatedData.id}`;
      }
      if (updateData.description !== undefined) {
        await tx.$executeRaw`UPDATE "Session" SET description = ${updateData.description}, "updatedAt" = ${now} WHERE id = ${validatedData.id}`;
      }
      if (updateData.startDate !== undefined) {
        await tx.$executeRaw`UPDATE "Session" SET "startDate" = ${updateData.startDate}, "updatedAt" = ${now} WHERE id = ${validatedData.id}`;
      }
      if (updateData.endDate !== undefined) {
        await tx.$executeRaw`UPDATE "Session" SET "endDate" = ${updateData.endDate}, "updatedAt" = ${now} WHERE id = ${validatedData.id}`;
      }
      if (updateData.active !== undefined) {
        await tx.$executeRaw`UPDATE "Session" SET active = ${updateData.active}, "updatedAt" = ${now} WHERE id = ${validatedData.id}`;
      }
    });

    // Fetch the updated session using raw SQL
    const sessions = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      description: string | null;
      startDate: Date;
      endDate: Date | null;
      active: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT id, name, description, "startDate", "endDate", active, "createdAt", "updatedAt"
      FROM "Session"
      WHERE id = ${validatedData.id}
    `;

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Session not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json(sessions[0]);
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

    // Check if session exists and get counts using raw SQL
    const existingSessions = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      description: string | null;
    }>>`
      SELECT id, name, description
      FROM "Session"
      WHERE id = ${sessionId}
    `;

    if (existingSessions.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const existingSession = existingSessions[0];

    // Get hero count
    const heroCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::int as count
      FROM "LatestHero"
      WHERE "sessionId" = ${sessionId}
    `;
    const heroCount = Number(heroCountResult[0]?.count || 0);

    // Get stats count
    const statsCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::int as count
      FROM "HeroStats"
      WHERE "sessionId" = ${sessionId}
    `;
    const statsCount = Number(statsCountResult[0]?.count || 0);

    // Delete the session using raw SQL to bypass Prisma bugs
    await prisma.$executeRaw`
      DELETE FROM "Session"
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({ 
      success: true,
      message: `Session deleted successfully. ${heroCount} heroes and ${statsCount} stats remain in database.`,
      deletedSession: {
        id: existingSession.id,
        name: existingSession.name,
        heroCount,
        statsCount
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
