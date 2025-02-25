export const IMAGES_CONFIG = {
  superheroes: {
    basePath: '/images/superheroes'
  }
} as const;

export const heroImages = [
  '/images/superheroes/red-man.webp',
  '/images/superheroes/blue-woman.webp',
  '/images/superheroes/green-man.webp',
  '/images/superheroes/yellow-woman.webp',
  '/images/superheroes/red-woman.webp',
  '/images/superheroes/blue-man.webp',
  '/images/superheroes/green-woman.webp',
  '/images/superheroes/yellow-man.webp',
] as const;

export type HeroImage = typeof heroImages[number];
