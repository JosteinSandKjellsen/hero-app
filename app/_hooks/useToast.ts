'use client';

import { useState, useCallback } from 'react';

interface ToastHook {
  toast: { message: string } | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export function useToast(): ToastHook {
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
}
