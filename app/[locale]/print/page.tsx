'use client';

import React, { Suspense } from 'react';
import './print.css';
import { useSearchParams } from 'next/navigation';
import { SuperheroCard } from '../../_components/results/SuperheroCard';
import { HeroColor } from '../../_lib/types/api';
import { heroColors } from '@/app/_lib/constants/colors';
import { initializePrint, ResourceTracker, preloadImage } from '../../_lib/utils/print';
import { useEffect, useRef, useState } from 'react';

function PrintContent(): JSX.Element {
  const searchParams = useSearchParams();
  const resourceTracker = useRef(new ResourceTracker());
  const [photoUrl, setPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get parameters from URL
  const imageId = searchParams.get('imageId') || '';
  const name = searchParams.get('name') || '';
  const gender = (searchParams.get('gender') as 'male' | 'female') || 'male';
  const heroName = searchParams.get('heroName') || '';
  const personalityName = searchParams.get('personalityName') || '';
  const color = (searchParams.get('color') as HeroColor) || 'red';
  
  useEffect(() => {
    // Store ref value at the beginning of effect to capture it for cleanup
    const tracker = resourceTracker.current;
    
    async function fetchImageUrl(): Promise<void> {
      setIsLoading(true);
      
      async function loadImage(url: string): Promise<void> {
        try {
          await preloadImage(url);
          setPhotoUrl(url);
          tracker.markLoaded('heroImage');
          tracker.markLoaded('bouvetLogo');
        } catch (error) {
          console.error('Error loading image:', error);
          throw error;
        }
      }

      if (!imageId || imageId === 'undefined') {
        console.log('No valid imageId provided, using fallback image');
        const fallbackUrl = gender === 'female' ? '/images/superheroes/blue-woman.webp' : '/images/superheroes/blue-man.webp';
        try {
          await loadImage(fallbackUrl);
        } catch (error) {
          console.error('Error loading fallback image:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log('Fetching image with ID:', imageId);
        
        // Construct the URL carefully
        const apiUrl = `/api/hero-image/${encodeURIComponent(imageId)}`;
        console.log('Constructed API URL:', apiUrl);
        
        // Try to get JSON response first (production)
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          console.error('Error fetching hero image:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            imageId
          });
          const fallbackUrl = gender === 'female' ? '/images/superheroes/blue-woman.webp' : '/images/superheroes/blue-man.webp';
          await loadImage(fallbackUrl);
          return;
        }
        
        const contentType = response.headers.get('content-type');
        
        let url: string;
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (!data.url) {
            throw new Error('No URL in response');
          }
          url = data.url;
        } else {
          url = `/api/hero-image/${imageId}`;
        }
        
        await loadImage(url);
        
      } catch (error) {
        console.error('Error fetching/loading image:', error);
        const fallbackUrl = gender === 'female' ? '/images/superheroes/blue-woman.webp' : '/images/superheroes/blue-man.webp';
        try {
          await loadImage(fallbackUrl);
        } catch (fallbackError) {
          console.error('Error loading fallback image:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchImageUrl();

    // Mark icons as loaded since they're SVG components
    tracker.markLoaded('personalityIcon');
    tracker.markLoaded('heroCardIcons');

    return () => {
      if (tracker) {
        tracker.reset();
      }
    };
  }, [imageId, gender]);
  
  // Parse scores from URL (format: "red:8,blue:5,green:3,yellow:4")
  const scores = (searchParams.get('scores') || '')
    .split(',')
    .filter(Boolean)
    .map(score => {
      const [color, value] = score.split(':');
      return {
        color,
        percentage: parseInt(value) * 10
      };
    });

  // If no scores provided, use heroScore for backward compatibility
  if (scores.length === 0) {
    const heroScore = parseInt(searchParams.get('heroScore') || '0');
    scores.push({ color, percentage: heroScore * 10 });
  }

  // Construct personality object
  const personality = {
    color: color,
    bgClass: heroColors[color]?.bg || 'bg-dark',
    textClass: heroColors[color]?.text || 'text-dark',
    name: personalityName,
    heroName: heroName
  };

  // Construct user data
  const userData = {
    name: name,
    gender: gender
  };

  // Check if we should trigger print
  const shouldPrint = searchParams.get('print') === 'true';

  useEffect(() => {
    if (shouldPrint && photoUrl && !isLoading) {
      initializePrint(resourceTracker.current);
    }
  }, [shouldPrint, photoUrl, isLoading]);

  return (
    <div className="min-h-screen print-page flex items-center justify-center bg-white">
      <div style={{ 
        width: '100mm', 
        height: '148mm', 
        margin: 0, 
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="text-lg mb-2">Loading image...</div>
            <div className="animate-pulse bg-gray-200 w-16 h-16 rounded-full"></div>
          </div>
        ) : photoUrl && (
          <SuperheroCard
            photoUrl={photoUrl}
            personality={personality}
            userData={userData}
            results={scores}
            optimizePrint={true}
          />
        )}
      </div>
    </div>
  );
}

export default function PrintPage(): JSX.Element {
  // Add print-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add('print-page');
    return () => {
      document.body.classList.remove('print-page');
    };
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintContent />
    </Suspense>
  );
}
