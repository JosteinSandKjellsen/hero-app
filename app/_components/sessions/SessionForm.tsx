'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

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

interface SessionFormProps {
  onSessionCreated: (session: Session) => void;
  onCancel: () => void;
  onSessionDeleted?: (sessionId: string) => void;
  editSession?: Session;
}

export function SessionForm({ onSessionCreated, onCancel, onSessionDeleted, editSession }: SessionFormProps): JSX.Element {
  const [formData, setFormData] = useState({
    name: editSession?.name || '',
    description: editSession?.description || '',
    startDate: editSession?.startDate ? new Date(editSession.startDate).toISOString().slice(0, 16) : '',
    endDate: editSession?.endDate ? new Date(editSession.endDate).toISOString().slice(0, 16) : '',
    active: editSession?.active ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('sessions.form');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
    const payload = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };      const url = '/api/sessions/manage';
      const method = editSession ? 'PUT' : 'POST';
      const body = editSession ? { ...payload, id: editSession.id } : payload;

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save session');
      }

      const session = await response.json();
      // For new sessions, add default count structure
      const sessionWithCount = {
        ...session,
        _count: editSession?._count || { heroes: 0, stats: 0 }
      };
      onSessionCreated(sessionWithCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editSession, onSessionCreated]);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!editSession || !onSessionDeleted) return;
    
    const confirmMessage = `Are you sure you want to delete the session "${editSession.name}"?\n\nThis will remove the session but preserve all ${editSession._count.heroes} heroes and ${editSession._count.stats} stats in the database.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sessions/manage?id=${editSession.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete session');
      }
      
      onSessionDeleted(editSession.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  }, [editSession, onSessionDeleted]);

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30">
      <h3 className="text-xl font-bangers text-white mb-4">
        {editSession ? t('editTitle') : t('createTitle')}
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t('nameLabel')}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('namePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t('descriptionLabel')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('startDateLabel')}
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('endDateLabel')}
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="mr-2"
            />
            <span className="text-white">{t('activeLabel')}</span>
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {t('cancel')}
          </button>
          {editSession && onSessionDeleted && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('saving') : (editSession ? t('update') : t('create'))}
          </button>
        </div>
      </form>
    </div>
  );
}