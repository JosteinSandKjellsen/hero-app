'use client';

import Image from 'next/image';
import type { LayoutVariant } from '@/app/_lib/types/layout';

interface HeaderProps {
  variant?: LayoutVariant;
}

export function Header({ variant = 'quiz' }: HeaderProps): JSX.Element {
  const textColor = variant === 'results' ? 'text-gray-900' : 'text-white';

  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-white/10 p-3 rounded-full shadow-2xl backdrop-blur-lg border border-white/20">
          <div className="w-12 h-12 relative animate-float-subtle mt-1">
            <Image
              src="/images/superheroes/heroapp-icon.png"
              alt="Hero App Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <h1 className={`text-5xl font-bangers tracking-wider ${textColor} mb-4 drop-shadow-lg`}>
        Hvilken Superhelt Er Du?
      </h1>
      <p className={`text-lg ${variant === 'results' ? 'text-gray-600' : 'text-white/90'}`}>
        Oppdag din indre superhelt gjennom denne personlighetstesten!
      </p>
    </div>
  );
}
