import { prisma } from '@/app/_lib/prisma';
import { Prisma } from '@prisma/client';
import { LeonardoAiService } from '@/app/_lib/services/leonardoAi';

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
  carousel: boolean;
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(): Promise<Response> {
  try {
    // Cleanup old entries as backup to scheduled job
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldHeroes = await prisma.latestHero.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        imageId: true
      }
    });

    if (oldHeroes.length > 0) {
      const leonardoService = new LeonardoAiService();
      
      // Delete images from Leonardo
      for (const hero of oldHeroes) {
        try {
          await leonardoService.deleteImage(hero.imageId, 'generated');
        } catch (error) {
          console.error(`Failed to delete Leonardo image for hero ${hero.id}:`, error);
        }
      }

      // Delete heroes from database
      await prisma.latestHero.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });
    }

    const latestHeroes = await prisma.latestHero.findMany({
      where: {
        carousel: true
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
        carousel: true,
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
        carousel: true, // New heroes are displayed in carousel by default
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
