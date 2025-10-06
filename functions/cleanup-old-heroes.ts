import { Handler } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';

// Minimal version of LeonardoAiService for cleanup only
class LeonardoCleanupService {
  private readonly baseUrl = 'https://cloud.leonardo.ai/api/rest/v1';
  private readonly headers: HeadersInit;

  constructor(apiKey: string) {
    this.headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
    };
  }

  // Simplified version that only handles deletion with retries
  async deleteGeneratedImage(imageId: string, maxRetries = 3): Promise<void> {
    let attempts = 0;
    
    while (attempts <= maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/generations/${imageId}`, {
          method: 'DELETE',
          headers: this.headers
        });

        if (response.status === 429) {
          if (attempts === maxRetries) {
            console.error('Rate limit reached after max retries, skipping deletion for:', imageId);
            return;
          }
          console.log('Rate limited on delete, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempts))); // Exponential backoff: 2s, 4s, 8s
          attempts++;
          continue;
        }

        if (!response.ok) {
          console.error('Failed to delete generated image:', imageId);
        }
        return;
      } catch (error) {
        console.error('Error deleting generated image:', error);
        if (attempts === maxRetries) return;
        attempts++;
      }
    }
  }
}

const handler: Handler = async (_event, context) => {
  if (!process.env.LEONARDO_API_KEY) {
    throw new Error('LEONARDO_API_KEY is required');
  }

  try {
    const prisma = new PrismaClient();
    const leonardoService = new LeonardoCleanupService(process.env.LEONARDO_API_KEY);

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
        await leonardoService.deleteGeneratedImage(hero.imageId);
        // Add a small delay between deletions to avoid rate limiting
        if (oldHeroes.indexOf(hero) !== oldHeroes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to delete Leonardo image for hero ${hero.id}:`, error);
      }
    }

    // Delete heroes from database
    const { count: deletedCount } = await prisma.latestHero.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Successfully cleaned up ${deletedCount} old heroes`);

    // === SESSION CLEANUP ===
    console.log('Starting session cleanup...');

    // Find sessions that ended more than 30 days ago
    const oldSessions = await prisma.session.findMany({
      where: {
        endDate: {
          lt: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        name: true,
        endDate: true,
        _count: {
          select: {
            heroes: true,
            stats: true
          }
        }
      }
    });

    console.log(`Found ${oldSessions.length} old sessions to clean up`);

    let sessionCount = 0;

    // Delete sessions only - leave heroes and stats with their original sessionId references
    for (const session of oldSessions) {
      try {
        await prisma.session.delete({
          where: { id: session.id }
        });

        sessionCount++;
        console.log(`Deleted session: ${session.name} (had ${session._count.heroes} heroes, ${session._count.stats} stats)`);

        // Small delay between session deletions to be gentle on database
        if (oldSessions.indexOf(session) !== oldSessions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Failed to delete session ${session.id} (${session.name}):`, error);
      }
    }

    console.log(`Successfully deleted ${sessionCount} old sessions`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Cleanup completed successfully - deleted ${deletedCount} old heroes and ${sessionCount} old sessions`,
        heroesDeleted: deletedCount,
        sessionsDeleted: sessionCount
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to cleanup old heroes' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

export { handler };
