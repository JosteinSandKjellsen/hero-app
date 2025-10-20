import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

// Force dynamic rendering since we use request.url for query params
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// Public endpoint for fetching sessions
// Used for session selection on public pages (filtering heroes by location)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') === 'true';

    // Use raw SQL to bypass Prisma bugs with safe parameterization
    let sessions;
    
    if (activeOnly) {
      const now = new Date();
      sessions = await prisma.$queryRaw<Array<{
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
        WHERE active = true 
          AND "startDate" <= ${now}
          AND ("endDate" >= ${now} OR "endDate" IS NULL)
        ORDER BY active DESC, "startDate" DESC
      `;
    } else {
      sessions = await prisma.$queryRaw<Array<{
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
        ORDER BY active DESC, "startDate" DESC
      `;
    }

    // Get counts for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const heroCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::int as count
          FROM "LatestHero"
          WHERE "sessionId" = ${session.id}
        `;
        const statsCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::int as count
          FROM "HeroStats"
          WHERE "sessionId" = ${session.id}
        `;
        
        return {
          ...session,
          _count: {
            heroes: Number(heroCountResult[0]?.count || 0),
            stats: Number(statsCountResult[0]?.count || 0)
          }
        };
      })
    );

    return NextResponse.json(sessionsWithCounts, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}