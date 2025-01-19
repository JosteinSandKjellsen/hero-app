'use client';

import { Printer, RefreshCw, Link, Mail, X, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { getPrintUrl } from '../../_lib/utils/print';
import { PrintCardData } from '../../_lib/utils/print';
import { isValidEmail } from '../../_lib/utils/validation/emailValidation';

interface ResultsActionsProps {
  printData: PrintCardData;
  onReset: () => void;
}

export function ResultsActions({ printData, onReset }: ResultsActionsProps): JSX.Element {
  const t = useTranslations('results.actions');
  const [showEmailPopover, setShowEmailPopover] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close popover
  useEffect(() => {
    if (!showEmailPopover) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowEmailPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmailPopover]);

  // Auto-focus email input when popover opens
  useEffect(() => {
    if (showEmailPopover && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showEmailPopover]);

  // Handle escape key to close popover
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setShowEmailPopover(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleCopyUrl = async (): Promise<void> => {
    const url = new URL(getPrintUrl(printData), window.location.origin);
    await navigator.clipboard.writeText(url.toString());
  };

  const handlePrint = (): void => {
    const url = getPrintUrl(printData);
    window.open(url, '_blank');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendEmail();
    }
  };

  const handleSendEmail = async (): Promise<void> => {
    if (!isValidEmail(email)) {
      setEmailError(t('invalidEmail'));
      return;
    }

    setEmailStatus('sending');
    setEmailError('');

    try {
      const url = new URL(getPrintUrl(printData), window.location.origin);
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          heroUrl: url.toString(),
          name: printData.name,
          heroName: printData.heroName,
          personalityName: printData.personalityName,
          color: printData.color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(t('tooManyRequests'));
        }
        throw new Error(data.error || t('emailError'));
      }

      setEmailStatus('success');
      setTimeout(() => {
        setShowEmailPopover(false);
        setEmailStatus('idle');
        setEmail('');
      }, 2000);
    } catch (error) {
      setEmailStatus('error');
      setEmailError(error instanceof Error ? error.message : t('emailError'));
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <button
        onClick={handlePrint}
        className="group w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span>{t('download')}</span>
      </button>

      <button
        onClick={handleCopyUrl}
        className="group w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Link className="w-5 h-5 transition-transform group-hover:rotate-12" />
        <span>{t('copyLink')}</span>
      </button>

      <div className="relative">
        <button
          onClick={() => setShowEmailPopover(true)}
          className="group w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                    hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
          aria-expanded={showEmailPopover}
          aria-haspopup="true"
        >
          <Mail className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          <span>{t('sendEmail')}</span>
        </button>

        {showEmailPopover && (
          <div
            ref={popoverRef}
            className="absolute bottom-full left-0 right-0 mb-2 p-6 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in min-h-[180px]"
            role="dialog"
            aria-label={t('sendEmail')}
          >
            <button
              onClick={() => setShowEmailPopover(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 transition-transform hover:rotate-90 duration-200"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
                aria-label={t('emailPlaceholder')}
                aria-invalid={!!emailError}
                disabled={emailStatus === 'sending'}
              />
              {emailError && (
                <p className="text-red-500 text-sm animate-shake" role="alert">
                  {emailError}
                </p>
              )}
              {emailStatus === 'success' && (
                <p className="text-green-500 text-sm animate-fade-in" role="alert">
                  {t('emailSuccess')}
                </p>
              )}
              <button
                onClick={handleSendEmail}
                disabled={emailStatus === 'sending'}
                className="group w-full bg-purple-600 text-white py-3 px-4 rounded-md 
                          hover:bg-purple-700 transition-colors font-medium
                          disabled:bg-purple-400 disabled:cursor-not-allowed
                          flex items-center justify-center gap-2"
              >
                {emailStatus === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('sending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    <span>{t('send')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="group w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
        <span>{t('newHero')}</span>
      </button>
    </div>
  );
}
