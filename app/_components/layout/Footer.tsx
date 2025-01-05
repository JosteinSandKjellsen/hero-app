'use client';

import Image from 'next/image';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import type { LayoutVariant } from '../../_lib/types/layout';

interface FooterProps {
  variant?: LayoutVariant;
}

export function Footer({ variant = 'quiz' }: FooterProps): JSX.Element {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full bg-white/10 backdrop-blur-lg border-t border-white/20 shadow-lg relative">
        <div className="max-w-3xl mx-auto flex items-center px-6 py-4">
          {variant === 'registration' ? (
            <>
              <div className="w-[120px]"></div> {/* Spacer for centering */}
              <div className="flex-1 flex justify-center">
                <Image
                  src="https://bouvet.fotoware.cloud/fotoweb/resources/logos/main.png"
                  alt="Bouvet Logo"
                  width={120}
                  height={24}
                  className="h-6 w-[120px] object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
              <LanguageSwitcher />
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Image
                src="https://bouvet.fotoware.cloud/fotoweb/resources/logos/main.png"
                alt="Bouvet Logo"
                width={120}
                height={24}
                className="h-6 w-[120px] object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
