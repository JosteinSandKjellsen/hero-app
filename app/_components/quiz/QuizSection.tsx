'use client';

import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { questions } from '@/app/_data/questions';

interface QuizSectionProps {
  currentQuestion: number;
  onAnswer: (type: 'red' | 'yellow' | 'green' | 'blue') => void;
}

export function QuizSection({ currentQuestion, onAnswer }: QuizSectionProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <QuizProgress
        currentQuestion={currentQuestion + 1}
        totalQuestions={questions.length}
      />
      <QuizQuestion
        question={questions[currentQuestion]}
        onAnswer={onAnswer}
      />
    </div>
  );
}