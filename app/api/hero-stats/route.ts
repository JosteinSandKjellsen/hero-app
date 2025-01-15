import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request): Promise<Response> {
  try {
    const { color } = await request.json()
    
    const stat = await prisma.heroStats.create({
      data: { color }
    })
    
    return NextResponse.json(stat)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hero stat' }, { status: 500 })
  }
}

export async function GET(): Promise<Response> {
  try {
    // Get total count
    const total = await prisma.heroStats.count()
    
    // Get count by color
    const colorStats = await prisma.heroStats.groupBy({
      by: ['color'],
      _count: {
        _all: true
      }
    })
    
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
    return NextResponse.json({ error: 'Failed to fetch hero stats' }, { status: 500 })
  }
}
