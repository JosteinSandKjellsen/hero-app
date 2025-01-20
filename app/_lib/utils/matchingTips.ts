import type {
  ColorMapping,
  ColorClass
} from '../types/matching';

// Define the color matching pairs
export const matchingColors: ColorMapping = {
  red: 'green',     // red matches with green
  yellow: 'blue',   // yellow matches with blue
  blue: 'red',      // blue matches with red
  green: 'yellow'   // green matches with yellow
} as const;

// Get the matching color for a given color
export function getMatchingColor(color: keyof typeof matchingColors): (typeof matchingColors)[keyof typeof matchingColors] {
  return matchingColors[color];
}

// CSS classes for color styling
export const colorClasses: ColorClass = {
  red: 'text-red',
  yellow: 'text-yellow',
  green: 'text-green',
  blue: 'text-blue'
} as const;
