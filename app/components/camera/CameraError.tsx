import { AlertCircle } from 'lucide-react';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

export function CameraError({ error, onRetry }: CameraErrorProps) {
  return (
    <div className="text-center p-4">
      <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-2" />
      <p className="text-red-300 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Prøv igjen
      </button>
    </div>
  );
}