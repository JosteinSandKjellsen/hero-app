'use client';

import { useCallback, useRef, type RefObject } from 'react';
import { isMobileDevice } from '@/lib/utils/device';

interface UseCameraSetupResult {
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCameraSetup(
  videoRef: RefObject<HTMLVideoElement>,
  setIsStreaming: (streaming: boolean) => void
): UseCameraSetupResult {
  const errorRef = useRef<string | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, [videoRef]);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: isMobileDevice() ? 'user' : 'user',
          width: { ideal: isMobileDevice() ? 1280 : 720 },
          height: { ideal: isMobileDevice() ? 720 : 1280 },
          aspectRatio: isMobileDevice() ? 4/3 : 9/16
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsStreaming(true))
              .catch(err => {
                console.error('Error playing video:', err);
                errorRef.current = 'Kunne ikke starte videostrømmen. Vennligst prøv igjen.';
              });
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      errorRef.current = 'Kunne ikke få tilgang til kameraet. Vennligst sjekk at nettleseren har tilgang til kameraet ditt.';
    }
  }, [videoRef, setIsStreaming]);

  return {
    error: errorRef.current,
    startCamera,
    stopCamera
  };
}