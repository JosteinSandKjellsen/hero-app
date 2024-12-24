export interface CameraConfig {
  facingMode: 'user' | 'environment';
  width: { ideal: number };
  height: { ideal: number };
  aspectRatio?: number;
}

export interface CameraError {
  message: string;
  code?: string;
}