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

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '3', 10);
    const limit = Math.min(Math.max(count, 1), 50); // Between 1 and 50

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
