interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function QuizProgress({ currentQuestion, totalQuestions }: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="relative w-full h-3 bg-white/10 rounded-full mb-6 overflow-hidden border border-white/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse" />
      <div
        className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full transition-all duration-300 relative"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-45 animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
}