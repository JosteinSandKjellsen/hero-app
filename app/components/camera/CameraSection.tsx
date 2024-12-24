'use client';

import { CameraCapture } from './CameraCapture';

interface CameraSectionProps {
  onPhotoTaken: (photoUrl: string) => void;
}

export function CameraSection({ onPhotoTaken }: CameraSectionProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">
        Ta et bilde av din indre superhelt!
      </h2>
      <p className="text-white/90 mb-8">
        La oss se hvordan du ser ut som din personlige superhelt-type.
      </p>
      <CameraCapture onPhotoTaken={onPhotoTaken} />
    </div>
  );
}