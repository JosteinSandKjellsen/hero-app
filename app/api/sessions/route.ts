import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

// Force dynamic rendering since we use request.url for query params
export const dynamic = 'force-dynamic';

// Public endpoint for fetching sessions
// Used for session selection on public pages (filtering heroes by location)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') === 'true';

    let where = {};
    
    if (activeOnly) {
      const now = new Date();
      where = {
        active: true,
        startDate: {
          lte: now // Session has started
        },
        OR: [
          {
            endDate: {
              gte: now // Session hasn't ended
            }
          },
          {
            endDate: null // Sessions without end date are considered ongoing
          }
        ]
      };
    }

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