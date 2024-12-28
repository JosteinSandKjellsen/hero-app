'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { CameraError } from './CameraError';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CameraPermissionState } from './CameraPermissionState';

interface CameraCaptureProps {
  onPhotoTaken: (photoUrl: string | null) => void;
  isGenerating?: boolean;
}

export function CameraCapture({ onPhotoTaken, isGenerating = false }: CameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const startCamera = async (fromPermissionGrant = false): Promise<void> => {
    if (!fromPermissionGrant && !hasPermission) return;
    setIsInitializing(true);
    try {
      // Check if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user', // Use back camera on mobile
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

  const handlePermissionGranted = (): void => {
    setHasPermission(true);
    startCamera(true);
  };

  if (!hasPermission) {
    return (
      <CameraPermissionState 
        onPermissionGranted={handlePermissionGranted}
        onSkip={() => onPhotoTaken(null)}
      />
    );
  }

  if (error) {
    return <CameraError error={error} onRetry={() => startCamera(true)} />;
  }

  return (
    <div className="relative max-w-md mx-auto h-[70vh]">
      {isInitializing && !isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-900/30 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-white mt-4">Starter kamera...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-lg border-4 border-purple-600 shadow-xl"
      />
      {isStreaming && (
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center space-y-3">
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
                <span>Tar bildet...</span>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                <span>Ta bilde</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              stopCamera();
              onPhotoTaken(null);
            }}
            className="text-white/70 text-sm hover:text-white/90 transition-colors
                     underline underline-offset-2 focus:outline-none focus:text-white"
          >
            Fortsett uten bilde
          </button>
        </div>
      )}
    </div>
  );
}
