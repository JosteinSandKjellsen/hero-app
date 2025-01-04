import type { HeroColor } from './api';

type RecursiveMessages = {
  [key: string]: string | string[] | RecursiveMessages;
};

export interface Messages extends RecursiveMessages {
  header: {
    title: string;
    subtitle: string;
    logoAlt: string;
  };
  registration: {
    title: string;
    name: {
      label: string;
      placeholder: string;
      required: string;
    };
    gender: {
      label: string;
      male: string;
      female: string;
    };
    start: string;
  };
  personalities: {
    [key in HeroColor]: {
      name: string;
      heroName: string;
      description: string;
      traits: string[];
    };
  };
  quiz: {
    progress: {
      status: string;
    };
    questions: {
      [key: string]: {
        text: string;
        options: {
          [key in HeroColor]: string;
        };
      };
    };
  };
  results: {
    title: string;
    selfieAlt: string;
    actions: {
      download: string;
      copyLink: string;
      newHero: string;
    };
  };
  loading: {
    defaultMessage: string;
    timeEstimate: string;
    steps: {
      upload: string;
      process: string;
      generate: string;
      complete: string;
    };
  };
  errors: {
    missingUserData: string;
    invalidPhotoFormat: string;
    heroNameError: string;
    heroImageError: string;
    noImageUrl: string;
    heroImageGenerationError: string;
    generalError: string;
  };
  common: {
    languageSwitcher: {
      label: string;
      en: string;
      no: string;
    };
  };
}
