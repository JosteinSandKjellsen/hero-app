'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { PrivacyPolicyPopover } from '../ui/PrivacyPolicyPopover';
import type { LayoutVariant } from '../../_lib/types/layout';

interface FooterProps {
  variant?: LayoutVariant;
}

export function Footer({ variant }: FooterProps = {}): JSX.Element {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const t = useTranslations('Privacy');
  const showLanguageSwitcher = variant === 'registration' || variant === 'stats';

  return (
    <footer className="comic-footer">
      <div className="comic-footer-content">
        <div className="max-w-3xl mx-auto flex items-center h-10">
          <div className="w-[120px] flex items-center">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="comic-footer-button"
              title={t('button')}
              aria-label={t('button')}
            >
              <IoShieldCheckmarkOutline size={24} />
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Bouvet_Logo_Colossus.svg"
              alt="Bouvet Logo"
              width={120}
              height={24}
              className="comic-footer-logo [filter:brightness(0)]"
            />
          </div>
          <div className="w-[120px] flex justify-end">
            {showLanguageSwitcher && <LanguageSwitcher />}
          </div>
        </div>
      </div>
      <PrivacyPolicyPopover 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />
    </footer>
  );
}
