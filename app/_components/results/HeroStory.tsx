'use client';

import { useState, useEffect } from 'react';
import { generateStory, type StoryRequest } from '../../_lib/services/geminiText';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../_hooks/useToast';

interface HeroStoryProps extends StoryRequest {
  className?: string;
}

export function HeroStory({
  personality,
  gender,
  color,
  language,
  heroName,
  className = ''
}: HeroStoryProps): JSX.Element {
  const [story, setStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStory = async (): Promise<void> => {
      try {
        const generatedStory = await generateStory({
          personality,
          gender,
          color,
          language,
          heroName
        });
        setStory(generatedStory);
      } catch (error) {
        console.error('Failed to generate story:', error);
        setError(true);
        showToast(language === 'no' 
          ? 'Kunne ikke generere historie' 
          : 'Failed to generate story');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [personality, gender, color, language, heroName, showToast]);

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-[200px] ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center text-red-500 ${className}`}>
        {language === 'no' 
          ? 'Kunne ikke laste historien' 
          : 'Failed to load story'}
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-sm rounded-lg shadow-lg p-6 ${className}`} style={{ backgroundColor: '#fcf8f3' }}>
      <h3 className="text-xl font-bold mb-4">
        {language === 'no' ? 'Din Superhelt Historie' : 'Your Superhero Story'}
      </h3>
      <div className="prose prose-sm max-w-none">
        {story?.split('\n').map((line, i) => (
          <p key={i} className="mb-4 last:mb-0">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
