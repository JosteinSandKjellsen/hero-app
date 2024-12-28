'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SuperheroCard } from '../_components/results/SuperheroCard';
import { PersonalityType } from '../_lib/types/personality';
import { HeroColor } from '../_lib/types/api';

function PrintContent(): JSX.Element {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const photoUrl = searchParams.get('photoUrl') || '';
  const name = searchParams.get('name') || '';
  const gender = (searchParams.get('gender') as 'male' | 'female') || 'male';
  const heroName = searchParams.get('heroName') || '';
  const personalityName = searchParams.get('personalityName') || '';
  const color = (searchParams.get('color') as HeroColor) || 'red';
  const scores = searchParams.get('scores')?.split(',').map(score => ({
    color: score.split(':')[0],
    percentage: parseInt(score.split(':')[1])
  })) || [];

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
