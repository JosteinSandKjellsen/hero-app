'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SuperheroCard } from '../_components/results/SuperheroCard';
import { PersonalityType } from '../_lib/types/personality';
import { HeroColor } from '../_lib/types/api';

function PrintContent(): JSX.Element {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const imageId = searchParams.get('imageId') || '';
  // Use our API endpoint to serve the image
  const photoUrl = imageId ? `/api/hero-image/${imageId}` : '';
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
  const personality: PersonalityType = {
    name: personalityName,
    heroName: heroName,
    color: color,
    description: '', // Not needed for print view
    traits: [], // Not needed for print view
    bgClass: `bg-${color}-600`,
    textClass: `text-${color}-600`
  };

  // Construct user data
  const userData = {
    name: name,
    gender: gender
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
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
