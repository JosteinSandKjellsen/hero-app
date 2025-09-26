'use client';

import { useTranslations } from 'next-intl';
import type { QuizQuestion as QuestionType } from '../../_lib/types/quiz';
import type { HeroColor } from '../../_lib/types/api';

interface QuizQuestionProps {
  question: QuestionType;
  onAnswer: (type: HeroColor) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export function QuizQuestion({ question, onAnswer, canGoBack, onGoBack }: QuizQuestionProps): JSX.Element {
  const t = useTranslations('quiz.questions');
  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

  return (
    <div className="animate-fadeIn">
      {canGoBack && onGoBack && (
        <button 
          onClick={onGoBack}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200 
                     text-sm font-medium px-3 py-2 rounded-md hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Forrige spørsmål
        </button>
      )}
      
      <div className="text-2xl font-bold text-white mb-6">
        {t(`${question.id}.text`)}
      </div>
      <div className="space-y-4">
        {shuffledOptions.map((option, index) => (
          <button
            key={index}
            onClick={(e) => {
              onAnswer(option.type);
              (e.target as HTMLButtonElement).blur();
            }}
            className="w-full text-left p-4 rounded-lg border border-white/20 bg-white/5 
                     hover:bg-white/20 transition-all duration-200 ease-in-out text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple active:bg-white/30"
          >
            {t(`${question.id}.options.${option.type}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
