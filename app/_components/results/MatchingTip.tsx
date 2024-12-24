'use client';

import { Users } from 'lucide-react';
import { MatchingTipText } from './MatchingTipText';
import type { HeroColor } from '@/app/_lib/types/api';

interface MatchingTipProps {
  color: HeroColor;
}

export function MatchingTip({ color }: MatchingTipProps): JSX.Element {
  return (
    <div className="bg-white/50 rounded-lg p-4 shadow-sm border border-white/20">
      <div className="flex items-center gap-2 text-gray-600">
        <Users className="w-5 h-5" />
        <p className="text-sm">
          <MatchingTipText color={color} />
        </p>
      </div>
    </div>
  );
}