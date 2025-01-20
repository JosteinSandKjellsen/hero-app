'use client';

import { Printer, RefreshCw, Link, Mail, X, Loader2, Send, Share2, Check } from 'lucide-react';
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');
  
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
    setCopyStatus('success');
    setTimeout(() => {
      setCopyStatus('idle');
    }, 2000);
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
      const url = new URL(getPrintUrl(printData, false), window.location.origin);
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
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Hero Management Group */}
      <div className="p-4 bg-white/20 backdrop-blur-lg rounded-lg shadow-2xl border border-white/20 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-light" />
          <h3 className="text-sm font-medium text-light">{t('manageHero')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="group text-light py-3 px-4 rounded-lg transition-all duration-300 
                      bg-gradient-to-r from-purple to-blue bg-[length:200%_100%] bg-[position:0%] 
                      hover:bg-[position:100%]
                      font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>{t('download')}</span>
          </button>

          <button
            onClick={handleCopyUrl}
            className="group text-light py-3 px-4 rounded-lg transition-all duration-300 
                      bg-gradient-to-r from-purple to-blue bg-[length:200%_100%] bg-[position:0%] 
                      hover:bg-[position:100%]
                      font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      flex items-center justify-center gap-2"
          >
            {copyStatus === 'success' ? (
              <>
                <Check className="w-5 h-5 text-light animate-fade-in" />
                <span>{t('linkCopied')}</span>
              </>
            ) : (
              <>
                <Link className="w-5 h-5 transition-transform group-hover:rotate-12" />
                <span>{t('copyLink')}</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowEmailPopover(true)}
            className="group w-full text-light py-3 px-6 rounded-lg transition-all duration-300 
                      bg-gradient-to-r from-purple to-blue bg-[length:200%_100%] bg-[position:0%] 
                      hover:bg-[position:100%]
                      font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                      flex items-center justify-center gap-2"
            aria-expanded={showEmailPopover}
            aria-haspopup="true"
          >
            <Mail className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            <span>{t('sendEmail')}</span>
          </button>

          {showEmailPopover && (
            <div
              ref={popoverRef}
              className="absolute bottom-full left-0 right-0 mb-2 p-6 bg-white rounded-lg shadow-lg border border-purple/20 animate-fade-in min-h-[180px]"
              role="dialog"
              aria-label={t('sendEmail')}
            >
              <button
                onClick={() => setShowEmailPopover(false)}
                className="absolute top-3 right-4 text-dark/50 hover:text-dark transition-transform hover:rotate-90 duration-200"
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
                  className="w-full px-4 py-3 border border-purple/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple mt-2"
                  aria-label={t('emailPlaceholder')}
                  aria-invalid={!!emailError}
                  disabled={emailStatus === 'sending'}
                />
                {emailError && (
                  <p className="text-red text-sm animate-shake" role="alert">
                    {emailError}
                  </p>
                )}
                {emailStatus === 'success' && (
                  <p className="text-green text-sm animate-fade-in" role="alert">
                    {t('emailSuccess')}
                  </p>
                )}
                <button
                  onClick={handleSendEmail}
                  disabled={emailStatus === 'sending'}
                  className="group w-full text-light py-3 px-4 rounded-lg transition-all duration-300 
                            bg-gradient-to-r from-purple to-blue bg-[length:200%_100%] bg-[position:0%] 
                            hover:bg-[position:100%]
                            font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
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
      </div>

      {/* Create New Hero Button */}
      <button
        onClick={onReset}
        className="group w-full bg-white/30 backdrop-blur-sm border border-white/40 text-light py-3 px-6 rounded-lg 
                  hover:bg-white/40 transition-all duration-300 font-medium shadow-lg hover:shadow-xl
                  flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
        <span>{t('newHero')}</span>
      </button>
    </div>
  );
}
