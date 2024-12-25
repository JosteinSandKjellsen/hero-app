'use client';

import { useState } from 'react';
import { useToast } from './useToast';
import { questions } from '../_data/questions';
import { personalities } from '../_data/personalities';
import { AppError, ValidationError } from '../_lib/errors';
import { photoSchema } from '../_lib/utils/validation/photoValidation';
import type { QuizResult, UserData, PersonalityType } from '../_lib/types';

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
  handleRegistration: (data: UserData) => void;
  handleAnswer: (type: 'red' | 'yellow' | 'green' | 'blue') => void;
  handlePhotoTaken: (photo: string) => Promise<void>;
  calculateResults: () => (PersonalityType & { percentage: number })[];
  resetQuiz: () => void;
}

export function useQuiz(): UseQuizReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizResult>(initialResult);
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [heroName, setHeroName] = useState<string | null>(null);
  
  const { showToast } = useToast();

  const handleRegistration = (data: UserData): void => {
    setUserData(data);
  };

  const handleAnswer = (type: 'red' | 'yellow' | 'green' | 'blue'): void => {
    setAnswers((prev: QuizResult) => ({ ...prev, [type]: prev[type] + 1 }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowCamera(true);
    }
  };

  const handlePhotoTaken = async (photo: string): Promise<void> => {
    if (!userData) {
      showToast('Brukerdata mangler. Vennligst start på nytt.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setIsGeneratingName(true);
      setShowCamera(false);
      
      // Validate photo
      try {
        photoSchema.parse(photo);
      } catch (error) {
        if (error instanceof Error) {
          throw new ValidationError('Ugyldig bildeformat. Vennligst prøv igjen.');
        }
        throw error;
      }

      const results = calculateResults();
      const dominantPersonality = results[0];

      // Generate hero name
      const nameResponse = await fetch('/api/hero-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality: dominantPersonality.name,
          gender: userData.gender,
          color: dominantPersonality.color,
        }),
      });

      if (!nameResponse.ok) {
        throw new AppError('Kunne ikke generere heltenavn');
      }

      const nameData = await nameResponse.json();
      
      // Generate AI image
      const imageResponse = await fetch('/api/hero-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality: dominantPersonality.name,
          gender: userData.gender,
          color: dominantPersonality.color,
          originalPhoto: photo,
        }),
      });

      if (!imageResponse.ok) {
        throw new AppError('Kunne ikke generere superhelt-bilde');
      }

      const imageData = await imageResponse.json();
      
      if (!imageData.imageUrl) {
        throw new AppError('Ingen bilde-URL mottatt fra serveren');
      }

      setPhotoUrl(imageData.imageUrl);
      setHeroName(nameData.name);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing photo:', error);
      const message = error instanceof AppError 
        ? error.message 
        : 'Det oppstod en feil ved behandling av bildet. Vennligst prøv igjen.';
      
      showToast(message);
      setPhotoUrl(null);
      setShowCamera(true);
    } finally {
      setIsGeneratingImage(false);
      setIsGeneratingName(false);
    }
  };

  const calculateResults = (): (PersonalityType & { percentage: number })[] => {
    const total = Object.values(answers).reduce((a: number, b: number) => a + b, 0);
    return personalities
      .map((personality: PersonalityType) => ({
        ...personality,
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
    handleRegistration,
    handleAnswer,
    handlePhotoTaken,
    calculateResults,
    resetQuiz,
  };
}
