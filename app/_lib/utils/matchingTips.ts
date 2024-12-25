import type {
  ColorMapping,
  ColorTranslation,
  ColorClass,
  MatchingDescriptions
} from '../types/matching';

export const matchingColors: ColorMapping = {
  red: 'green',
  yellow: 'blue',
  blue: 'red',
  green: 'yellow'
} as const;

export const colorTranslations: ColorTranslation = {
  red: 'rød',
  yellow: 'gul',
  green: 'grønn',
  blue: 'blå'
} as const;

export const colorClasses: ColorClass = {
  red: 'text-red-600',
  yellow: 'text-yellow-500',
  green: 'text-green-600',
  blue: 'text-blue-600'
} as const;

export const matchingDescriptions: MatchingDescriptions = {
  red: {
    source: 'røde energi',
    target: 'grønnes harmoni'
  },
  yellow: {
    source: 'gule optimisme',
    target: 'blåes struktur'
  },
  blue: {
    source: 'blåes struktur',
    target: 'rødes fart'
  },
  green: {
    source: 'grønnes harmoni',
    target: 'gules inspirasjon'
  }
} as const;
