'use client';

import { useRef, useState } from 'react';
import { Camera, FlipHorizontal } from 'lucide-react';
import { CameraError } from './CameraError';
import { PhotoPreview } from './PhotoPreview';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CameraPermissionState } from './CameraPermissionState';
import { useTranslations } from 'next-intl';

interface CameraCaptureProps {
  onPhotoTaken: (photoUrl: string | null) => void;
  isGenerating?: boolean;
}

export function CameraCapture({ onPhotoTaken, isGenerating = false }: CameraCaptureProps): JSX.Element {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const startCamera = async (fromPermissionGrant = false): Promise<void> => {
    if (!fromPermissionGrant && !hasPermission) return;
    setIsInitializing(true);
    try {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
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
                  setError(t('camera.errors.streamStart'));
                });
            };
          }
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(t('camera.errors.access'));
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
      
      // Calculate dimensions while maintaining aspect ratio
      const maxDim = 800;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Use better quality settings for initial scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(video, 0, 0, width, height);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      stopCamera();
      setCapturedPhoto(photoUrl);
    } catch (err) {
      console.error('Error taking photo:', err);
      setError(t('camera.errors.capture'));
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePermissionGranted = (): void => {
    setHasPermission(true);
    startCamera(true);
  };

  const handleRetakePhoto = (): void => {
    setCapturedPhoto(null);
    startCamera(true);
  };

  const handleUsePhoto = (): void => {
    if (capturedPhoto) {
      onPhotoTaken(capturedPhoto);
    }
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

  if (capturedPhoto) {
    return (
      <PhotoPreview
        photoUrl={capturedPhoto}
        onRetake={handleRetakePhoto}
        onUsePhoto={handleUsePhoto}
      />
    );
  }

  return (
    <div className="relative max-w-md mx-auto h-[70vh]">
      {isInitializing && !isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-lg border border-white/20">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" />
            <p className="text-white mt-4">{t('camera.start')}</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-lg border border-white/20 bg-white/5 shadow-xl"
      />
      {isStreaming && (
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center space-y-3">
          {isMobile && (
            <button
              onClick={() => {
                stopCamera();
                setIsFrontCamera(!isFrontCamera);
                startCamera(true);
              }}
              className="bg-white/20 backdrop-blur-lg text-white p-2 rounded-full hover:bg-white/30 
                       transition-all duration-300 shadow-lg hover:shadow-xl mb-2 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={t('camera.switchCamera')}
            >
              <FlipHorizontal className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={takePhoto}
            disabled={isCapturing || isGenerating}
            className="text-light py-4 px-8 rounded-lg transition-all duration-300 
                      bg-gradient-to-r from-dark to-dark bg-[length:200%_100%] bg-[position:0%]
                      hover:bg-[position:100%]
                      font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      flex items-center space-x-3 text-lg
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            aria-label={isCapturing ? t('camera.takingPhoto') : t('camera.takePhoto')}
          >
            {isCapturing ? (
              <>
                <LoadingSpinner size="sm" />
                <span>{t('camera.takingPhoto')}</span>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                <span>{t('camera.takePhoto')}</span>
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
            aria-label={t('camera.continueWithoutPhoto')}
          >
            {t('camera.continueWithoutPhoto')}
          </button>
        </div>
      )}
    </div>
  );
}
