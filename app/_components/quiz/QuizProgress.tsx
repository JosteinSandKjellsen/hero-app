'use client';

import { useTranslations } from 'next-intl';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  className?: string;
}

export function QuizProgress({ currentQuestion, totalQuestions, className }: QuizProgressProps): JSX.Element {
  const t = useTranslations('quiz.progress');
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="text-sm text-light/80">
        {t('status', { current: currentQuestion, total: totalQuestions })}
      </div>
      <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse" />
        <div
          className="h-full bg-gradient-to-r from-yellow via-red to-purple rounded-full transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-45 animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}
