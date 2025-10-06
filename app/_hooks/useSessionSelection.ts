'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Session {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

// Helper function to check if a session is currently active based on time
const isSessionCurrentlyActive = (session: Session): boolean => {
  const now = new Date();
  const startDate = new Date(session.startDate);
  const endDate = session.endDate ? new Date(session.endDate) : null;
  
  // Session must be marked as active and within time window
  return session.active && 
         now >= startDate && 
         (endDate === null || now <= endDate);
};

export function useSessionSelection(forceModal = false): {
  activeSessions: Session[];
  selectedSessionId: string | null;
  showSessionModal: boolean;
  isLoading: boolean;
  handleSessionSelected: (sessionId: string | null) => void;
  resetSessionSelection: () => void;
  setShowSessionModal: (show: boolean) => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    searchParams.get('sessionId') || null
  );
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateUrlWithSession = useCallback((sessionId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sessionId) {
      params.set('sessionId', sessionId);
    } else {
      params.delete('sessionId');
    }
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  const fetchActiveSessions = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/sessions?active=true');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const sessions = await response.json();
      
      // Additional client-side filtering for time-based active sessions
      // This provides a safety net in case of clock differences between server and client
      const currentlyActiveSessions = sessions.filter(isSessionCurrentlyActive);
      
      setActiveSessions(currentlyActiveSessions);
      
      // Check if we already have a session from URL
      const urlSessionId = searchParams.get('sessionId');
      console.log('URL session ID:', urlSessionId);
      
      if (urlSessionId && currentlyActiveSessions.find((s: Session) => s.id === urlSessionId)) {
        // Valid session in URL, use it and don't show modal
        console.log('Found valid session in URL, using it:', urlSessionId);
        setSelectedSessionId(urlSessionId);
        setShowSessionModal(false);
        return;
      }
      
      // Auto-select logic based on requirements
      if (currentlyActiveSessions.length === 0) {
        // No active sessions - use "all" (for admin views)
        console.log('No active sessions, using null');
        setSelectedSessionId(null);
        setShowSessionModal(false);
      } else if (currentlyActiveSessions.length === 1 && !forceModal) {
        // Only one active session - auto-select it and update URL (unless forceModal is true)
        const sessionId = currentlyActiveSessions[0].id;
        console.log('Only one session, auto-selecting:', sessionId);
        setSelectedSessionId(sessionId);
        setShowSessionModal(false);
        updateUrlWithSession(sessionId);
      } else {
        // Multiple sessions or forceModal - show modal for user choice only if no URL session
        if (!urlSessionId) {
          console.log('Multiple sessions or forceModal, showing modal');
          setShowSessionModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      // Default to "all" on error
      setSelectedSessionId(null);
      setShowSessionModal(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, updateUrlWithSession, forceModal]);

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  const handleSessionSelected = useCallback((sessionId: string | null): void => {
    console.log('Session selected:', sessionId);
    setSelectedSessionId(sessionId);
    setShowSessionModal(false);
    updateUrlWithSession(sessionId);
    
    // Force a small delay to ensure URL is updated before any re-renders
    setTimeout(() => {
      console.log('Session selection complete, URL updated');
    }, 100);
  }, [updateUrlWithSession]);

  const resetSessionSelection = useCallback((): void => {
    // Clear URL params and reset state
    updateUrlWithSession(null);
    setSelectedSessionId(null);
    setShowSessionModal(false);
    // Re-fetch sessions to get current state
    fetchActiveSessions();
  }, [updateUrlWithSession, fetchActiveSessions]);

  return {
    activeSessions,
    selectedSessionId,
    showSessionModal,
    isLoading,
    handleSessionSelected,
    resetSessionSelection,
    setShowSessionModal
  };
}