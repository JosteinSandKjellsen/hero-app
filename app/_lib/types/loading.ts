export type GenerationStep = 'upload' | 'process' | 'generate' | 'complete';

export interface GenerationStatus {
  step: GenerationStep;
}

export const GENERATION_STEPS: GenerationStatus[] = [
  { step: 'upload' },
  { step: 'process' },
  { step: 'generate' },
  { step: 'complete' }
];
