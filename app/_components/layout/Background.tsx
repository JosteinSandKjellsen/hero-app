'use client';

import type { LayoutVariant } from '../../_lib/types/layout';

interface BackgroundProps {
  variant: LayoutVariant;
}

export function Background({ variant }: BackgroundProps): JSX.Element | null {
  switch (variant) {
    case 'quiz':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple via-purple to-blue" />
      );
    case 'camera':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple via-purple to-blue" />
      );
    case 'results':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple via-purple to-blue" />
      );
    case 'stats':
      return (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple via-purple to-blue" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-light via-transparent to-transparent" />
        </div>
      );
    default:
      return null;
  }
}
