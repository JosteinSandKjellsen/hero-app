'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useImagePreloader } from '@/app/_hooks/useImagePreloader';
import { LatestHeroCard } from './LatestHeroCard';
import { CardBackside } from './CardBackside';
import { HeroColor } from '@/app/_lib/types/api';

interface Hero {
  id: number;
  name: string;
  userName: string;
  personalityType: string;
  imageId: string;
  color: HeroColor;
  gender: string;
  colorScores: Record<string, number>;
  createdAt: string;
  carousel: boolean;
}

interface HeroCarouselProps {
  initialHeroes: Hero[];
}

const RADIUS = 900;
const CARD_COUNT = 12; // Number of cards in the carousel
const ANGLE_STEP = 360 / CARD_COUNT;
const ROTATION_TIME = 5000; // 5 seconds per card (3s pause + 2s rotation)
const TRANSITION_TIME = 2000; // 2 second rotation for smoother timing

const CAROUSEL_STYLES = `
  .carousel-container {
    position: relative;
    width: 400px;
    height: 720px;
    margin: 0 auto;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }

  .carousel-scene {
    position: absolute;
    width: 100%;
    height: 100%;
    perspective: 1500px;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    transform: scale(0.9);
    will-change: transform;
  }

  .carousel-rotator {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    transform: translateZ(-${RADIUS}px);
    will-change: transform;
  }

  .carousel-item {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    will-change: transform;
  }

  .card-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    transition: transform 2s cubic-bezier(0.4, 0.0, 0.3, 1);
    will-change: transform;
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transform-origin: center center;
    will-change: transform;
  }

  .card-back {
    transform: rotateY(180deg);
    z-index: 1;
  }
`;

export function HeroCarousel({ initialHeroes }: HeroCarouselProps): JSX.Element {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [cycleStartTime, setCycleStartTime] = useState(0);
  
  // Store card positions as a circular array
  const [cardHeroes, setCardHeroes] = useState<Array<Hero | null>>(Array(CARD_COUNT).fill(null));
  
  // Track initialization to prevent resets
  const initializedRef = useRef(false);
  const heroesRef = useRef<Hero[]>([]);
  
  // Update heroes ref when heroes change
  useEffect(() => {
    heroesRef.current = heroes;
  }, [heroes]);

  // Initialize with heroes - only on first load
  useEffect(() => {
    if (initialHeroes.length > 0 && heroes.length === 0 && !initializedRef.current) {
      setHeroes(initialHeroes);
      
      // Initialize the carousel with sequential heroes
      const initialCards = Array(CARD_COUNT).fill(null).map((_, index) => {
        const heroIndex = index % initialHeroes.length;
        return initialHeroes[heroIndex];
      });
      
      setCardHeroes(initialCards);
      setCycleStartTime(0); // Reset cycle start time for proper initialization
      initializedRef.current = true;
    }
  }, [initialHeroes, heroes.length]);
  
  // Handle updates to heroes without resetting animation
  useEffect(() => {
    if (initialHeroes.length === 0 || heroes.length === 0) return;

    // Update existing heroes with fresh data (preserving IDs)
    const updatedHeroes = heroes.map(existingHero => {
      const freshHero = initialHeroes.find(h => h.id === existingHero.id);
      return freshHero || existingHero; // Use fresh data if available, otherwise keep existing
    });

    // Find any genuinely new heroes (not just data refreshes)
    const newHeroes = initialHeroes.filter(
      newHero => !heroes.some(currentHero => currentHero.id === newHero.id)
    );

    // Only update state if there are actual changes (new heroes or data updates)
    const hasNewHeroes = newHeroes.length > 0;
    const hasUpdatedData = updatedHeroes.some((hero, index) => 
      JSON.stringify(hero) !== JSON.stringify(heroes[index])
    );

    if (hasNewHeroes) {
      setHeroes(current => {
        const updated = [...updatedHeroes, ...newHeroes];
        return updated;
      });
    } else if (hasUpdatedData) {
      // Silent update of existing hero data without affecting animation
      setHeroes(updatedHeroes);
    }
  }, [initialHeroes]); // Remove heroes dependency to prevent loops

  // Handle rotation and card updates - start when heroes are available
  useEffect(() => {
    if (heroes.length === 0) return;
    
    let animationFrameId: number;
    let lastCardIndex = -1;
    let isMounted = true;
    
    const updateRotation = (currentTime: number): void => {
      if (!isMounted) return;
      
      const currentHeroes = heroesRef.current;
      if (currentHeroes.length === 0) return;
      
      if (cycleStartTime === 0) {
        setCycleStartTime(currentTime);
        animationFrameId = requestAnimationFrame(updateRotation);
        return;
      }
      
      const elapsedTime = currentTime - cycleStartTime;
      
      // Safety check for invalid values
      if (ROTATION_TIME <= 0 || CARD_COUNT <= 0 || currentHeroes.length === 0) {
        console.warn('Invalid carousel configuration, stopping animation');
        return;
      }
      
      // Calculate current card index based on elapsed time
      const currentCardIndex = Math.floor(elapsedTime / ROTATION_TIME) % CARD_COUNT;
      
      // Calculate smooth rotation angle
      const baseRotation = Math.floor(elapsedTime / ROTATION_TIME) * ANGLE_STEP;
      const cycleTime = elapsedTime % ROTATION_TIME;

      // Stay still for ROTATION_TIME - TRANSITION_TIME, then rotate
      const pauseTime = ROTATION_TIME - TRANSITION_TIME;
      const inTransition = cycleTime > pauseTime;
      
      let rotationAngle = baseRotation;
      
      if (inTransition) {
        const transitionTime = cycleTime - pauseTime;
        const progress = Math.min(1, Math.max(0, transitionTime / TRANSITION_TIME));
        
        // Use custom easing for smoother, slower transition
        const easeProgress = progress < 0.5
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const additionalRotation = easeProgress * ANGLE_STEP;
        rotationAngle += additionalRotation;
      }
      
      // Debug logging when animation might be jumping (commented out for production)
      // const rotationDiff = Math.abs(rotationAngle - currentRotation);
      // if (rotationDiff > ANGLE_STEP) {
      //   console.log('Large rotation jump detected:', {
      //     currentRotation,
      //     newRotationAngle: rotationAngle,
      //     diff: rotationDiff,
      //     currentCardIndex,
      //     inTransition,
      //     elapsedTime,
      //     cycleTime
      //   });
      // }
      
      if (isMounted) {
        setCurrentRotation(rotationAngle);
      }
      
      // Update cards when they're completely hidden (not during transition)
      const shouldUpdateCards = !inTransition && currentCardIndex !== lastCardIndex;
      
      if (shouldUpdateCards && isMounted) {
        // console.log('Updating card at position:', currentCardIndex);
        lastCardIndex = currentCardIndex;
        
        // Update the card that's on the opposite side (hidden from view)
        const hiddenPosition = (currentCardIndex + 6) % CARD_COUNT;
        
        setCardHeroes(prevCards => {
          if (!prevCards || prevCards.length !== CARD_COUNT) {
            console.warn('Invalid card array state, skipping update');
            return prevCards;
          }
          
          const newCards = [...prevCards];
          const lastCard = prevCards[(hiddenPosition + CARD_COUNT - 1) % CARD_COUNT];
          
          if (lastCard && currentHeroes.length > 0) {
            const lastHeroIndex = currentHeroes.findIndex(hero => hero.id === lastCard.id);
            const nextHeroIndex = lastHeroIndex >= 0 ? (lastHeroIndex + 1) % currentHeroes.length : 0;
            newCards[hiddenPosition] = currentHeroes[nextHeroIndex];
          }
          
          return newCards;
        });
      }
      
      if (isMounted) {
        animationFrameId = requestAnimationFrame(updateRotation);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateRotation);
    
    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [heroes.length > 0]); // Start animation when heroes become available
  
  // Preload images - use stable URLs to prevent unnecessary reloading
  const imageUrls = useMemo(() => {
    const urls = cardHeroes
      .filter(Boolean)
      .map(hero => `/api/hero-image/${hero!.imageId}`);
    
    // Only return new array if URLs actually changed
    return urls;
  }, [cardHeroes.map(hero => hero?.imageId).join(',')]);
  
  const imagesLoaded = useImagePreloader(imageUrls);

  // Create card positions with stable keys for smooth transitions
  const cardPositions = useMemo(() => {
    return cardHeroes.map((hero, index) => {
      // Use position-based keys to prevent DOM recreation
      const stableKey = `carousel-position-${index}`;
      return {
        hero,
        angle: index * ANGLE_STEP,
        key: stableKey
      };
    });
  }, [cardHeroes]);

  const LoadingState = (): JSX.Element => (
    <div className="relative w-full overflow-hidden">
      <div className="relative min-h-[720px] flex flex-col items-center justify-center p-8 gap-4">
        <div className="w-[400px] h-[720px] rounded-xl border-[10px] border-gray-200 bg-white overflow-hidden animate-pulse" />
        <div className="text-center text-gray-500">
          {heroes.length === 0 
            ? "Loading heroes..."
            : "Loading hero images..."}
        </div>
      </div>
    </div>
  );

  // Enhanced loading conditions with error handling
  if (heroes.length === 0) {
    return <LoadingState />;
  }

  // Check if we have valid cards before checking images
  const hasValidCards = cardHeroes.some(hero => hero !== null);
  if (!hasValidCards) {
    console.warn('No valid cards in carousel, showing loading state');
    return <LoadingState />;
  }

  // Don't show loading for image updates if carousel is already running
  if (!imagesLoaded && cycleStartTime === 0) {
    return <LoadingState />;
  }

  return (
    <>
      <style>{CAROUSEL_STYLES}</style>
      <div className="relative w-full select-none py-8">
        <div className="relative h-[800px] flex items-center justify-center">
          <div className="carousel-container">
            <div className="carousel-scene">
              <div 
                className="carousel-rotator"
                style={{
                  transform: `translateZ(-${RADIUS}px) rotateY(-${currentRotation}deg)`,
                }}
              >
                {cardPositions.map(({ hero, angle, key }) => hero && (
                  <div
                    key={key}
                    className="carousel-item"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                    }}
                  >
                    <div className="card-wrapper">
                      <div className="card-face card-back">
                        <CardBackside />
                      </div>
                      <div className="card-face">
                        <LatestHeroCard
                          hero={hero}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
