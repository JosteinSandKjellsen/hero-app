'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from './useToast';
import { useSessionSelection } from './useSessionSelection';
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
const MAX_IMAGE_RETRIES = 2; // Allow 2 additional retries after initial generation
const RETRY_DELAY = 2000; // 2 seconds

interface UseQuizReturn {
  userData: UserData | null;
  currentQuestion: number;
  showCamera: boolean;
  showResults: boolean;
  showImagePreview: boolean;
  photoUrl: string | null;
  heroName: string | null;
  isGeneratingImage: boolean;
  isGeneratingName: boolean;
  isAcceptingImage: boolean;
  generationStep: GenerationStep;
  retryCount: number;
  maxRetries: number;
  // Session-related properties
  activeSessions: Array<{ id: string; name: string; description?: string; startDate: string; endDate?: string; active: boolean }>;
  selectedSessionId: string | null;
  showSessionModal: boolean;
  isLoadingSessions: boolean;
  handleRegistration: (data: UserData) => void;
  handleAnswer: (type: HeroColor) => void;
  handlePhotoTaken: (photo: string | null) => Promise<void>;
  calculateResults: () => PersonalityResult[];
  resetQuiz: () => void;
  handleAcceptImage: () => Promise<void>;
  handleRetryImage: () => Promise<void>;
  // Session-related methods
  handleSessionSelected: (sessionId: string | null) => void;
  resetSessionSelection: () => void;
}

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export function useQuiz(): UseQuizReturn {
  const t = useTranslations();
  const locale = useLocale();
  const tErrors = useTranslations('errors');
  const tQuizNav = useTranslations('quiz.navigation');
  const { showToast } = useToast();
  
  // Session selection hook
  const {
    activeSessions,
    selectedSessionId,
    showSessionModal,
    isLoading: isLoadingSessions,
    handleSessionSelected,
    resetSessionSelection
  } = useSessionSelection();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizResult>(initialResult);
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [heroName, setHeroName] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('upload');
  const [retryCount, setRetryCount] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [isAcceptingImage, setIsAcceptingImage] = useState(false);

  // Set up browser back navigation handling
  useEffect((): (() => void) => {
    const handlePopState = (e: PopStateEvent): void => {
      e.preventDefault();
      
      // Check if we're in the middle of the quiz (have user data and some progress)
      const hasQuizProgress = userData !== null && (currentQuestion > 0 || showCamera || showResults || showImagePreview);
      
      if (hasQuizProgress) {
        // Get the confirmation message - fallback to English if translation not available
        let confirmMessage: string;
        try {
          confirmMessage = tQuizNav('exitQuizConfirmation');
        } catch (error) {
          // Fallback based on current locale or default to English
          confirmMessage = locale === 'no' 
            ? 'Dette vil avslutte quizen og du mister fremgangen. Fortsette?'
            : 'This will exit the quiz and you will lose your progress. Continue?';
        }
        
        const shouldExit = window.confirm(confirmMessage);
        if (!shouldExit) {
          // Push state back to prevent navigation, preserving query parameters
          window.history.pushState(null, '', window.location.pathname + window.location.search);
          return;
        }
        // If user confirms, reset the quiz
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
      }
    };

    // Add a history state when quiz has progress to catch back navigation
    if (userData !== null && currentQuestion > 0) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }

    window.addEventListener('popstate', handlePopState);
    
    return (): void => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [userData, currentQuestion, showCamera, showResults, showImagePreview, tQuizNav, locale]);

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
    // Store the current photo for potential retries
    setCurrentPhoto(photo);
    await processImageGeneration(photo);
  };

  const processImageGeneration = async (photo: string | null): Promise<void> => {
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
        
      // Show image preview instead of going directly to results
      setShowImagePreview(true);
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
    setShowImagePreview(false);
    setPhotoUrl(null);
    setHeroName(null);
    setIsGeneratingImage(false);
    setIsGeneratingName(false);
    setIsAcceptingImage(false);
    setGenerationStep('upload');
    setRetryCount(0);
    setCurrentPhoto(null);
  };

  const handleAcceptImage = async (): Promise<void> => {
    if (!photoUrl || !heroName || !userData) return;
    
    // For quiz users, ensure a session is selected (only if there are active sessions)
    if (activeSessions.length > 0 && !selectedSessionId) {
      showToast('Please select a session first');
      return;
    }
    
    setIsAcceptingImage(true);
    
    // Track hero generation statistics and save to latest heroes when user accepts
    try {
      const results = calculateResults();
      const dominantPersonality = results[0];
      const selectedColor = dominantPersonality.color;
      
      // Calculate percentage scores
      const total = Object.values(answers).reduce((a: number, b: number) => a + b, 0);
      const scores = {
        red: Math.round((answers.red / total) * 100),
        yellow: Math.round((answers.yellow / total) * 100),
        green: Math.round((answers.green / total) * 100),
        blue: Math.round((answers.blue / total) * 100)
      };
      
      // Extract generation ID from image URL
      const match = photoUrl.match(/generations\/([^/]+)\//) || [];
      const imageId = match[1];
      
      if (!imageId) {
        console.error('Could not extract generation ID from URL:', photoUrl);
        showToast('Failed to save hero: Invalid image ID');
      } else {
        // Track stats and save hero
        const [statsResponse, heroResponse] = await Promise.all([
          // Track stats
          fetch(`${window.location.origin}/api/hero-stats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              color: selectedColor,
              sessionId: selectedSessionId
            }),
          }),
          // Save to latest heroes
          fetch(`${window.location.origin}/api/latest-heroes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: heroName,
              userName: userData.name,
              personalityType: t(`personalities.${selectedColor}.name`),
              imageId,
              color: selectedColor,
              gender: userData.gender,
              colorScores: scores,
              sessionId: selectedSessionId
            }),
          })
        ]);

        // Check responses
        if (!heroResponse.ok) {
          const errorText = await heroResponse.text();
          console.error('Failed to save hero:', errorText);
          
          if (heroResponse.status === 409) {
            console.warn('Hero already saved (duplicate imageId)');
            // Continue anyway - hero is already in database
          } else {
            throw new Error(`Failed to save hero: ${errorText}`);
          }
        }

        if (!statsResponse.ok) {
          console.error('Failed to track stats, but continuing...');
        }
      }
    } catch (error) {
      console.error('Failed to track hero statistics or save to latest heroes:', error);
      showToast('Warning: Hero may not have been saved properly');
    }
    
    setShowImagePreview(false);
    setShowResults(true);
    setIsAcceptingImage(false);
  };

  const handleRetryImage = async (): Promise<void> => {
    if (retryCount >= MAX_IMAGE_RETRIES) return;
    
    setRetryCount(prev => prev + 1);
    setShowImagePreview(false);
    
    // Delete the previous generated image before creating a new one
    if (photoUrl && photoUrl.includes('cdn.leonardo.ai')) {
      try {
        const imageId = photoUrl.match(/generations\/([^/]+)/)?.[1];
        if (imageId) {
          // Fire and forget deletion - don't block on it
          fetch('/api/hero-image/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId, type: 'generated' })
          }).catch(error => console.error('Failed to delete previous image:', error));
        }
      } catch (error) {
        console.error('Error extracting image ID for deletion:', error);
      }
    }
    
    // Retry image generation with the same photo
    await processImageGeneration(currentPhoto);
  };

  return {
    userData,
    currentQuestion,
    showCamera,
    showResults,
    showImagePreview,
    photoUrl,
    heroName,
    isGeneratingImage,
    isGeneratingName,
    isAcceptingImage,
    generationStep,
    retryCount,
    maxRetries: MAX_IMAGE_RETRIES,
    // Session-related properties
    activeSessions,
    selectedSessionId,
    showSessionModal,
    isLoadingSessions,
    handleRegistration,
    handleAnswer,
    handlePhotoTaken,
    calculateResults,
    resetQuiz,
    handleAcceptImage,
    handleRetryImage,
    // Session-related methods
    handleSessionSelected,
    resetSessionSelection,
  };
}
