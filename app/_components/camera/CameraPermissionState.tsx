'use client';

import { Camera, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface CameraPermissionStateProps {
  onPermissionGranted: () => void;
  onSkip: () => void;
}

export function CameraPermissionState({ onPermissionGranted, onSkip }: CameraPermissionStateProps): JSX.Element {
  const t = useTranslations();
  const [browserName, setBrowserName] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Detect browser for specific instructions
    const userAgent = navigator.userAgent.toLowerCase();
    switch (true) {
      case userAgent.includes('chrome'):
        setBrowserName('Chrome');
        break;
      case userAgent.includes('firefox'):
        setBrowserName('Firefox');
        break;
      case userAgent.includes('safari'):
        setBrowserName('Safari');
        break;
      default:
        setBrowserName(t('camera.permission.browserInstructions'));
    }
  }, [t]);

  const requestPermission = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up
      onPermissionGranted();
    } catch (err) {
      console.error('Permission denied or error:', err);
      setError(true);
    }
  };

  const getBrowserInstructions = (): string => {
    switch (browserName) {
      case 'Chrome':
        return t('camera.permission.instructions.Chrome');
      case 'Firefox':
        return t('camera.permission.instructions.Firefox');
      case 'Safari':
        return t('camera.permission.instructions.Safari');
      default:
        return t('camera.permission.instructions.default');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-md w-full">
        <div className="mb-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {t('camera.permission.title')}
          </h3>
          <p className="text-white/80 text-sm md:text-base mb-4">
            {t('camera.permission.description')}
          </p>
        </div>

        <button
          onClick={requestPermission}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-4 px-6 
                   flex items-center justify-center space-x-2 mb-6 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-green-500 active:bg-green-800"
        >
          <Camera className="w-5 h-5" />
          <span>{t('camera.activate')}</span>
        </button>

        <button
          onClick={onSkip}
          className="w-full text-white/70 py-2 text-sm hover:text-white/90 transition-colors
                   underline underline-offset-2 focus:outline-none focus:text-white"
        >
          {t('camera.continueWithoutPhoto')}
        </button>

        {error && (
          <div className="text-white/70 text-sm">
            <p className="mb-2">{t('camera.permission.allowPrompt')}</p>
            <p className="mb-4">{getBrowserInstructions()}</p>
            <button
              onClick={requestPermission}
              className="text-purple-300 hover:text-purple-200 flex items-center justify-center space-x-1 mx-auto
                       focus:outline-none focus:underline"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('camera.retry')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
