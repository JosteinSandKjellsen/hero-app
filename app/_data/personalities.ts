import type { PersonalityType } from '@/app/_lib/types/personality';

export const personalities: PersonalityType[] = [
  {
    name: 'Den Eventyrlystne Innovatøren',
    color: 'red',
    heroName: 'Crimson Comet',
    description: 'Du er nysgjerrig, impulsiv og elsker nye opplevelser. Du får energi av nye idéer og er ikke redd for å hoppe ut i ukjent terreng.',
    traits: ['Kreativ', 'Spontan', 'Modig', 'Utforskende'],
    bgClass: 'bg-red-600',
    textClass: 'text-red-600'
  },
  {
    name: 'Den Sosiale Optimisten',
    color: 'yellow',
    heroName: 'Solar Serenade',
    description: 'Du er varm, utadvendt og entusiastisk. Du elsker å være rundt andre og sprer lett positiv energi.',
    traits: ['Omgjengelig', 'Energisk', 'Inkluderende', 'Livlig'],
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-500'
  },
  {
    name: 'Den Rolige Harmoniseren',
    color: 'green',
    heroName: 'Emerald Whisper',
    description: 'Du søker balanse, harmoni og gode relasjoner. Du er en god lytter, samarbeidsvillig og omsorgsfull.',
    traits: ['Omsorgsfull', 'Reflektert', 'Diplomatisk', 'Støttegivende'],
    bgClass: 'bg-green-600',
    textClass: 'text-green-600'
  },
  {
    name: 'Den Analytiske Planleggeren',
    color: 'blue',
    heroName: 'Azure Architect',
    description: 'Du er systematisk, pålitelig og grundig. Du liker tydelige planer og setter pris på forutsigbarhet.',
    traits: ['Ansvarlig', 'Metodisk', 'Stabil', 'Grundig'],
    bgClass: 'bg-blue-600',
    textClass: 'text-blue-600'
  }
];