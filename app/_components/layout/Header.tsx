'use client';

import { CombinedLogo } from '../ui/CombinedLogo';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { LayoutVariant } from '../../_lib/types/layout';

interface HeaderProps {
  variant?: LayoutVariant;
}

export function Header({ variant = 'quiz' }: HeaderProps): JSX.Element {
  const t = useTranslations('header');
  const textColor = 'text-light';
  const headerRef = useRef<HTMLDivElement>(null);

  // Force layout recalculation after component mounts to ensure proper positioning
  useEffect(() => {
    if (headerRef.current) {
      // Force a reflow/repaint
      void headerRef.current.offsetHeight;
    }
  }, []);

  if (variant === 'stats') {
    return (
      <div ref={headerRef} className="relative text-center" style={{ marginBottom: '2rem' }}>
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
    <div ref={headerRef} className="relative text-center" style={{ marginBottom: variant === 'quiz' ? '1.5rem' : '2rem' }}>
      <div className="flex justify-center" style={{ marginBottom: '0.75rem' }}>
          <Link href="/" locale={false} className="bg-white/10 p-1 rounded-full shadow-2xl backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-colors" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/';
          }}>
            <CombinedLogo alt={t('logoAlt')} />
          </Link>
      </div>
      <h1 className={`text-5xl font-bangers tracking-wider ${textColor} drop-shadow-lg`} style={{ marginBottom: '1rem' }}>
        {t('title')}
      </h1>
    </div>
  );
}
