'use client';

import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { questions } from '../../_data/questions';
import type { HeroColor } from '../../_lib/types/api';

interface QuizSectionProps {
  currentQuestion: number;
  onAnswer: (type: HeroColor) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export function QuizSection({ currentQuestion, onAnswer, canGoBack, onGoBack }: QuizSectionProps): JSX.Element {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <QuizProgress
        currentQuestion={currentQuestion + 1}
        totalQuestions={questions.length}
        className="mb-8"
      />
      <QuizQuestion
        question={questions[currentQuestion]}
        onAnswer={onAnswer}
        canGoBack={canGoBack}
        onGoBack={onGoBack}
      />
    </div>
  );
}
