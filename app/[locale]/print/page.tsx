'use client';

import React, { Suspense, useEffect } from 'react';
import './print.css';
import { useSearchParams } from 'next/navigation';
import { SuperheroCard } from '../../_components/results/SuperheroCard';
import { HeroColor } from '../../_lib/types/api';

function PrintContent(): JSX.Element {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const imageId = searchParams.get('imageId') || '';
  const [photoUrl, setPhotoUrl] = React.useState('');
  
  useEffect(() => {
    async function fetchImageUrl(): Promise<void> {
      if (!imageId) return;
      try {
        // Try to get JSON response first (production)
        const response = await fetch(`/api/hero-image/${imageId}`);
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          setPhotoUrl(data.url);
        } else {
          // If not JSON, use the proxied endpoint (development)
          setPhotoUrl(`/api/hero-image/${imageId}`);
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    }
    fetchImageUrl();
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
    bgClass: `bg-${color}-600`,
    textClass: `text-${color}-600`,
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

  // Add effect to trigger print if requested
  useEffect(() => {
    if (shouldPrint && photoUrl) {
      // Create a new image element to check when it's loaded
      const img = new Image();
      img.src = photoUrl;
      
      img.onload = () => {
        // Set print settings
        const style = document.createElement('style');
        style.textContent = `
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `;
        document.head.appendChild(style);

        // Add a small delay to ensure styles are applied
        setTimeout(() => {
          window.print();
        }, 100);
      };
    }
  }, [shouldPrint, photoUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="w-[600px]">
        <SuperheroCard
          photoUrl={photoUrl}
          personality={personality}
          userData={userData}
          results={scores}
        />
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
