import React, { useRef } from 'react';
import { X, TrendingUp, Clock, Flame, Star, Share2, Trophy } from 'lucide-react';
import { Session, User } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface WeeklySummaryProps {
  user: User;
  sessions: Session[];
  onClose: () => void;
}

function getLastWeekSessions(sessions: Session[]): Session[] {
  const now = new Date();
  // Go back to last Monday 00:00
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  // Days since last Monday (Mon=1, so if today is Mon daysSinceMon=0, Tue=1...)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(today.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
  const lastMonday = new Date(thisMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
  return sessions.filter(s => {
    const t = s.startTime instanceof Date ? s.startTime : new Date(s.startTime);
    return t >= lastMonday && t < thisMonday;
  });
}

function formatDurationShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getPeakDay(sessions: Session[]): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = new Array(7).fill(0);
  sessions.forEach(s => {
    const d = (s.startTime instanceof Date ? s.startTime : new Date(s.startTime)).getDay();
    counts[d]++;
  });
  const max = Math.max(...counts);
  if (max === 0) return '—';
  return days[counts.indexOf(max)];
}

function getTopRankLabel(sessions: Session[]): string | null {
  if (sessions.length >= 20) return 'Break Legend 🏆';
  if (sessions.length >= 10) return 'Power User ⚡';
  if (sessions.length >= 5) return 'Consistent ✅';
  return null;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryProps> = ({ user, sessions, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const weeklySessions = getLastWeekSessions(sessions);

  const totalEarnings = weeklySessions.reduce((sum, s) => sum + (s.earnings || 0), 0);
  const totalDuration = weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const sessionCount = weeklySessions.length;
  const bestSession = weeklySessions.reduce((best, s) => (!best || s.earnings > best.earnings) ? s : best, null as Session | null);
  const avgEarningsPerSession = sessionCount > 0 ? totalEarnings / sessionCount : 0;
  const peakDay = getPeakDay(weeklySessions);
  const rankLabel = getTopRankLabel(weeklySessions);

  // Fun fact line
  const funFact = sessionCount === 0
    ? 'No sessions last week — fresh week ahead 💪'
    : sessionCount === 1
    ? 'One session is one more than zero. Keep it up.'
    : `You averaged ${CalculationUtils.formatCurrency(avgEarningsPerSession)} per break — not bad.`;

  const handleShare = async () => {
    const text = `📊 My Break-log Week:\n💰 Earned: ${CalculationUtils.formatCurrency(totalEarnings)}\n⏱ Time: ${formatDurationShort(totalDuration)}\n📅 Sessions: ${sessionCount}\n🔥 Streak: ${user.currentStreak} days\n\nback-log.com`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Back-log Week', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a0a2e 50%, #0d1117 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 0 60px rgba(139,92,246,0.2)',
        }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(ellipse, #a855f7, transparent)' }} />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Weekly Wrap</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            Last Week's <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #a855f7, #38bdf8)' }}>Breaks</span>
          </h2>
          {rankLabel && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#d8b4fe' }}>
              {rankLabel}
            </div>
          )}
        </div>

        {/* Big number */}
        <div className="px-6 py-2 text-center">
          <div className="text-5xl font-black text-transparent bg-clip-text mb-1"
            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #38bdf8, #10b981)' }}>
            {CalculationUtils.formatCurrency(totalEarnings)}
          </div>
          <p className="text-slate-400 text-sm">earned on breaks last week</p>
        </div>

        {/* Stats grid */}
        <div className="px-6 py-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{formatDurationShort(totalDuration)}</div>
            <div className="text-xs text-slate-500">total time</div>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{sessionCount}</div>
            <div className="text-xs text-slate-500">sessions</div>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{user.currentStreak}</div>
            <div className="text-xs text-slate-500">day streak</div>
          </div>
        </div>

        {/* Best session */}
        {bestSession && (
          <div className="mx-6 mb-4 rounded-2xl p-4"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Best Break</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{CalculationUtils.formatCurrency(bestSession.earnings)}</span>
              <span className="text-sm text-slate-400">{formatDurationShort(bestSession.duration)}</span>
            </div>
          </div>
        )}

        {/* Peak day */}
        {sessionCount > 0 && (
          <div className="mx-6 mb-4 rounded-2xl p-3 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-sm text-slate-400">Peak day</span>
            <span className="text-sm font-semibold text-white">{peakDay}</span>
          </div>
        )}

        {/* Fun fact */}
        <div className="px-6 pb-2">
          <p className="text-xs text-slate-500 text-center italic">{funFact}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-3 flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(56,189,248,0.3))',
              border: '1px solid rgba(168,85,247,0.4)',
              color: '#e2e8f0',
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
