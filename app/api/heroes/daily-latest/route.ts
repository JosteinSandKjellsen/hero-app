import { prisma } from '@/app/_lib/prisma';
import { Prisma } from '@prisma/client';
import { HeroColor } from '@/app/_lib/types/api';

export interface DailyHero {
  id: number;
  name: string;
  userName: string | null;
  personalityType: string;
  imageId: string;
  color: HeroColor;
  gender: string;
  colorScores: Record<string, number>;
  createdAt: string;
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request): Promise<Response> {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build where clause with session filtering
    const where: Prisma.LatestHeroWhereInput = {
      createdAt: {
        gte: today
      }
    };
    
    if (sessionId && sessionId !== 'all') {
      where.sessionId = sessionId;
    }

    const dailyHeroes = await prisma.latestHero.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        userName: true,
        personalityType: true,
        imageId: true,
        color: true,
        gender: true,
        colorScores: true,
        createdAt: true,
        sessionId: true,
        session: {
          select: {
            name: true
          }
        }
      },
    });

    return Response.json(dailyHeroes);
  } catch (error) {
    console.error('Failed to fetch daily heroes:', error);
    return new Response('Failed to fetch daily heroes', { status: 500 });
  }
}
