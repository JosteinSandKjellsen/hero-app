'use client';

import { Printer, RefreshCw, Link } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getPrintUrl } from '../../_lib/utils/print';
import { PrintCardData } from '../../_lib/utils/print';

interface ResultsActionsProps {
  printData: PrintCardData;
  onReset: () => void;
}

export function ResultsActions({ printData, onReset }: ResultsActionsProps): JSX.Element {
  const t = useTranslations('results.actions');

  const handleCopyUrl = async (): Promise<void> => {
    // Use getPrintUrl to get the same URL format as the print button
    const url = new URL(getPrintUrl(printData), window.location.origin);
    await navigator.clipboard.writeText(url.toString());
  };

  const handlePrint = (): void => {
    // Use getPrintUrl which includes the print parameter
    const url = getPrintUrl(printData);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <button
        onClick={handlePrint}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Printer className="w-5 h-5" />
        <span>{t('download')}</span>
      </button>

      <button
        onClick={handleCopyUrl}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Link className="w-5 h-5" />
        <span>{t('copyLink')}</span>
      </button>

      <button
        onClick={onReset}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        <span>{t('newHero')}</span>
      </button>
    </div>
  );
}
