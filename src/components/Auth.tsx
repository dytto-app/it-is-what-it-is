import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface AuthProps {
  onAuthSuccess: (userId: string) => void;
  defaultIsLogin?: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, defaultIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sanitize username: lowercase, trim, only allow alphanumeric + underscore + hyphen
      const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
        setError('Username must be 3-30 characters (letters, numbers, underscores, hyphens)');
        setLoading(false);
        return;
      }

      // Use a dedicated domain to avoid collision with real emails
      const email = `${sanitizedUsername}@backlog-app.internal`;

      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          // Also try legacy format for existing users
          const { data: legacyData, error: legacyError } = await supabase.auth.signInWithPassword({
            email: `${sanitizedUsername}@example.com`,
            password
          });
          if (legacyError) {
            setError(signInError.message);
            return;
          }
          if (legacyData.user) {
            onAuthSuccess(legacyData.user.id);
            return;
          }
        }

        if (data.user) {
          onAuthSuccess(data.user.id);
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: sanitizedUsername }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.user) {
          // Create profile for new user
          const { error: insertError } = await supabase.from('profiles').insert([{
            id: data.user.id,
            username: sanitizedUsername,
            nickname: sanitizedUsername,
            hourly_wage: 20,
            show_on_leaderboard: false,
            salary: 30,
            salary_period: 'weekly',
            onboarded: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

          if (insertError) {
            setError(`Failed to create profile: ${insertError.message}`);
            return;
          }

          onAuthSuccess(data.user.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            backlog
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-2 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-slate-400 hover:text-slate-300 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
