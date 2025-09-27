import { NextRequest, NextResponse } from 'next/server';
import { LeonardoAiService } from '@/app/_lib/services/leonardoAi';

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { imageId, type } = await request.json();
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const leonardoService = new LeonardoAiService();
    const deleted = await leonardoService.deleteImage(imageId, type || 'generated');
    
    return NextResponse.json({ 
      success: deleted,
      imageId,
      type: type || 'generated'
    });
    
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}