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

export async function GET(request: Request): Promise<Response> {
  try {
    // Use a transaction for atomicity
    const response = await prisma.$transaction(async (tx) => {
      // Cleanup old entries as backup to scheduled job
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get old heroes that need cleanup
      const oldHeroes = await tx.latestHero.findMany({
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
        
        // Delete images from Leonardo in parallel
        await Promise.all(
          oldHeroes.map(hero => 
            leonardoService.deleteImage(hero.imageId, 'generated')
              .catch(error => console.error(`Failed to delete Leonardo image for hero ${hero.id}:`, error))
          )
        );

        // Delete old heroes from database
        await tx.latestHero.deleteMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        });
      }

      // Parse query parameters
      const url = new URL(request.url);
      const includeAll = url.searchParams.get('includeAll') === 'true';
      const sessionId = url.searchParams.get('sessionId');
      const count = url.searchParams.get('count');
      const take = count ? parseInt(count, 10) : undefined;

      // Build where clause with session filtering
      const where: Prisma.LatestHeroWhereInput = {};
      
      if (!includeAll) {
        where.carousel = true;
      }
      
      if (sessionId && sessionId !== 'all') {
        where.sessionId = sessionId;
      }

      // Use the optimized carousel index for filtered queries
      const latestHeroes = await tx.latestHero.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
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
          sessionId: true,
          session: {
            select: {
              name: true
            }
          }
        },
      });

      return latestHeroes;
    });

    return Response.json(response);
  } catch (error) {
    console.error('Failed to fetch latest heroes:', error);
    return new Response('Failed to fetch latest heroes', { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();
    const { name, userName, personalityType, imageId, color, gender, colorScores, sessionId } = data;

    // Create the new hero with optimized data access
    const newHero = await prisma.$transaction(async (tx) => {
      // Check for existing imageId to avoid unique constraint violation
      const existing = await tx.latestHero.findUnique({
        where: { imageId },
        select: { id: true }
      });

      if (existing) {
        throw new Error('This hero image has already been saved');
      }

      return tx.latestHero.create({
        data: {
          name,
          userName,
          personalityType,
          imageId,
          color,
          gender,
          colorScores,
          sessionId: sessionId || null, // null means "all sessions"
          carousel: true, // New heroes are displayed in carousel by default
        },
      });
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
