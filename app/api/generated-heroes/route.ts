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

    // Build where clause with session filtering
    const where: Prisma.LatestHeroWhereInput = {};
    if (sessionId && sessionId !== 'all') {
      where.sessionId = sessionId;
    }

    // Use a single transaction for count and data fetch to ensure consistency
    const [totalCount, generatedHeroes] = await prisma.$transaction([
      prisma.latestHero.count({ where }),
      prisma.latestHero.findMany({
        where,
        select: {
          id: true,
          name: true,
          userName: true,
          imageId: true,
          color: true,
          gender: true,
          personalityType: true,
          colorScores: true,
          createdAt: true,
          printed: true,
          carousel: true,
          sessionId: true,
          session: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      })
    ]);

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / pageSize);

    // Ensure dates are serializable
    const serializedHeroes = generatedHeroes.map((hero) => ({
      ...hero,
      createdAt: hero.createdAt.toISOString()
    }));

    return NextResponse.json({
      heroes: serializedHeroes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount
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
