'use client';

import { useTranslations } from 'next-intl';
import { colorClasses, matchingColors } from '../../_lib/utils/matchingTips';
import type { HeroColor } from '../../_lib/types/api';

interface MatchingTipTextProps {
  color: HeroColor;
}

export function MatchingTipText({ color }: MatchingTipTextProps): JSX.Element {
  const t = useTranslations('matchingTips');
  const matchingColor = matchingColors[color];

  return (
    <>
      {t('intro')}{' '}
      <span className={`font-bold ${colorClasses[matchingColor]}`}>
        {t(`colors.${matchingColor}`)}
      </span>{' '}
      {t('connector')}{' '}
      <span className={`font-bold ${colorClasses[color]}`}>
        {t(`descriptions.${color}.source`)}
      </span>{' '}
      {t('meets')}{' '}
      <span className={`font-bold ${colorClasses[matchingColor]}`}>
        {t(`descriptions.${matchingColor}.target`)}
      </span>
    </>
  );
}
