'use client';

import { LoadingSpinner } from './LoadingSpinner';
import { HeroImageCarousel } from './HeroImageCarousel';

interface LoadingStateProps {
  message: string;
  subMessage?: string;
}

export function LoadingState({ message, subMessage }: LoadingStateProps): JSX.Element {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <HeroImageCarousel />
        <LoadingSpinner size="lg" />
        <p className="text-white mt-4 text-center">
          {message}
        </p>
        {subMessage && (
          <p className="text-white/70 text-sm mt-2 text-center">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
}