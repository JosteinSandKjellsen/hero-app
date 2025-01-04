'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from './useToast';
import { questions } from '../_data/questions';
import { personalities } from '../_data/personalities';
import { AppError, ValidationError } from '../_lib/errors';
import { photoSchema } from '../_lib/utils/validation/photoValidation';
import type { QuizResult, UserData } from '../_lib/types/quiz';
import type { PersonalityResult } from '../_lib/types/personality';
import type { GenerationStep } from '../_lib/types/loading';
import type { HeroColor } from '../_lib/types/api';

const initialResult: QuizResult = {
  red: 0,
  yellow: 0,
  green: 0,
  blue: 0,
};

interface UseQuizReturn {
  userData: UserData | null;
  currentQuestion: number;
  showCamera: boolean;
  showResults: boolean;
  photoUrl: string | null;
  heroName: string | null;
  isGeneratingImage: boolean;
  isGeneratingName: boolean;
  generationStep: GenerationStep;
  handleRegistration: (data: UserData) => void;
  handleAnswer: (type: HeroColor) => void;
  handlePhotoTaken: (photo: string | null) => Promise<void>;
  calculateResults: () => PersonalityResult[];
  resetQuiz: () => void;
}

export function useQuiz(): UseQuizReturn {
  const t = useTranslations();
  const locale = useLocale();
  const tErrors = useTranslations('errors');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizResult>(initialResult);
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [heroName, setHeroName] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('upload');
  
  const { showToast } = useToast();

  const handleRegistration = (data: UserData): void => {
    setUserData(data);
  };

  const handleAnswer = (type: HeroColor): void => {
    setAnswers((prev: QuizResult) => ({ ...prev, [type]: prev[type] + 1 }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowCamera(true);
    }
  };

  const handlePhotoTaken = async (photo: string | null): Promise<void> => {
    if (!userData) {
      showToast(tErrors('missingUserData'));
      return;
    }

    try {
      setIsGeneratingImage(true);
      setIsGeneratingName(true);
      setShowCamera(false);
      setGenerationStep('upload');
      
      const results = calculateResults();

      // Only validate photo if one was provided
      if (photo !== null) {
        try {
          photoSchema.parse(photo);
        } catch (error) {
          if (error instanceof Error) {
            throw new ValidationError(tErrors('invalidPhotoFormat'));
          }
          throw error;
        }
      }
      const dominantPersonality = results[0];

      // Generate hero name
      const nameResponse = await fetch(`${window.location.origin}/api/hero-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality: t(`personalities.${dominantPersonality.color}.name`),
          gender: userData.gender,
          color: dominantPersonality.color,
          language: locale,
        }),
      });

      const nameData = await nameResponse.json();
      
      if (!nameResponse.ok) {
        throw new AppError(nameData.error || tErrors('heroNameError'));
      }

      if (!nameData.name) {
        throw new AppError(tErrors('heroNameError'));
      }
      
      setGenerationStep('process');

      // Generate AI image with error handling
      let imageUrl: string | null = null;
      try {
        setGenerationStep('generate');
        const imageResponse = await fetch(`${window.location.origin}/api/hero-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personality: t(`personalities.${dominantPersonality.color}.name`),
            gender: userData.gender,
            color: dominantPersonality.color,
            originalPhoto: photo || undefined,
          }),
        });

        if (!imageResponse.ok) {
          throw new AppError(tErrors('heroImageError'));
        }

        const imageData = await imageResponse.json();
        
        if (!imageData.imageUrl) {
          throw new AppError(tErrors('noImageUrl'));
        }

        imageUrl = imageData.imageUrl;
      } catch (error) {
        console.error('Error generating hero image:', error);
        const message = error instanceof AppError 
          ? error.message 
          : tErrors('heroImageGenerationError');
        
        showToast(message);
        setShowCamera(true);
        return;
      }

      setPhotoUrl(imageUrl);
      setHeroName(nameData.name);
      setGenerationStep('complete');
      setShowResults(true);
    } catch (error) {
      console.error('Error in photo processing flow:', error);
      let message = tErrors('generic');
      if (error instanceof AppError) {
        message = error.message;
      } else if (error instanceof SyntaxError) {
        message = tErrors('network');
      }
      
      showToast(message);
      setPhotoUrl(null);
      setHeroName(null);
      setShowCamera(true);
    } finally {
      setIsGeneratingImage(false);
      setIsGeneratingName(false);
    }
  };

  const calculateResults = (): PersonalityResult[] => {
    const total = Object.values(answers).reduce((a: number, b: number) => a + b, 0);
    return personalities
      .map((personality) => ({
        ...personality,
        name: t(`personalities.${personality.color}.name`),
        heroName: t(`personalities.${personality.color}.heroName`),
        percentage: Math.round((answers[personality.color as keyof QuizResult] / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const resetQuiz = (): void => {
    setUserData(null);
    setCurrentQuestion(0);
    setAnswers(initialResult);
    setShowCamera(false);
    setShowResults(false);
    setPhotoUrl(null);
    setHeroName(null);
    setIsGeneratingImage(false);
    setIsGeneratingName(false);
    setGenerationStep('upload');
  };

  return {
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
  };
}
