/**
 * WelcomeBackModal — re-engagement for dormant users
 *
 * Shows once per session if the user hasn't tracked in 3+ days.
 * Personalised: shows "you could have earned $X" based on their average.
 *
 * Related: GitHub issue #30 (growth: re-engagement notifications for dormant users)
 * Inspired by: arxiv:2602.13134 — "Awakening Dormant Users" (Kuaishou, +7.3% order lift)
 */
import React, { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import { User, Session } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface WelcomeBackModalProps {
  user: User;
  sessions: Session[];
  onDismiss: () => void;
  onStartSession: () => void;
}

const STORAGE_KEY = 'backlog_welcome_back_dismissed';

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  user,
  sessions,
  onDismiss,
  onStartSession,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user.lastSessionDate) return;

    const now = new Date();
    const last = new Date(user.lastSessionDate);
    const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince < 3) return;

    // Only show once per login (not every render)
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      // Clear if it was dismissed more than 24h ago (so next login can show it again)
      const dismissedMs = parseInt(dismissedAt, 10);
      if (now.getTime() - dismissedMs < 24 * 60 * 60 * 1000) return;
      localStorage.removeItem(STORAGE_KEY);
    }

    setVisible(true);
  }, [user.lastSessionDate]);

  if (!visible) return null;

  const daysSince = user.lastSessionDate
    ? Math.floor((Date.now() - new Date(user.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Estimate missed earnings: days × average session earnings × ~2 sessions/day assumption
  const completedSessions = sessions.filter(s => !s.isActive && s.duration > 0);
  const avgEarnings =
    completedSessions.length > 0
      ? completedSessions.reduce((s, x) => s + x.earnings, 0) / completedSessions.length
      : 0;

  // Use actual historical sessions-per-day if we have data, otherwise 2
  const now = new Date();
  const firstSession = completedSessions.length > 0
    ? completedSessions.reduce((a, b) => (a.startTime < b.startTime ? a : b))
    : null;
  const totalDays = firstSession
    ? Math.max(1, Math.ceil((now.getTime() - firstSession.startTime.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const sessionsPerDay = completedSessions.length > 0 ? completedSessions.length / totalDays : 1;
  const missedEarnings = avgEarnings * sessionsPerDay * daysSince;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(false);
    onDismiss();
  };

  const handleStart = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(false);
    onStartSession();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 animate-slide-up">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss welcome back modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Emoji header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">👋</div>
          <h2 className="text-xl font-bold text-white">
            Welcome back!
          </h2>
          <p className="text-indigo-300 text-sm mt-1">
            You've been away for {daysSince} day{daysSince !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Missed earnings callout */}
        {missedEarnings > 0.01 && (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 mb-5 text-center">
            <p className="text-amber-200 text-sm">
              Based on your average, you could have earned
            </p>
            <p className="text-amber-300 text-2xl font-bold mt-1">
              {CalculationUtils.formatCurrency(missedEarnings)}
            </p>
            <p className="text-amber-400/70 text-xs mt-1">
              during those {daysSince} days. Make up for it now? 🚽
            </p>
          </div>
        )}

        {/* Streak reset note */}
        {user.currentStreak === 0 && daysSince >= 2 && (
          <p className="text-slate-400 text-xs text-center mb-4">
            Your streak reset — but every legend starts at day 1.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-2xl border border-slate-600/40 text-slate-400 text-sm font-medium hover:text-slate-200 hover:border-slate-500/60 transition-all"
          >
            Later
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start a session
          </button>
        </div>
      </div>
    </div>
  );
};
