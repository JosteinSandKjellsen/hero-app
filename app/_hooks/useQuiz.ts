'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from './useToast';
import { questions } from '../_data/questions';
import { personalities } from '../_data/personalities';
import { AppError, ValidationError } from '../_lib/errors';
import { photoSchema } from '../_lib/utils/validation/photoValidation';
import { validateColorConsistency, logColorMismatch, getConsistentColor } from '../_lib/utils/validation/colorValidation';
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

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

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

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
      // Skip camera step if gender is robot
      if (userData?.gender === 'robot') {
        handlePhotoTaken(null);
      } else {
        setShowCamera(true);
      }
    }
  };

  const generateHeroImage = async (
    personality: string,
    gender: 'male' | 'female' | 'robot',
    color: HeroColor,
    photo?: string,
    retryCount = 0
  ): Promise<string> => {
    try {
      const response = await fetch(`${window.location.origin}/api/hero-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality,
          gender,
          color,
          originalPhoto: photo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AppError(errorData.error || tErrors('heroImageError'));
      }

      const data = await response.json();
      
      if (!data.imageUrl) {
        throw new AppError(tErrors('noImageUrl'));
      }

      return data.imageUrl;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying image generation (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(RETRY_DELAY);
        return generateHeroImage(personality, gender, color, photo, retryCount + 1);
      }
      throw error;
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
      const dominantPersonality = results[0];
      const selectedColor = dominantPersonality.color;

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

      // Calculate percentage scores once and reuse
      const total = Object.values(answers).reduce((a: number, b: number) => a + b, 0);
      const scores = {
        red: Math.round((answers.red / total) * 100),
        yellow: Math.round((answers.yellow / total) * 100),
        green: Math.round((answers.green / total) * 100),
        blue: Math.round((answers.blue / total) * 100)
      };

      // Step 1: Generate hero name first
      const nameResponse = await fetch(`${window.location.origin}/api/hero-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality: t(`personalities.${selectedColor}.name`),
          gender: userData.gender,
          color: selectedColor,
          language: locale,
          scores,
        }),
      });

      const nameData = await nameResponse.json();
      
      if (!nameResponse.ok) {
        throw new AppError(nameData.error || tErrors('heroNameError'));
      }

      if (!nameData.name) {
        throw new AppError(tErrors('heroNameError'));
      }

      // Step 2: Generate AI image
      setGenerationStep('process');
      setGenerationStep('generate');

      const imageUrl = await generateHeroImage(
        t(`personalities.${selectedColor}.name`),
        userData.gender,
        selectedColor,
        photo || undefined
      );

      // Step 3: Validate color consistency before updating state
      const colorValidation = {
        cardColor: selectedColor,
        nameColor: selectedColor,
        imageColor: selectedColor
      };

      if (!validateColorConsistency(colorValidation)) {
        logColorMismatch({
          expected: selectedColor,
          actual: {
            card: selectedColor,
            name: selectedColor,
            image: selectedColor
          }
        });
        
        // If we detect a mismatch, ensure we're using the dominant color
        const consistentColor = getConsistentColor(colorValidation) || selectedColor;
        
        if (consistentColor !== dominantPersonality.color) {
          return handlePhotoTaken(photo); // Retry with consistent color
        }
      }

      // Step 4: Update state only after validation
      setPhotoUrl(imageUrl);
      setHeroName(nameData.name);
      setGenerationStep('complete');
        
      // Track hero generation statistics
      try {
        await fetch(`${window.location.origin}/api/hero-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            color: selectedColor
          }),
        });
      } catch (statsError) {
        // Log but don't fail if stats tracking fails
        console.error('Failed to track hero statistics:', statsError);
      }
      
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
