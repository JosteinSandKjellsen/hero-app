'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import './print.css';
import { useSearchParams } from 'next/navigation';
import { SuperheroCard } from '../../_components/results/SuperheroCard';
import { HeroColor } from '../../_lib/types/api';
import { heroColors } from '@/app/_lib/constants/colors';
import { ResourceTracker, preloadRequiredImages, initializePrint } from '../../_lib/utils/print';

function PrintContent(): JSX.Element {
  const searchParams = useSearchParams();
  const resourceTracker = useRef(new ResourceTracker());
  const [photoUrl, setPhotoUrl] = React.useState('');
  
  // Get parameters from URL
  const imageId = searchParams.get('imageId') || '';
  
  useEffect(() => {
    // Store ref value at the beginning of effect to capture it for cleanup
    const tracker = resourceTracker.current;
    
    async function fetchImageUrl(): Promise<void> {
      if (!imageId) return;
      try {
        // Try to get JSON response first (production)
        const response = await fetch(`/api/hero-image/${imageId}`);
        const contentType = response.headers.get('content-type');
        
        let url: string;
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          url = data.url;
        } else {
          // If not JSON, use the proxied endpoint (development)
          url = `/api/hero-image/${imageId}`;
        }
        
        setPhotoUrl(url);
        
        // Start preloading images
        try {
          await preloadRequiredImages(url);
          tracker.markLoaded('heroImage');
          tracker.markLoaded('bouvetLogo');
        } catch (error) {
          console.error('Error preloading images:', error);
          // Mark as loaded anyway to prevent hanging
          tracker.markLoaded('heroImage');
          tracker.markLoaded('bouvetLogo');
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
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
  }, [imageId]);
  
  const name = searchParams.get('name') || '';
  const gender = (searchParams.get('gender') as 'male' | 'female') || 'male';
  const heroName = searchParams.get('heroName') || '';
  const personalityName = searchParams.get('personalityName') || '';
  const color = (searchParams.get('color') as HeroColor) || 'red';
  
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
    if (shouldPrint && photoUrl) {
      initializePrint(resourceTracker.current);
    }
  }, [shouldPrint, photoUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-0 m-0">
      <div style={{ 
        width: '100mm', 
        height: '148mm', 
        margin: 0, 
        padding: 0,
        display: 'flex',
        alignItems: 'flex-start',
        overflow: 'hidden'
      }}>
        {photoUrl && (
          <SuperheroCard
            photoUrl={photoUrl}
            personality={personality}
            userData={userData}
            results={scores}
          />
        )}
      </div>
    </div>
  );
}

export default function PrintPage(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintContent />
    </Suspense>
  );
}
