import { type HeroColor, type GenderType, type Language } from '../types/hero';

export interface StoryRequest {
  personality: string;
  gender: GenderType;
  color: HeroColor;
  language: Language;
  heroName: string;
}

export async function generateStory(request: StoryRequest): Promise<string> {
  try {
    const response = await fetch('/api/hero-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate story');
    }

    const data = await response.json();
    return data.story;
  } catch (error) {
    console.error('Story generation failed:', error);
    throw error;
  }
}

// Cache implementation to avoid duplicate generations
const storyCache = new Map<string, string>();

export async function getCachedStory(request: StoryRequest): Promise<string> {
  const cacheKey = JSON.stringify(request);
  
  if (storyCache.has(cacheKey)) {
    return storyCache.get(cacheKey)!;
  }

  const story = await generateStory(request);
  storyCache.set(cacheKey, story);
  return story;
}
