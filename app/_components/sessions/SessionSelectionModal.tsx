'use client';

import { useTranslations } from 'next-intl';

interface Session {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

interface SessionSelectionModalProps {
  sessions: Session[];
  onSessionSelected: (sessionId: string | null) => void;
  showAllOption?: boolean;
}

export function SessionSelectionModal({ 
  sessions, 
  onSessionSelected,
  showAllOption = false
}: SessionSelectionModalProps): JSX.Element {
  const t = useTranslations('sessions.selection');

    const handleSessionClick = (sessionId: string | null): void => {
    console.log('Session button clicked:', sessionId);
    onSessionSelected(sessionId); // Can be null for "All Sessions"
    // Note: onSessionSelected should handle hiding the modal
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bangers text-gray-900 mb-2">
            🦸‍♀️ {t('title')} 🦸‍♂️
          </h2>
          <p className="text-gray-600 text-lg">
            {t('description')}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {showAllOption && (
            <button
              onClick={() => handleSessionClick(null)}
              className="w-full p-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-left">
                <div className="text-xl font-bold mb-1">
                  🌍 {t('allSessions')}
                </div>
                <div className="text-sm opacity-90">
                  {t('viewAllData')}
                </div>
              </div>
            </button>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSessionClick(session.id)}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-left">
                <div className="text-xl font-bold mb-1">
                  📍 {session.name}
                </div>
                {session.description && (
                  <div className="text-sm opacity-90 mb-2">
                    {session.description}
                  </div>
                )}
                <div className="text-xs opacity-80">
                  {formatDate(session.startDate)}
                  {session.endDate && ` - ${formatDate(session.endDate)}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}