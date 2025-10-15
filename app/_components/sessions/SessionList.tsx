'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SessionForm } from './SessionForm';

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

interface SessionListProps {
  sessions: Session[];
  onSessionUpdated: (session: Session) => void;
  onSessionDeleted: (sessionId: string) => void;
}

export function SessionList({ sessions, onSessionUpdated, onSessionDeleted }: SessionListProps): JSX.Element {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const t = useTranslations('sessions.list');

  // Helper function to get session status based on time
  const getSessionStatus = (session: Session): { status: string; className: string } => {
    const now = new Date();
    const startDate = new Date(session.startDate);
    const endDate = session.endDate ? new Date(session.endDate) : null;
    
    if (!session.active) {
      return { status: t('inactive'), className: 'text-gray-500' };
    }
    if (now < startDate) {
      return { status: t('scheduled'), className: 'text-blue-600' };
    }
    if (endDate && now > endDate) {
      return { status: t('expired'), className: 'text-red-600' };
    }
    return { status: t('active'), className: 'text-green-600' };
  };

  const handleToggleActive = async (sessionId: string, currentActive: boolean): Promise<void> => {
    try {
      const response = await fetch('/api/sessions/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: sessionId,
          active: !currentActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      const updatedSession = await response.json();
      // Find the original session to preserve _count data
      const originalSession = sessions.find(s => s.id === sessionId);
      // Merge the updated data with existing count data
      onSessionUpdated({
        ...updatedSession,
        _count: originalSession?._count || { heroes: 0, stats: 0 }
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleSessionDeleted = (sessionId: string): void => {
    onSessionDeleted(sessionId);
    setEditingSession(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">{t('noSessions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editingSession && (
        <SessionForm
          editSession={editingSession}
          onSessionCreated={(updatedSession) => {
            // Merge updated session with existing data
            onSessionUpdated({
              ...updatedSession,
              createdAt: editingSession.createdAt,
              _count: editingSession._count
            });
            setEditingSession(null);
          }}
          onSessionDeleted={handleSessionDeleted}
          onCancel={() => setEditingSession(null)}
        />
      )}

      <div className="grid gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bangers text-white">{session.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getSessionStatus(session).className === 'text-green-600'
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : getSessionStatus(session).className === 'text-blue-600'
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                        : getSessionStatus(session).className === 'text-red-600'
                        ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                        : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                    }`}
                  >
                    {getSessionStatus(session).status}
                  </span>
                </div>
                {session.description && (
                  <p className="text-white/70 text-sm mb-2">{session.description}</p>
                )}
                <div className="text-sm text-white/60 space-y-1">
                  <p>{t('startDate')}: {formatDate(session.startDate)}</p>
                  {session.endDate && (
                    <p>{t('endDate')}: {formatDate(session.endDate)}</p>
                  )}
                  <p>
                    {t('stats')}: {session._count.heroes} {t('heroes')}, {session._count.stats} {t('colorChoices')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSession(session)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => handleToggleActive(session.id, session.active)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    session.active
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {session.active ? t('deactivate') : t('activate')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}