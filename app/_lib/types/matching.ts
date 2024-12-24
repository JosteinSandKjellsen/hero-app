import type { HeroColor } from './api';

export interface MatchingDescription {
  source: string;
  target: string;
}

export type ColorMapping = Record<HeroColor, HeroColor>;
export type ColorTranslation = Record<HeroColor, string>;
export type ColorClass = Record<HeroColor, string>;
export type MatchingDescriptions = Record<HeroColor, MatchingDescription>;