'use client';

import { useTranslations } from 'next-intl';
import { getPersonalityIcon } from '../../_utils/personalityIcons';
import { HeroColor } from '@/app/_lib/types/api';

interface LatestHeroPersonalityProps {
  type: HeroColor;
  className?: string;
}

export function LatestHeroPersonality({ type, className = '' }: LatestHeroPersonalityProps): JSX.Element {
  const t = useTranslations();
  const bgClass = `bg-${type}-500`;
  const textClass = `text-${type}-500`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${bgClass} w-6 h-6 rounded-full flex items-center justify-center`}>
        {getPersonalityIcon(type)}
      </div>
      <span className={`font-bangers tracking-wide ${textClass}`}>
        {t(`personalities.${type}.name`)}
      </span>
    </div>
  );
}
