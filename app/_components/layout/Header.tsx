'use client';

import { CombinedLogo } from '../ui/CombinedLogo';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { LayoutVariant } from '../../_lib/types/layout';
interface HeaderProps {
  variant?: LayoutVariant;
}

export function Header({ variant = 'quiz' }: HeaderProps): JSX.Element {
  const t = useTranslations('header');
  const textColor = 'text-light';

  if (variant === 'stats') {
    return (
      <div className="relative text-center mb-8">
        <div className="flex justify-center">
          <Link href="/" locale={false} className="bg-white/10 p-1 rounded-full shadow-2xl backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-colors" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/';
          }}>
            <CombinedLogo alt={t('logoAlt')} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-center mb-8 md:mb-4">
      <div className="flex justify-center mb-4 md:mb-2">
          <Link href="/" locale={false} className="bg-white/10 p-1 rounded-full shadow-2xl backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-colors" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/';
          }}>
            <CombinedLogo alt={t('logoAlt')} />
          </Link>
      </div>
      <h1 className={`text-5xl font-bangers tracking-wider ${textColor} mb-4 drop-shadow-lg`}>
        {t('title')}
      </h1>
    </div>
  );
}
