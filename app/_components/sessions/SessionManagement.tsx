'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SessionForm } from './SessionForm';
import { SessionList } from './SessionList';

interface Session {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
  _count: {
    heroes: number;
    stats: number;
  };
}

export function SessionManagement(): JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const t = useTranslations('sessions');

  const fetchSessions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Use public endpoint for fetching
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSessionCreated = (newSession: Session): void => {
    setSessions(prev => [newSession, ...prev]);
    setShowCreateForm(false);
  };

  const handleSessionUpdated = (updatedSession: Session): void => {
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  };

  const handleSessionDeleted = (sessionId: string): void => {
    setSessions(prev => 
      prev.filter(session => session.id !== sessionId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bangers text-white">{t('title')}</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t('createSession')}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-6">
            <SessionForm
              onSessionCreated={handleSessionCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <SessionList
          sessions={sessions}
          onSessionUpdated={handleSessionUpdated}
          onSessionDeleted={handleSessionDeleted}
        />
      </div>
    </div>
  );
}