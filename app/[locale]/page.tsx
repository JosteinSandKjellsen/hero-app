'use client';

import { QuizLayout } from '../_components/layout/QuizLayout';
import { RegistrationForm } from '../_components/registration/RegistrationForm';
import { QuizSection } from '../_components/quiz/QuizSection';
import { CameraSection } from '../_components/camera/CameraSection';
import { ResultsSection } from '../_components/results/ResultsSection';
import { Toast } from '../_components/ui/Toast';
import { LoadingState } from '../_components/ui/LoadingState';
import { useQuiz } from '../_hooks/useQuiz';
import { useToast } from '../_hooks/useToast';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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
    canGoBack,
    handleGoBack,
  } = useQuiz();

  const { toast, hideToast } = useToast();
  const pathname = usePathname();
  
  // State to ensure layout recalculation on route changes
  const [routeKey, setRouteKey] = useState('');
  
  useEffect(() => {
    // Update the key when the pathname changes to force remounting of components
    setRouteKey(pathname);
    
    // Force layout recalculation
    const timer = setTimeout(() => {
      window.scrollTo(0, 0); // Reset scroll position
      window.dispatchEvent(new Event('resize')); // Force layout recalculation
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  // No need to determine currentVariant here as we use it directly in the conditionals

  // Common toast element
  const toastElement = toast && <Toast message={toast.message} onClose={hideToast} />;

  // Improve the registration page handling to prevent any blinking effects
  if (!userData) {
    return (
      <QuizLayout showBackground variant="registration" key={`registration-${routeKey}`}>
        <RegistrationForm onSubmit={handleRegistration} />
        {toastElement}
      </QuizLayout>
    );
  }

  if (isGeneratingImage || isGeneratingName) {
    return (
      <QuizLayout variant="camera" key={`loading-${routeKey}`}>
        <LoadingState currentStep={generationStep} />
      </QuizLayout>
    );
  }

  if (showResults && photoUrl && heroName) {
    const results = calculateResults();
    return (
      <QuizLayout variant="results" key={`results-${routeKey}`}>
        <ResultsSection 
          results={results} 
          photoUrl={photoUrl}
          userData={userData}
          onReset={resetQuiz}
          heroName={heroName}
        />
        {toastElement}
      </QuizLayout>
    );
  }

  if (showCamera) {
    return (
      <QuizLayout variant="camera" key={`camera-${routeKey}`}>
        <CameraSection onPhotoTaken={handlePhotoTaken} />
        {toastElement}
      </QuizLayout>
    );
  }

  return (
    <QuizLayout variant="quiz" key={`quiz-${routeKey}`}>
      <QuizSection
        currentQuestion={currentQuestion}
        onAnswer={handleAnswer}
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
      />
      {toastElement}
    </QuizLayout>
  );
}

// Add metadata export for static optimization
export const dynamic = 'force-static';
