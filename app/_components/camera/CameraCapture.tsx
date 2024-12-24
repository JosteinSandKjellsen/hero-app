'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { CameraError } from './CameraError';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface CameraCaptureProps {
  onPhotoTaken: (photoUrl: string) => void;
  isGenerating?: boolean;
}

export function CameraCapture({ onPhotoTaken, isGenerating = false }: CameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): (() => void) => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
                .then(() => {
                  setIsStreaming(true);
                  resolve();
                })
                .catch(err => {
                  console.error('Error playing video:', err);
                  setError('Kunne ikke starte videostrømmen. Vennligst prøv igjen.');
                });
            };
          }
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Kunne ikke få tilgang til kameraet. Vennligst sjekk at nettleseren har tilgang til kameraet ditt.');
    }
  };

  const stopCamera = (): void => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = async (): Promise<void> => {
    if (!videoRef.current || isCapturing || isGenerating) return;

    try {
      setIsCapturing(true);
      
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(video, 0, 0);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      stopCamera();
      onPhotoTaken(photoUrl);
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Det oppstod en feil ved taking av bildet. Vennligst prøv igjen.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (error) {
    return <CameraError error={error} onRetry={startCamera} />;
  }

  return (
    <div className="relative max-w-md mx-auto h-[70vh]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-lg border-4 border-purple-600 shadow-xl"
      />
      {isStreaming && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <button
            onClick={takePhoto}
            disabled={isCapturing || isGenerating}
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 
                     transition-colors shadow-lg flex items-center space-x-3 text-lg
                     focus:outline-none focus:ring-2 focus:ring-green-500 active:bg-green-800
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Tar bilde...</span>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                <span>Ta bildet</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}