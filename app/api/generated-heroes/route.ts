import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { Prisma } from '@prisma/client';

// Force dynamic rendering since we use request.url for query params
export const dynamic = 'force-dynamic';

export type GeneratedHeroWithId = {
  id: number;
  name: string;
  userName: string | null;
  imageId: string;
  color: string;
  createdAt: Date;
  printed: boolean;
  carousel: boolean;
};

// GET /api/generated-heroes
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Parse pagination and filter parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const sessionId = searchParams.get('sessionId');
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    // Use raw SQL to bypass Prisma bugs completely
    const sessionFilter = (sessionId && sessionId !== 'all') 
      ? `WHERE "sessionId" = '${sessionId}'` 
      : '';

    const [countResult, generatedHeroes] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::int as count 
        FROM "LatestHero" 
        ${sessionFilter ? Prisma.raw(sessionFilter) : Prisma.empty}
      `,
      prisma.$queryRaw<Array<{
        id: number;
        name: string;
        userName: string | null;
        imageId: string;
        color: string;
        gender: string;
        personalityType: string;
        colorScores: Record<string, number>;
        createdAt: Date;
        printed: boolean;
        carousel: boolean;
        sessionId: string | null;
      }>>`
        SELECT 
          id, name, "userName", "imageId", color, gender, 
          "personalityType", "colorScores", "createdAt", 
          printed, carousel, "sessionId"
        FROM "LatestHero"
        ${sessionFilter ? Prisma.raw(sessionFilter) : Prisma.empty}
        ORDER BY "createdAt" DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `
    ]);

    const totalCount = Number(countResult[0].count);

    // Get unique session IDs from the heroes
    const sessionIds = Array.from(new Set(generatedHeroes.map(h => h.sessionId).filter((id): id is string => id !== null)));
    
    // Fetch sessions separately
    const sessions = sessionIds.length > 0 
      ? await prisma.session.findMany({
          where: { id: { in: sessionIds } },
          select: { id: true, name: true }
        })
      : [];
    
    // Create a session lookup map
    const sessionMap = new Map(sessions.map(s => [s.id, s.name]));

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / pageSize);

    // Ensure dates are serializable and add session names
    const serializedHeroes = generatedHeroes.map((hero) => ({
      ...hero,
      createdAt: hero.createdAt.toISOString(),
      session: hero.sessionId ? { name: sessionMap.get(hero.sessionId) || null } : null
    }));

    return NextResponse.json({
      heroes: serializedHeroes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Failed to fetch generated heroes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated heroes' },
      { status: 500 }
    );
  }
}
