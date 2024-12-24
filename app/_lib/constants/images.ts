export const heroImages = [
  '/images/superheroes/red-man.jpeg',
  '/images/superheroes/blue-woman.jpeg',
  '/images/superheroes/green-man.jpeg',
  '/images/superheroes/yellow-woman.jpeg',
  '/images/superheroes/red-woman.jpeg',
  '/images/superheroes/blue-man.jpeg',
  '/images/superheroes/green-woman.jpeg',
  '/images/superheroes/yellow-man.jpeg',
] as const;

export type HeroImage = typeof heroImages[number];