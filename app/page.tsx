'use client';

import { QuizLayout } from './_components/layout/QuizLayout';
import { RegistrationForm } from './_components/registration/RegistrationForm';
import { QuizSection } from './_components/quiz/QuizSection';
import { CameraSection } from './_components/camera/CameraSection';
import { ResultsSection } from './_components/results/ResultsSection';
import { Toast } from './_components/ui/Toast';
import { LoadingState } from './_components/ui/LoadingState';
import { useQuiz } from './_hooks/useQuiz';
import { useToast } from './_hooks/useToast';

export default function Home(): JSX.Element {
  const {
    userData,
    currentQuestion,
    showCamera,
    showResults,
    photoUrl,
    heroName,
    isGeneratingImage,
    isGeneratingName,
    generationStep,
    handleRegistration,
    handleAnswer,
    handlePhotoTaken,
    calculateResults,
    resetQuiz,
  } = useQuiz();

  const { toast, hideToast } = useToast();

  if (!userData) {
    return (
      <QuizLayout showBackground variant="registration">
        <RegistrationForm onSubmit={handleRegistration} />
        {toast && <Toast message={toast.message} onClose={hideToast} />}
      </QuizLayout>
    );
  }

  if (isGeneratingImage || isGeneratingName) {
    return (
      <QuizLayout variant="camera">
        <LoadingState currentStep={generationStep} />
      </QuizLayout>
    );
  }

  if (showResults && photoUrl && heroName) {
    const results = calculateResults();
    return (
      <QuizLayout variant="results">
        <ResultsSection 
          results={results} 
          photoUrl={photoUrl}
          userData={userData}
          onReset={resetQuiz}
          heroName={heroName}
        />
        {toast && <Toast message={toast.message} onClose={hideToast} />}
      </QuizLayout>
    );
  }

  if (showCamera) {
    return (
      <QuizLayout variant="camera">
        <CameraSection onPhotoTaken={handlePhotoTaken} />
        {toast && <Toast message={toast.message} onClose={hideToast} />}
      </QuizLayout>
    );
  }

  return (
    <QuizLayout variant="quiz">
      <QuizSection
        currentQuestion={currentQuestion}
        onAnswer={handleAnswer}
      />
      {toast && <Toast message={toast.message} onClose={hideToast} />}
    </QuizLayout>
  );
}
