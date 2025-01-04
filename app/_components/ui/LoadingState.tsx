'use client';

import { useTranslations } from 'next-intl';
import { LoadingSpinner } from './LoadingSpinner';
import { HeroImageCarousel } from './HeroImageCarousel';
import { ProgressBullets } from './ProgressBullets';
import { GenerationStep, GENERATION_STEPS } from '../../_lib/types/loading';

interface LoadingStateProps {
  currentStep: GenerationStep;
}

export function LoadingState({ currentStep }: LoadingStateProps): JSX.Element {
  const t = useTranslations('loading');
  const currentStatus = GENERATION_STEPS.find(step => step.step === currentStep);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <HeroImageCarousel />
        <LoadingSpinner size="lg" />
        <p className="text-white mt-4 text-center">
          {currentStatus ? t(`steps.${currentStatus.step}`) : t('defaultMessage')}
        </p>
        <p className="text-white/70 text-sm mt-2 text-center">
          {t('timeEstimate')}
        </p>
        <ProgressBullets currentStep={currentStep} />
      </div>
    </div>
  );
}
