'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { CameraError } from './CameraError';

interface CameraCaptureProps {
  onPhotoTaken: (photoUrl: string) => void;
}

export function CameraCapture({ onPhotoTaken }: CameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsStreaming(true))
              .catch(err => {
                console.error('Error playing video:', err);
                setError('Kunne ikke starte videostrømmen. Vennligst prøv igjen.');
              });
          }
        };
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

  const takePhoto = (): void => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    stopCamera();
    onPhotoTaken(photoUrl);
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
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 
                     transition-colors shadow-lg flex items-center space-x-3 text-lg
                     focus:outline-none focus:ring-2 focus:ring-green-500 active:bg-green-800"
          >
            <Camera className="w-6 h-6" />
            <span>Ta bildet</span>
          </button>
        </div>
      )}
    </div>
  );
}
