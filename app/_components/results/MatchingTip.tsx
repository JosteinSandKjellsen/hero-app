'use client';

import { Users } from 'lucide-react';
import { MatchingTipText } from './MatchingTipText';
import type { HeroColor } from '@/app/_lib/types/api';

interface MatchingTipProps {
  color: HeroColor;
}

export function MatchingTip({ color }: MatchingTipProps): JSX.Element {
  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-4 shadow-2xl border border-white/20">
      <div className="flex items-center gap-2 text-light">
        <Users className="w-5 h-5" />
        <p className="text-sm">
          <MatchingTipText color={color} />
        </p>
      </div>
    </div>
  );
}
