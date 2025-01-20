export const heroColors = {
  red: {
    border: 'border-red',
    bg: 'bg-red',
    text: 'text-red',
    gradient: 'from-red-light to-red-light'
  },
  yellow: {
    border: 'border-yellow',
    bg: 'bg-yellow',
    text: 'text-yellow',
    gradient: 'from-yellow-light to-yellow-light'
  },
  green: {
    border: 'border-green',
    bg: 'bg-green',
    text: 'text-green',
    gradient: 'from-green-light to-green-light'
  },
  blue: {
    border: 'border-blue',
    bg: 'bg-blue',
    text: 'text-blue',
    gradient: 'from-blue-light to-blue-light'
  }
} as const;

export type HeroColor = keyof typeof heroColors;
