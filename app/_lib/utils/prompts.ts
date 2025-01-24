export function generateHeroNamePrompt(
  personality: string,
  gender: 'male' | 'female' | 'robot',
  color: string
): string {
  const genderText = gender === 'robot' ? 'robot superhero' : `${gender} superhero`;
  return `Generate a short, memorable superhero name (2-3 words) for a ${genderText} with ${color} as their primary color and this personality: ${personality}. The name should be appropriate for all ages.`;
}

export function getRobotPrompt(color: string): string {
  return `A futuristic ${color} robot superhero, highly detailed mechanical design, glowing energy core, sleek metallic surfaces, cinematic lighting, dynamic pose, epic sci-fi background, no human features`;
}
