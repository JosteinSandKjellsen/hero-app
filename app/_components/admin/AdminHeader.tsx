'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function AdminHeader(): JSX.Element {
  const router = useRouter();
  const t = useTranslations();

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex justify-end p-4">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold shadow-md"
        aria-label="Logout"
      >
        {t('admin.logout') || 'Logout'}
      </button>
    </div>
  );
}
