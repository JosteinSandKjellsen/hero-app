'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizLayout } from '@/app/_components/layout/QuizLayout';
import { useTranslations } from 'next-intl';

function LoginForm(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Redirect to the page they wanted or sessions page
        const redirect = searchParams.get('redirect') || '/sessions';
        router.push(redirect);
        router.refresh();
      } else {
        const data = await response.json();
        
        // Show attempts remaining if available
        if (data.attemptsRemaining !== undefined && data.attemptsRemaining > 0) {
          setError(
            `${data.error || 'Invalid credentials'}. ${data.attemptsRemaining} attempt${data.attemptsRemaining !== 1 ? 's' : ''} remaining.`
          );
        } else {
          setError(data.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {t('admin.loginTitle') || 'Admin Login'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              {t('admin.username') || 'Username'}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              {t('admin.password') || 'Password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-300 text-sm bg-red-500/20 rounded p-3 border border-red-400/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
          >
            {loading ? (t('admin.loggingIn') || 'Logging in...') : (t('admin.login') || 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage(): JSX.Element {
  return (
    <QuizLayout variant="stats">
      <Suspense fallback={
        <div className="max-w-md mx-auto mt-16 px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-xl">
            <div className="text-center text-white">Loading...</div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </QuizLayout>
  );
}
