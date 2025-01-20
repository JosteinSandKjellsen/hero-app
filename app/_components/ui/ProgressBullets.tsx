'use client';

import { useTranslations } from 'next-intl';
import { GenerationStep, GENERATION_STEPS } from '../../_lib/types/loading';

interface ProgressBulletsProps {
  currentStep: GenerationStep;
}

export function ProgressBullets({ currentStep }: ProgressBulletsProps): JSX.Element {
  const t = useTranslations('loading.steps');
  
  const getCurrentStepIndex = (): number => {
    return GENERATION_STEPS.findIndex(step => step.step === currentStep);
  };

  return (
    <div className="flex gap-3 mt-6">
      {GENERATION_STEPS.map((step, index) => (
        <div
          key={step.step}
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            index <= getCurrentStepIndex()
              ? 'bg-red'
              : 'bg-white/20'
          }`}
          title={t(step.step)}
        />
      ))}
    </div>
  );
}
