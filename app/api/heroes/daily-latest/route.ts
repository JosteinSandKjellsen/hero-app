import { prisma } from '@/app/_lib/prisma';
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

export async function GET(): Promise<Response> {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyHeroes = await prisma.latestHero.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
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
      },
    });

    return Response.json(dailyHeroes);
  } catch (error) {
    console.error('Failed to fetch daily heroes:', error);
    return new Response('Failed to fetch daily heroes', { status: 500 });
  }
}
