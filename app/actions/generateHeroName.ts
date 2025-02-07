import { defaultHeroNames, type HeroColor } from '../_lib/constants/defaultNames';

function getRandomDefaultName(): string {
  const colors = Object.keys(defaultHeroNames) as HeroColor[];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return defaultHeroNames[randomColor];
}

export async function generateHeroName(
  personality: string,
  gender: string,
  color: string,
  scores: {
    red: number;
    yellow: number;
    green: number;
    blue: number;
  }
): Promise<string> {
  try {
    const response = await fetch('/api/hero-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personality,
        gender,
        color,
        scores,
      }),
    });

    if (!response.ok) {
      console.error('Failed to generate hero name:', await response.text());
      return getRandomDefaultName();
    }

    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Error generating hero name:', error);
    return getRandomDefaultName();
  }
}
