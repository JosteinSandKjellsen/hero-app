'use client';

import { CameraCapture } from './CameraCapture';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface CameraSectionProps {
  onPhotoTaken: (photoUrl: string) => void;
  isGenerating?: boolean;
}

export function CameraSection({ onPhotoTaken, isGenerating = false }: CameraSectionProps): JSX.Element {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 border border-white/20">
      {isGenerating ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-center">
            Genererer ditt superhelt-bilde...
          </p>
          <p className="text-white/70 text-sm mt-2 text-center">
            Dette kan ta opptil ett minutt
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-white mb-4">
            Ta et bilde av din indre superhelt!
          </h2>
          <p className="text-white/90 mb-8">
            La oss se hvordan du ser ut som din personlige superhelt-type.
          </p>
          <CameraCapture onPhotoTaken={onPhotoTaken} />
        </>
      )}
    </div>
  );
}
