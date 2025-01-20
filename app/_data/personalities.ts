import type { HeroColor } from '../_lib/types/api';

export interface PersonalityStyle {
  color: HeroColor;
  bgClass: string;
  textClass: string;
}

export const personalities: PersonalityStyle[] = [
  {
    color: 'red',
    bgClass: 'bg-red',
    textClass: 'text-red'
  },
  {
    color: 'yellow',
    bgClass: 'bg-yellow',
    textClass: 'text-yellow'
  },
  {
    color: 'green',
    bgClass: 'bg-green',
    textClass: 'text-green'
  },
  {
    color: 'blue',
    bgClass: 'bg-blue',
    textClass: 'text-blue'
  }
];
