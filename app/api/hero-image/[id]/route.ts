import { NextRequest, NextResponse } from 'next/server';
import { LeonardoAiService } from '../../../_lib/services/leonardoAi';
import { API_CONFIG } from '../../../_lib/config/api';

// Use runtime edge for optimal performance on Netlify
export const runtime = 'edge';

// Use revalidate instead of force-dynamic to allow controlled caching
export const revalidate = 3600; // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const leonardoService = new LeonardoAiService();
    
    // The ID should already be the generation ID
    const generationId = params.id;
    
    // Get the image URL using the service
    const response = await fetch(
      `${API_CONFIG.leonardo.baseUrl}/generations/${generationId}`,
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
    
    // In production (Netlify), return the CDN URL directly with cache headers
    if (process.env.NODE_ENV === 'production') {
      // For Netlify's CDN to properly cache the response
      return NextResponse.json(
        { url: imageUrl },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        }
      );
    }
    
    // In development, proxy the image through our API
    const imageResponse = await fetch(imageUrl, {
      headers: leonardoService['headers']
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.arrayBuffer();
    
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
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
