export interface ControlNet {
  preprocessorId: number;
  initImageType: 'UPLOADED';
  initImageId: string;
  strengthType: 'High' | 'Medium' | 'Low';
}

export interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  modelId?: string;
  width?: number;
  height?: number;
  numImages?: number;
  scheduler?:
    | 'EULER_DISCRETE'
    | 'EULER_ANCESTRAL'
    | 'HEUN'
    | 'DPM_SOLVER'
    | 'LCM';
  seed?: number;
  public?: boolean;
  controlnets?: ControlNet[];
  initImageId?: string;
  gender?: 'male' | 'female' | 'robot';
}

export interface GenerationResponse {
  sdGenerationJob: {
    generationId: string;
  };
}

export interface GenerationStatusResponse {
  generations_by_pk: {
    status: 'PENDING' | 'COMPLETE' | 'FAILED';
    generated_images: Array<{
      url: string;
    }>;
  };
}

export interface UploadUrlResponse {
  id: string;
  url: string;
  fields: Record<string, string>;
}

export interface LeonardoError extends Error {
  status?: number;
  code?: string;
}
