import type { HeroColor } from '../_lib/types/api';

export interface PersonalityStyle {
  color: HeroColor;
  bgClass: string;
  textClass: string;
}

export const personalities: PersonalityStyle[] = [
  {
    color: 'red',
    bgClass: 'bg-red-600',
    textClass: 'text-red-600'
  },
  {
    color: 'yellow',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-500'
  },
  {
    color: 'green',
    bgClass: 'bg-green-600',
    textClass: 'text-green-600'
  },
  {
    color: 'blue',
    bgClass: 'bg-blue-600',
    textClass: 'text-blue-600'
  }
];
