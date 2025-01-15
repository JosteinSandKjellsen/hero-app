'use client';

import { CombinedLogo } from '../ui/CombinedLogo';
import { useTranslations } from 'next-intl';
import type { LayoutVariant } from '../../_lib/types/layout';
interface HeaderProps {
  variant?: LayoutVariant;
}

export function Header({ variant = 'quiz' }: HeaderProps): JSX.Element {
  const t = useTranslations('header');
  const textColor = variant === 'results' ? 'text-gray-900' : 'text-white';

  if (variant === 'stats') {
    return (
      <div className="relative text-center mb-8">
        <div className="flex justify-center">
          <div className="bg-white/10 p-3 rounded-full shadow-2xl backdrop-blur-lg border border-white/20">
            <CombinedLogo alt={t('logoAlt')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-white/10 p-3 rounded-full shadow-2xl backdrop-blur-lg border border-white/20">
          <CombinedLogo alt={t('logoAlt')} />
        </div>
      </div>
      <h1 className={`text-5xl font-bangers tracking-wider ${textColor} mb-4 drop-shadow-lg`}>
        {t('title')}
      </h1>
      <p className={`text-lg ${variant === 'results' ? 'text-gray-600' : 'text-white/90'}`}>
        {t('subtitle')}
      </p>
    </div>
  );
}
