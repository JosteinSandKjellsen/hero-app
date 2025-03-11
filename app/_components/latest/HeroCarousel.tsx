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
const CARD_COUNT = 12; // Increased number of cards
const ANGLE_STEP = 360 / CARD_COUNT;

const CAROUSEL_STYLES = `
  .carousel-container {
    position: relative;
    width: 400px;
    height: 720px;
    margin: 0 auto;
    transform-style: preserve-3d;
  }

  .carousel-scene {
    position: absolute;
    width: 100%;
    height: 100%;
    perspective: 1000px;
    transform-style: preserve-3d;
  }

  .carousel-rotator {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateZ(-${RADIUS}px);
  }

  .carousel-item {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    transform-style: preserve-3d;
  }

  .card-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .card-back {
    transform: rotateY(180deg);
  }

  /* Fix for Safari */
  .carousel-container, .carousel-scene, .carousel-rotator, .carousel-item, .card-wrapper {
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
  }
`;

export function HeroCarousel({ initialHeroes }: HeroCarouselProps): JSX.Element {
  const [allHeroes, setAllHeroes] = useState<Hero[]>([]);
  const [visibleHeroIndices, setVisibleHeroIndices] = useState<number[]>([]);
  const [nextHeroIndex, setNextHeroIndex] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

  // Initialize with initial heroes
  useEffect(() => {
    if (initialHeroes.length > 0 && allHeroes.length === 0) {
      setAllHeroes(initialHeroes);
      setVisibleHeroIndices(
        Array.from({ length: CARD_COUNT }, (_, i) => i % initialHeroes.length)
      );
      setNextHeroIndex(CARD_COUNT);
    }
  }, [initialHeroes, allHeroes]);

  // Handle updates to heroes without disrupting rotation
  useEffect(() => {
    if (initialHeroes.length === 0) return;

    // Find any new heroes
    const newHeroes = initialHeroes.filter(
      newHero => !allHeroes.some(currentHero => currentHero.id === newHero.id)
    );

    if (newHeroes.length > 0) {
      setAllHeroes(current => [...current, ...newHeroes]);
    }
  }, [initialHeroes, allHeroes]);

  // Track rotation and update heroes
  useEffect(() => {
    let animationFrameId: number;

    const updateRotation = (currentTime: number): void => {
      // Time-based rotation with built-in pauses
      const timePerCard = 5000; // 4s rotation + 1s pause
      const baseRotation = (currentTime / timePerCard) * (360 / CARD_COUNT);
      const cardIndex = Math.floor(baseRotation / (360 / CARD_COUNT));
      const cycleTime = currentTime % timePerCard;
      
      // Calculate smooth rotation with pause
      const cardStartAngle = cardIndex * (360 / CARD_COUNT);
      const cardRotation = cycleTime < 4000
        ? (cycleTime / 4000) * (360 / CARD_COUNT) // Smooth rotation during first 4s
        : (360 / CARD_COUNT);                     // Hold position for last 1s
      
      const currentAngle = cardStartAngle + cardRotation;
      setCurrentRotation(currentAngle);

      // Calculate which cards are behind the viewer (not visible)
      const hiddenStartAngle = (currentAngle + 90) % 360;
      const hiddenEndAngle = (currentAngle + 270) % 360;

      visibleHeroIndices.forEach((heroIndex, cardIndex) => {
        const cardAngle = (cardIndex * ANGLE_STEP) % 360;
        if (isAngleBetween(cardAngle, hiddenStartAngle, hiddenEndAngle)) {
          // Card is hidden, update its hero
          setVisibleHeroIndices(prev => {
            const updated = [...prev];
            updated[cardIndex] = nextHeroIndex % allHeroes.length;
            return updated;
          });
          setNextHeroIndex(current => current + 1);
        }
      });

      animationFrameId = requestAnimationFrame(updateRotation);
    };

    animationFrameId = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [visibleHeroIndices, nextHeroIndex, allHeroes.length]);

  // Preload next few images
  const imageUrls = useMemo(() => {
    if (allHeroes.length === 0) return [];
    
    const visibleHeroes = visibleHeroIndices.map(index => allHeroes[index % allHeroes.length]);
    const nextFewIndices = Array.from({ length: 3 }, (_, i) => 
      (nextHeroIndex + i) % allHeroes.length
    );
    const nextFewHeroes = nextFewIndices.map(index => allHeroes[index]);
    const heroesToPreload = [...visibleHeroes, ...nextFewHeroes].filter(Boolean);
    
    return heroesToPreload.map(hero => `/api/hero-image/${hero.imageId}`);
  }, [allHeroes, visibleHeroIndices, nextHeroIndex]);

  // Preload images
  const imagesLoaded = useImagePreloader(imageUrls);

  // Create card positions with current heroes
  const cardPositions = useMemo(() => {
    return visibleHeroIndices.map((heroIndex, i) => ({
      hero: allHeroes[heroIndex % allHeroes.length],
      angle: i * ANGLE_STEP
    }));
  }, [allHeroes, visibleHeroIndices]);

  // Helper function to check if an angle is between two other angles
  const isAngleBetween = (angle: number, start: number, end: number): boolean => {
    if (start <= end) {
      return angle >= start && angle <= end;
    } else {
      return angle >= start || angle <= end;
    }
  };

  const LoadingState = (): JSX.Element => (
    <div className="relative w-full overflow-hidden">
      <div className="relative min-h-[720px] flex flex-col items-center justify-center p-8 gap-4">
        <div className="w-[400px] h-[720px] rounded-xl border-[10px] border-gray-200 bg-white overflow-hidden animate-pulse" />
        <div className="text-center text-gray-500">
          {allHeroes.length === 0 
            ? "Loading heroes..."
            : "Loading hero images..."}
        </div>
      </div>
    </div>
  );

  if (allHeroes.length === 0 || !imagesLoaded) {
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
                  transform: `translateZ(-${RADIUS}px) rotateY(-${currentRotation}deg)`
                }}
              >
                {cardPositions.map(({ hero, angle }, index) => (
                  <div
                    key={`${hero.id}-${index}`}
                    className="carousel-item"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`
                    }}
                  >
                    <div className="card-wrapper">
                      <div className="card-back">
                        <CardBackside color={hero.color} />
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
