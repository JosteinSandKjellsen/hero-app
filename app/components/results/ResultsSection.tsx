'use client';

import { useRef } from 'react';
import { PersonalityType, UserData } from '../../_lib/types';
import { SuperheroCard } from './SuperheroCard';
import { PersonalityProfile } from './PersonalityProfile';
import { ResultsActions } from './ResultsActions';

interface ResultsSectionProps {
  results: (PersonalityType & { percentage: number })[];
  photoUrl: string;
  userData: UserData;
  onReset: () => void;
}

export function ResultsSection({ results, photoUrl, userData, onReset }: ResultsSectionProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const dominantPersonality = results[0];

  return (
    <div className="space-y-12">
      <div className="w-full max-w-md mx-auto">
        {/* Visible card */}
        <SuperheroCard
          photoUrl={photoUrl}
          personality={dominantPersonality}
          userData={userData}
        />
        
        {/* Hidden card for download */}
        <div 
          ref={cardRef}
          className="fixed left-[-9999px] w-[600px] opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <SuperheroCard
            photoUrl={photoUrl}
            personality={dominantPersonality}
            userData={userData}
          />
        </div>
      </div>

      <ResultsActions 
        cardRef={cardRef}
        heroName={dominantPersonality.heroName}
        onReset={onReset}
      />

      <PersonalityProfile results={results} />
    </div>
  );
}
