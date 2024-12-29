import { NextRequest, NextResponse } from 'next/server';
import { LeonardoAiService } from '../../../_lib/services/leonardoAi';
import { API_CONFIG } from '../../../_lib/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const leonardoService = new LeonardoAiService();
    
    // Get the image URL using the service
    const response = await fetch(
      `${API_CONFIG.leonardo.baseUrl}/generations/${params.id}`,
      { headers: leonardoService['headers'] }
    );

    if (!response.ok) {
      throw new Error(`Failed to get image URL: ${response.statusText}`);
    }

    const data = await response.json();
    const generation = data.generations_by_pk;

    if (!generation || !generation.generated_images?.length) {
      throw new Error('Image not found');
    }

    const imageUrl = generation.generated_images[0].url;
    
    // Fetch the actual image with authentication
    const imageResponse = await fetch(imageUrl, {
      headers: leonardoService['headers']
    });
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get the image data
    const imageData = await imageResponse.arrayBuffer();
    
    // Return the image with proper headers
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error serving hero image:', error);
    return NextResponse.json(
      { error: 'Failed to serve hero image' },
      { status: 500 }
    );
  }
}
