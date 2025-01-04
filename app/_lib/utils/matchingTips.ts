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

export function getMatchingColor(color: keyof typeof matchingColors): (typeof matchingColors)[keyof typeof matchingColors] {
  return matchingColors[color];
}

export function getMatchingTip(color: keyof typeof matchingColors): string {
  const matchingColor = getMatchingColor(color);
  const description = matchingDescriptions[color];
  
  return `Tips: Snakk med en ${colorTranslations[matchingColor]} venn: Din ${description.source} møter den ${description.target}.`;
}

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
