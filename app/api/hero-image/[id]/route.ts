import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '../../../_lib/config/api';

// Revalidate every hour for optimal caching
export const revalidate = 3600;

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Check if we have the API key in the environment
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) {
      console.error('LEONARDO_API_KEY is not set in environment');
      return NextResponse.json(
        { error: 'API configuration error', details: 'Missing API key' },
        { status: 500 }
      );
    }

    // Extract the ID from the URL path as this seems more reliable in production
    const pathname = new URL(request.url).pathname;
    const urlId = pathname.split('/').filter(Boolean).pop();
    
    console.log('Debug route params:', {
      urlId,
      fullUrl: request.url,
      pathname
    });
    
    // Validate the URL ID
    if (!urlId || urlId === 'undefined') {
      console.error('Invalid generation ID. Debug info:', { urlId, fullUrl: request.url });
      return NextResponse.json(
        { 
          error: 'Invalid generation ID',
          debug: { urlId, fullUrl: request.url }
        },
        { status: 400 }
      );
    }
    
    console.log(`Fetching generation data for ID: ${urlId}`);
    
    // Construct headers directly for edge compatibility
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`
    };
    
    // Get the image URL using direct fetch
    const response = await fetch(
      `${API_CONFIG.leonardo.baseUrl}/generations/${urlId}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      const errorMessage = `Failed to get image URL (Status ${response.status}): ${response.statusText}. Error details: ${errorText}`;
      console.error(errorMessage);
      return NextResponse.json(
        { error: 'Failed to get image URL', details: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generation = data.generations_by_pk;

    if (!generation || !generation.generated_images?.length) {
      console.error('Image not found in generation data:', JSON.stringify(data, null, 2));
      throw new Error('Image not found');
    }

    const imageUrl = generation.generated_images[0].url;
    console.log(`Retrieved image URL: ${imageUrl}`);
    
    // Always proxy the image through our API to avoid CORS issues
    console.log(`Fetching image data from: ${imageUrl}`);
    
    try {
      // Try with authorization headers first
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isBlurPlaceholder = searchParams.get('blur') === 'true';
    const quality = parseInt(searchParams.get('q') || '100', 10);
    const width = parseInt(searchParams.get('w') || '0', 10);

    const imageResponse = await fetch(imageUrl, {
      headers: headers
    });
      
      if (!imageResponse.ok) {
        throw new Error(`Failed with Leonardo headers: ${imageResponse.statusText}`);
      }

      // If this is a blur placeholder request, return a tiny base64 image
      if (isBlurPlaceholder) {
        const tinyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        return new NextResponse(tinyBase64, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        });
      }

      const imageData = await imageResponse.arrayBuffer();
      
      // Return the image with appropriate caching headers
      return new NextResponse(imageData, {
        headers: {
          'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000, immutable',
          'Netlify-CDN-Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    } catch (firstAttemptError) {
      console.error(`First image fetch attempt failed: ${firstAttemptError}`);
      
      // Try again without custom headers (CDN URLs might not need auth)
      try {
        const fallbackResponse = await fetch(imageUrl);
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback fetch failed: ${fallbackResponse.statusText}`);
        }
        
        const imageData = await fallbackResponse.arrayBuffer();
        
        return new NextResponse(imageData, {
          headers: {
            'Content-Type': fallbackResponse.headers.get('Content-Type') || 'image/png',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        });
      } catch (secondAttemptError) {
        console.error(`Second image fetch attempt failed: ${secondAttemptError}`);
        throw new Error(`Failed to fetch image after multiple attempts`);
      }
    }
  } catch (error) {
    console.error('Error serving hero image:', error);
    // Add detailed error info to help diagnose the issue
    return NextResponse.json(
      { 
        error: 'Failed to serve hero image', 
        details: error instanceof Error ? error.message : 'Unknown error',
        id: new URL(request.url).pathname.split('/').filter(Boolean).pop()
      },
      { status: 500 }
    );
  }
}
