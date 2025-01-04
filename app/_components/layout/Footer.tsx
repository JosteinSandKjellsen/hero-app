'use client';

import Image from 'next/image';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import type { LayoutVariant } from '../../_lib/types/layout';

interface FooterProps {
  variant?: LayoutVariant;
}

export function Footer({ variant = 'quiz' }: FooterProps): JSX.Element {
  const showLanguageSwitcher = variant === 'registration';
  return (
    <footer className="absolute bottom-0 left-0 right-0 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-8">
        <Image
          src="https://bouvet.fotoware.cloud/fotoweb/resources/logos/main.png"
          alt="Bouvet Logo"
          width={120}
          height={24}
          className="h-6 w-[120px] object-contain opacity-90 hover:opacity-100 transition-opacity"
        />
        {showLanguageSwitcher && <LanguageSwitcher />}
      </div>
    </footer>
  );
}
