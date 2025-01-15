'use client';

import Image from 'next/image';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import type { LayoutVariant } from '../../_lib/types/layout';

interface FooterProps {
  variant?: LayoutVariant;
}

export function Footer({ variant }: FooterProps = {}): JSX.Element {
  const showLanguageSwitcher = variant === 'registration' || variant === 'stats';
  return (
    <footer className="w-full">
      <div className="w-full bg-white/20 backdrop-blur-lg border-t border-white/30 shadow-lg relative">
        <div className="max-w-3xl mx-auto flex items-center px-6 py-4">
          <div className="w-[120px]"></div> {/* Spacer for symmetry */}
          <div className="flex-1 flex justify-center">
            <Image
              src="https://bouvet.fotoware.cloud/fotoweb/resources/logos/main.png"
              alt="Bouvet Logo"
              width={120}
              height={24}
              className="h-6 w-[120px] object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="w-[120px] flex justify-end">
            {showLanguageSwitcher && <LanguageSwitcher />}
          </div>
        </div>
      </div>
    </footer>
  );
}
