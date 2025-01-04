'use client';

import { useTranslations } from 'next-intl';
import type { QuizQuestion as QuestionType } from '../../_lib/types/quiz';
import type { HeroColor } from '../../_lib/types/api';

interface QuizQuestionProps {
  question: QuestionType;
  onAnswer: (type: HeroColor) => void;
}

export function QuizQuestion({ question, onAnswer }: QuizQuestionProps): JSX.Element {
  const t = useTranslations('quiz.questions');
  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

  return (
    <div className="animate-fadeIn">
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
                     focus:outline-none focus:ring-2 focus:ring-purple-500 active:bg-white/30"
          >
            {t(`${question.id}.options.${option.type}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
