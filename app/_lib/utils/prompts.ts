export function generateHeroNamePrompt(
  personality: string,
  gender: 'male' | 'female',
  color: string
): string {
  return `Generate a short, memorable superhero name (2-3 words) for a ${gender} hero with ${color} as their primary color and this personality: ${personality}. The name should be appropriate for all ages.`;
}