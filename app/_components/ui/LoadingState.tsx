'use client';

import { LoadingSpinner } from './LoadingSpinner';
import { HeroImageCarousel } from './HeroImageCarousel';
import { ProgressBullets } from './ProgressBullets';
import { GenerationStep, GENERATION_STEPS } from '../../_lib/types/loading';

interface LoadingStateProps {
  currentStep: GenerationStep;
}

export function LoadingState({ currentStep }: LoadingStateProps): JSX.Element {
  const currentStatus = GENERATION_STEPS.find(step => step.step === currentStep);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <HeroImageCarousel />
        <LoadingSpinner size="lg" />
        <p className="text-white mt-4 text-center">
          {currentStatus?.message || 'Preparing your superhero transformation...'}
        </p>
        <p className="text-white/70 text-sm mt-2 text-center">
          Dette kan ta opptil ett minutt
        </p>
        <ProgressBullets currentStep={currentStep} />
      </div>
    </div>
  );
}
