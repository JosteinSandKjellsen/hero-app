import { prisma } from '@/app/_lib/prisma';
import { Prisma } from '@prisma/client';

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

export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();
    const { name, userName, personalityType, imageId, color, gender, colorScores } = data;

    // Create the new hero
    const newHero = await prisma.latestHero.create({
      data: {
        name,
        userName,
        personalityType,
        imageId,
        color,
        gender,
        colorScores,
      },
    });

    return Response.json(newHero);
  } catch (error) {
    console.error('Failed to create latest hero:', error);
    
    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new Response('This hero image has already been saved', { status: 409 });
    }
    
    return new Response('Failed to create latest hero', { status: 500 });
  }
}
