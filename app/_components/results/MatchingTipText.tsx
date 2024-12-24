'use client';

import { 
  colorClasses, 
  colorTranslations, 
  matchingColors, 
  matchingDescriptions
} from '@/app/_lib/utils/matchingTips';
import type { HeroColor } from '@/app/_lib/types/api';

interface MatchingTipTextProps {
  color: HeroColor;
}

export function MatchingTipText({ color }: MatchingTipTextProps): JSX.Element {
  const matchingColor = matchingColors[color];
  const description = matchingDescriptions[color];

  return (
    <>
      Tips: Snakk med en{' '}
      <span className={`font-bold ${colorClasses[matchingColor]}`}>
        {colorTranslations[matchingColor]}
      </span>{' '}
      venn: Din{' '}
      <span className={`font-bold ${colorClasses[color]}`}>
        {description.source}
      </span>{' '}
      møter den{' '}
      <span className={`font-bold ${colorClasses[matchingColor]}`}>
        {description.target}
      </span>
    </>
  );
}