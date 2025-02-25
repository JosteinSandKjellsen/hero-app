import { NextRequest, NextResponse } from 'next/server';
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
    
    // In production (Netlify), return the CDN URL directly with cache headers
    if (process.env.NODE_ENV === 'production') {
      // Check if the image URL is valid and accessible before returning it
      try {
        const checkResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (!checkResponse.ok) {
          throw new Error(`Image URL is not accessible: ${checkResponse.statusText}`);
        }
      } catch (headError) {
        console.error(`Error validating image URL: ${headError}`);
        // Continue anyway - we'll let the client try to fetch directly
      }
      
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
    console.log(`Fetching image data from: ${imageUrl}`);
    
    try {
      // Try with authorization headers first
      const imageResponse = await fetch(imageUrl, {
        headers: headers
      });
      
      if (!imageResponse.ok) {
        throw new Error(`Failed with Leonardo headers: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.arrayBuffer();
      
      return new NextResponse(imageData, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*'
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
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'Access-Control-Allow-Origin': '*'
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
