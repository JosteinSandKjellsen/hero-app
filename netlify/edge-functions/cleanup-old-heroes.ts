import type { Config } from '@netlify/edge-functions';
import { PrismaClient } from '@prisma/client';
import { LeonardoAiService } from '../../app/_lib/services/leonardoAi';

export default async function handler() {
  try {
    const prisma = new PrismaClient();
    const leonardoService = new LeonardoAiService();

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find heroes older than 30 days
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

    // Delete image from Leonardo for each hero with delay between deletions
    for (const hero of oldHeroes) {
      try {
        await leonardoService.deleteImage(hero.imageId, 'generated');
        // Add a small delay between deletions to avoid rate limiting
        if (oldHeroes.indexOf(hero) !== oldHeroes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to delete Leonardo image for hero ${hero.id}:`, error);
      }
    }

    // Delete heroes from database
    const { count } = await prisma.latestHero.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return new Response(`Successfully cleaned up ${count} old heroes`, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return new Response('Failed to cleanup old heroes', { status: 500 });
  }
}

// Note: Scheduling is handled through Netlify configuration, not in code
export const config: Config = {};
