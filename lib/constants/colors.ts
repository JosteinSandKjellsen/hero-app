export const heroColors = {
  red: {
    border: 'border-red-600',
    bg: 'bg-red-600',
    text: 'text-red-600',
    gradient: 'from-red-600/10 to-red-600/5'
  },
  yellow: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    gradient: 'from-yellow-500/10 to-yellow-500/5'
  },
  green: {
    border: 'border-green-600',
    bg: 'bg-green-600',
    text: 'text-green-600',
    gradient: 'from-green-600/10 to-green-600/5'
  },
  blue: {
    border: 'border-blue-600',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'from-blue-600/10 to-blue-600/5'
  }
} as const;

export type HeroColor = keyof typeof heroColors;