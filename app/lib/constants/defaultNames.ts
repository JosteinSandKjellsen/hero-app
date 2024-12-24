export const defaultHeroNames = {
  red: 'Crimson Comet',
  yellow: 'Solar Serenade',
  green: 'Emerald Whisper',
  blue: 'Azure Architect',
} as const;

export type HeroColor = keyof typeof defaultHeroNames;