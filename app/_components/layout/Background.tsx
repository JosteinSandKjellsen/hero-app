'use client';

import type { LayoutVariant } from '../../_lib/types/layout';

interface BackgroundProps {
  variant: LayoutVariant;
}

export function Background({ variant }: BackgroundProps): JSX.Element | null {
  switch (variant) {
    case 'quiz':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600" />
      );
    case 'camera':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900" />
      );
    case 'results':
      return (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-purple-200 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-blue-100/50" />
        </div>
      );
    case 'stats':
      return (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
      );
    default:
      return null;
  }
}
