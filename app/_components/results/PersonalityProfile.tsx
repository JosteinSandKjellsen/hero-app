'use client';

import { useTranslations } from 'next-intl';
import { PersonalityResult } from '../../_lib/types/personality';
import { PersonalityCard } from './PersonalityCard';
import { MatchingTip } from './MatchingTip';

interface PersonalityProfileProps {
  results: PersonalityResult[];
}

export function PersonalityProfile({ results }: PersonalityProfileProps): JSX.Element {
  const t = useTranslations('results');
  const dominantPersonality = results[0];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bangers tracking-wide text-center mb-8 text-purple-900">
        {t('title')}
      </h2>
      
      <MatchingTip color={dominantPersonality.color as 'red' | 'yellow' | 'green' | 'blue'} />
      
      {results.map((result) => (
        <PersonalityCard
          key={result.color}
          personality={result}
          percentage={result.percentage}
        />
      ))}
    </div>
  );
}
