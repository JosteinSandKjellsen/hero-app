'use client';

import type { QuizQuestion as QuestionType } from '../../_lib/types/quiz';

interface QuizQuestionProps {
  question: QuestionType;
  onAnswer: (type: 'red' | 'yellow' | 'green' | 'blue') => void;
}

export function QuizQuestion({ question, onAnswer }: QuizQuestionProps): JSX.Element {
  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

  return (
    <div className="animate-fadeIn">
      <div className="text-2xl font-bold text-white mb-6">{question.text}</div>
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
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
