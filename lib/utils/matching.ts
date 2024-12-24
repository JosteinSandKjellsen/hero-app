const matchingColors = {
  red: 'green',
  yellow: 'blue',
  blue: 'red',
  green: 'yellow',
} as const;

export function getMatchingColor(color: keyof typeof matchingColors) {
  return matchingColors[color];
}

export function getMatchingTip(color: keyof typeof matchingColors): string {
  const matchingColor = getMatchingColor(color);
  const colorTranslations = {
    red: 'rød',
    yellow: 'gul',
    green: 'grønn',
    blue: 'blå',
  };
  
  const matchingDescriptions = {
    red: 'Din energi møter den grønnes harmoni',
    yellow: 'Din optimisme møter den blåes struktur',
    blue: 'Din struktur møter den rødes fart',
    green: 'Din harmoni møter den gules inspirasjon',
  };

  return `Tips: Snakk med en ${colorTranslations[matchingColor]} venn: ${matchingDescriptions[color]}.`;
}