'use client';

import { Sparkles } from 'lucide-react';
import type { LayoutVariant } from '@/types/layout';

interface HeaderProps {
  variant?: LayoutVariant;
}

export function Header({ variant = 'quiz' }: HeaderProps) {
  const textColor = variant === 'results' ? 'text-gray-900' : 'text-white';

  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full shadow-lg">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
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