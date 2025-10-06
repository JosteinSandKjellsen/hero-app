'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface Session {
  id: string;
  name: string;
  active: boolean;
}

interface SessionFilterProps {
  selectedSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  showInactive?: boolean;
}

export function SessionFilter({ 
  selectedSessionId, 
  onSessionChange, 
  showInactive = false 
}: SessionFilterProps): JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('sessions.filter');

  const fetchSessions = useCallback(async (): Promise<void> => {
    try {
      const url = showInactive ? '/api/sessions' : '/api/sessions?active=true';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="animate-pulse bg-white/10 rounded-lg h-10"></div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-2">
        {t('label')}
      </label>
      <div className="relative inline-block">
        <select
          value={selectedSessionId || 'all'}
          onChange={(e) => onSessionChange(e.target.value === 'all' ? null : e.target.value)}
          className="min-w-48 px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        >
          <option value="all">{t('allSessions')}</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name} {!session.active && ` (${t('inactive')})`}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}