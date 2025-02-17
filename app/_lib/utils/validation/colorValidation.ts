import { HeroColor } from '../../types/api';

interface ColorValidation {
  cardColor: HeroColor;
  nameColor: HeroColor;
  imageColor: HeroColor;
}

export const validateColorConsistency = ({ cardColor, nameColor, imageColor }: ColorValidation): boolean => {
  return cardColor === nameColor && nameColor === imageColor;
};

interface ColorMismatchError {
  expected: HeroColor;
  actual: {
    card?: HeroColor;
    name?: HeroColor;
    image?: HeroColor;
  };
}

export const logColorMismatch = (error: ColorMismatchError): void => {
  console.error('[Color Mismatch]', {
    timestamp: new Date().toISOString(),
    expectedColor: error.expected,
    actualColors: error.actual,
  });
};

export const getConsistentColor = (colors: Partial<ColorValidation>): HeroColor | null => {
  const uniqueColors = new Set(Object.values(colors).filter(Boolean));
  return uniqueColors.size === 1 ? Array.from(uniqueColors)[0] as HeroColor : null;
};