import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/app/_lib/prisma'

// Input validation schema
const ColorSchema = z.object({
  color: z.enum(['red', 'yellow', 'green', 'blue'])
})

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = ColorSchema.parse(body)
    
    const stat = await prisma.heroStats.create({
      data: { color: validatedData.color }
    })
    
    return NextResponse.json(stat)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    
    console.error('Error creating hero stat:', error)
    return NextResponse.json({ error: 'Failed to create hero stat' }, { status: 500 })
  } finally {
    // Explicitly disconnect in production/serverless environment
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect()
    }
  }
}

export async function GET(): Promise<Response> {
  try {
    // Calculate timestamps
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(startOfDay.getDate() + 1)

    // Use a transaction to ensure data consistency
    const [total, colorStats] = await prisma.$transaction(async (tx) => {
      // Delete records older than today using the composite index
      await tx.heroStats.deleteMany({
        where: {
          createdAt: {
            lt: startOfDay
          }
        }
      });

      // Get total count and color stats in parallel
      const [totalCount, stats] = await Promise.all([
        tx.heroStats.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        }),
        tx.heroStats.groupBy({
          by: ['color'],
          _count: {
            _all: true
          },
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        })
      ]);

      return [totalCount, stats];
    });
    
    type ColorStats = { [key: string]: number }
    
    type GroupByResult = {
      color: string;
      _count: {
        _all: number;
      };
    }
    
    const statsByColor = colorStats.reduce((acc: ColorStats, stat: GroupByResult) => ({
      ...acc,
      [stat.color]: stat._count._all
    }), {})
    
    return NextResponse.json({
      total,
      byColor: statsByColor
    })
  } catch (error) {
    console.error('Error fetching hero stats:', error)
    return NextResponse.json({ error: 'Failed to fetch hero stats' }, { status: 500 })
  } finally {
    // Explicitly disconnect in production/serverless environment
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect()
    }
  }
}
