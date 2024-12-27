export type GenerationStep = 'upload' | 'process' | 'generate' | 'complete';

export interface GenerationStatus {
  step: GenerationStep;
  message: string;
}

export const GENERATION_STEPS: GenerationStatus[] = [
  { step: 'upload', message: 'Sender bildet til superhelt-basen...' },
  { step: 'process', message: 'Starter opp transformasjonskammeret...' },
  { step: 'generate', message: 'Skaper din superhelt-identitet...' },
  { step: 'complete', message: 'Din superhelt er klar!' }
];
