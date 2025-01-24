'use client';

import { Users } from 'lucide-react';
import { MatchingTipText } from './MatchingTipText';
import type { HeroColor } from '@/app/_lib/types/api';

interface MatchingTipProps {
  color: HeroColor;
}

export function MatchingTip({ color }: MatchingTipProps): JSX.Element {
  return (
    <div className="backdrop-blur-sm rounded-lg shadow-lg p-6" style={{ backgroundColor: '#fcf8f3' }}>
      <div className="flex items-center gap-2 text-dark/80">
        <Users className="w-5 h-5" />
        <p className="text-sm">
          <MatchingTipText color={color} />
        </p>
      </div>
    </div>
  );
}
