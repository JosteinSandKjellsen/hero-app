'use client';

import type { LayoutVariant } from '../../_lib/types/layout';

interface BackgroundProps {
  variant: LayoutVariant;
}

export function Background({ variant }: BackgroundProps): JSX.Element | null {
  switch (variant) {
    case 'quiz':
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark" />
          <div className="absolute inset-0 comic-dots-overlay" style={{ zIndex: 1 }} />
        </>
      );
    case 'camera':
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark" />
          <div className="absolute inset-0 comic-dots-overlay" style={{ zIndex: 1 }} />
        </>
      );
    case 'results':
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark" />
          <div className="absolute inset-0 comic-dots-overlay" style={{ zIndex: 1 }} />
        </>
      );
    case 'stats':
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-light via-transparent to-transparent" />
          <div className="absolute inset-0 comic-dots-overlay" style={{ zIndex: 1 }} />
        </>
      );
    default:
      return null;
  }
}
