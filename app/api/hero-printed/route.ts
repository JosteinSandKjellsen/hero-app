import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

export async function POST(request: Request): Promise<Response> {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Hero ID is required' }, { status: 400 });
    }

    const updatedHero = await prisma.latestHero.update({
      where: { id: Number(id) },
      data: { printed: true }
    });

    return NextResponse.json(updatedHero);
  } catch (error) {
    console.error('Error marking hero as printed:', error);
    return NextResponse.json(
      { error: 'Failed to mark hero as printed' },
      { status: 500 }
    );
  }
}
