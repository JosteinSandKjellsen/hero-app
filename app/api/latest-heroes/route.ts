import { prisma } from '@/app/_lib/prisma';

export interface LatestHeroWithId {
  id: number;
  name: string;
  userName: string | null;
  personalityType: string;
  imageId: string;
  color: string;
  gender: string;
  colorScores: Record<string, number>;
  createdAt: string;
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request): Promise<Response> {
  try {
    const count = new URL(request.url).searchParams.get('count');
    const limit = Math.min(Math.max(parseInt(count || '3', 10), 1), 50); // Between 1 and 50

    const latestHeroes = await prisma.latestHero.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
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

    return Response.json(latestHeroes);
  } catch (error) {
    console.error('Failed to fetch latest heroes:', error);
    return new Response('Failed to fetch latest heroes', { status: 500 });
  }
}
