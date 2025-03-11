'use client';

import { useMemo } from 'react';
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
}

interface HeroCarouselProps {
  heroes: Hero[];
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

  .carousel-rotator--auto {
    animation: carousel-rotate 48s infinite;
  }

  @keyframes carousel-rotate {
    0%, 2.083% { transform: translateZ(-${RADIUS}px) rotateY(0); }
    8.333%, 10.416% { transform: translateZ(-${RADIUS}px) rotateY(-30deg); }
    16.666%, 18.749% { transform: translateZ(-${RADIUS}px) rotateY(-60deg); }
    24.999%, 27.082% { transform: translateZ(-${RADIUS}px) rotateY(-90deg); }
    33.332%, 35.415% { transform: translateZ(-${RADIUS}px) rotateY(-120deg); }
    41.665%, 43.748% { transform: translateZ(-${RADIUS}px) rotateY(-150deg); }
    49.998%, 52.081% { transform: translateZ(-${RADIUS}px) rotateY(-180deg); }
    58.331%, 60.414% { transform: translateZ(-${RADIUS}px) rotateY(-210deg); }
    66.664%, 68.747% { transform: translateZ(-${RADIUS}px) rotateY(-240deg); }
    74.997%, 77.080% { transform: translateZ(-${RADIUS}px) rotateY(-270deg); }
    83.330%, 85.413% { transform: translateZ(-${RADIUS}px) rotateY(-300deg); }
    91.663%, 93.746% { transform: translateZ(-${RADIUS}px) rotateY(-330deg); }
    100% { transform: translateZ(-${RADIUS}px) rotateY(-360deg); }
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

export function HeroCarousel({ heroes }: HeroCarouselProps): JSX.Element {
  // Prepare image URLs for preloading
  const imageUrls = useMemo(() => {
    return heroes.map(hero => `/api/hero-image/${hero.imageId}`);
  }, [heroes]);

  // Preload images
  const imagesLoaded = useImagePreloader(imageUrls);

  // Create an array of all card positions
  const cardPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      positions.push({
        hero: heroes[i % heroes.length],
        angle: i * ANGLE_STEP
      });
    }
    return positions;
  }, [heroes]);

  if (heroes.length === 0) {
    return <div className="text-center text-gray-500">No heroes available</div>;
  }

  if (!imagesLoaded) {
    return (
      <div className="relative w-full overflow-hidden">
        <div className="relative min-h-[720px] flex items-center justify-center p-8">
          <div className="w-[400px] h-[720px] rounded-xl border-[10px] border-gray-200 bg-white overflow-hidden animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CAROUSEL_STYLES}</style>
      <div className="relative w-full select-none py-8">
        <div className="relative h-[800px] flex items-center justify-center">
          <div className="carousel-container">
            <div className="carousel-scene">
              <div className="carousel-rotator carousel-rotator--auto">
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
