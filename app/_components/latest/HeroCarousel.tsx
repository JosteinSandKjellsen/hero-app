'use client';

import { useEffect, useMemo, useState } from 'react';
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
    transition: transform 2s cubic-bezier(0.4, 0.0, 0.3, 1);
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

  // Initialize with heroes
  useEffect(() => {
    if (initialHeroes.length > 0 && heroes.length === 0) {
      setHeroes(initialHeroes);
      
      // Initialize the carousel with sequential heroes
      const initialCards = Array(CARD_COUNT).fill(null).map((_, index) => {
        const heroIndex = index % initialHeroes.length;
        return initialHeroes[heroIndex];
      });
      
      setCardHeroes(initialCards);
      setCycleStartTime(performance.now());
    }
  }, [initialHeroes, heroes.length]);
  
  // Handle updates to heroes
  useEffect(() => {
    if (initialHeroes.length === 0) return;

    // Find any new heroes
    const newHeroes = initialHeroes.filter(
      newHero => !heroes.some(currentHero => currentHero.id === newHero.id)
    );

    if (newHeroes.length > 0) {
      setHeroes(current => [...current, ...newHeroes]);
    }
  }, [initialHeroes, heroes]);

  // Handle rotation and card updates
  useEffect(() => {
    if (heroes.length === 0) return;
    
    let animationFrameId: number;
    let lastCardIndex = -1;
    
    const updateRotation = (currentTime: number): void => {
      if (cycleStartTime === 0) {
        setCycleStartTime(currentTime);
        animationFrameId = requestAnimationFrame(updateRotation);
        return;
      }
      
      const elapsedTime = currentTime - cycleStartTime;
      
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
        const progress = transitionTime / TRANSITION_TIME;
        
        // Use custom easing for smoother, slower transition
        const easeProgress = progress < 0.5
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const additionalRotation = easeProgress * ANGLE_STEP;
        rotationAngle += additionalRotation;
      }
      setCurrentRotation(rotationAngle);
      
      // Update cards near the end of transition
      const shouldUpdateCards = inTransition && cycleTime > (ROTATION_TIME - TRANSITION_TIME * 0.05);
      
      if (shouldUpdateCards && currentCardIndex !== lastCardIndex) {
        lastCardIndex = currentCardIndex;
        
        // Use separate frame for card updates
        requestAnimationFrame(() => {
          const hiddenPosition = (currentCardIndex + 6) % CARD_COUNT;
          
          setCardHeroes(prevCards => {
            const newCards = [...prevCards];
            const lastHeroIndex = heroes.findIndex(hero => 
              hero.id === prevCards[(hiddenPosition + CARD_COUNT - 1) % CARD_COUNT]?.id
            );
            const nextHeroIndex = (lastHeroIndex + 1) % heroes.length;
            newCards[hiddenPosition] = heroes[nextHeroIndex];
            return newCards;
          });
        });
      }
      
      animationFrameId = requestAnimationFrame(updateRotation);
    };
    
    animationFrameId = requestAnimationFrame(updateRotation);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heroes, cycleStartTime]);
  
  // Preload images
  const imageUrls = useMemo(() => {
    return cardHeroes
      .filter(Boolean)
      .map(hero => `/api/hero-image/${hero!.imageId}`);
  }, [cardHeroes]);
  
  const imagesLoaded = useImagePreloader(imageUrls);

  // Create card positions with current heroes, and ensure stable keys
  const cardPositions = useMemo(() => {
    return cardHeroes.map((hero, index) => {
      const positionId = hero ? `${hero.id}-pos-${index}` : `empty-pos-${index}`;
      return {
        hero,
        angle: index * ANGLE_STEP,
        key: positionId
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

  if (heroes.length === 0 || !imagesLoaded) {
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
