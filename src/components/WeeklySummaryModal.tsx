import React, { useRef, useEffect, useState } from 'react';
import { X, TrendingUp, Clock, Flame, Star, Share2, Trophy, Download, Twitter, Copy, Check } from 'lucide-react';
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
  if (sessions.length >= 20) return 'Break Legend';
  if (sessions.length >= 10) return 'Power User';
  if (sessions.length >= 5) return 'Consistent';
  return null;
}

function getRankEmoji(sessions: Session[]): string {
  if (sessions.length >= 20) return '🏆';
  if (sessions.length >= 10) return '⚡';
  if (sessions.length >= 5) return '✅';
  return '📊';
}

export const WeeklySummaryModal: React.FC<WeeklySummaryProps> = ({ user, sessions, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const weeklySessions = getLastWeekSessions(sessions);

  const totalEarnings = weeklySessions.reduce((sum, s) => sum + (s.earnings || 0), 0);
  const totalDuration = weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const sessionCount = weeklySessions.length;
  const bestSession = weeklySessions.reduce((best, s) => (!best || s.earnings > best.earnings) ? s : best, null as Session | null);
  const avgEarningsPerSession = sessionCount > 0 ? totalEarnings / sessionCount : 0;
  const peakDay = getPeakDay(weeklySessions);
  const rankLabel = getTopRankLabel(weeklySessions);
  const rankEmoji = getRankEmoji(weeklySessions);

  // Generate canvas image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (square for social sharing)
    canvas.width = 600;
    canvas.height = 600;

    // Background gradient (purple/violet theme)
    const gradient = ctx.createLinearGradient(0, 0, 600, 600);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.3, '#1a0a2e');
    gradient.addColorStop(0.7, '#1a1a3e');
    gradient.addColorStop(1, '#0d1117');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 600);

    // Subtle decorative circles
    ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 600, Math.random() * 600, Math.random() * 80 + 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border glow
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 550, 550);
    ctx.shadowBlur = 0;

    // Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WEEKLY WRAP', 300, 65);

    // Star decoration
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('⭐', 300, 100);

    // Rank label if applicable
    if (rankLabel) {
      ctx.fillStyle = '#d8b4fe';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${rankEmoji} ${rankLabel}`, 300, 140);
    }

    // Main earnings
    const earningsGradient = ctx.createLinearGradient(100, 180, 500, 260);
    earningsGradient.addColorStop(0, '#a855f7');
    earningsGradient.addColorStop(0.5, '#38bdf8');
    earningsGradient.addColorStop(1, '#10b981');
    ctx.fillStyle = earningsGradient;
    ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
    ctx.fillText(CalculationUtils.formatCurrency(totalEarnings), 300, 240);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText('earned on breaks last week', 300, 280);

    // Stats row
    const statsY = 350;
    const statsSpacing = 150;
    const statsStartX = 150;

    // Time stat
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(formatDurationShort(totalDuration), statsStartX, statsY);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('TIME', statsStartX, statsY + 20);

    // Sessions stat
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(sessionCount.toString(), statsStartX + statsSpacing, statsY);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('SESSIONS', statsStartX + statsSpacing, statsY + 20);

    // Streak stat
    ctx.fillStyle = '#fb923c';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(user.currentStreak.toString(), statsStartX + statsSpacing * 2, statsY);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('DAY STREAK', statsStartX + statsSpacing * 2, statsY + 20);

    // Best session highlight
    if (bestSession) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      roundRect(ctx, 100, 400, 400, 70, 16);
      ctx.fill();
      
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('🏆 BEST BREAK', 300, 425);
      
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${CalculationUtils.formatCurrency(bestSession.earnings)} in ${formatDurationShort(bestSession.duration)}`, 300, 455);
    }

    // Peak day
    if (sessionCount > 0 && peakDay !== '—') {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Peak day: ${peakDay}`, 300, 510);
    }

    // Footer
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('back-log.com', 300, 560);

    // Toilet emoji decorations
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText('🚽', 70, 300);
    ctx.fillText('💰', 530, 300);

    setImageGenerated(true);
  }, [totalEarnings, totalDuration, sessionCount, user.currentStreak, bestSession, rankLabel, rankEmoji, peakDay]);

  // Helper for rounded rectangles
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const getShareText = () => {
    return `📊 My Back-log Week:\n💰 Earned: ${CalculationUtils.formatCurrency(totalEarnings)}\n⏱ Time: ${formatDurationShort(totalDuration)}\n📅 Sessions: ${sessionCount}\n🔥 Streak: ${user.currentStreak} days\n\nback-log.com`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Try sharing with image
        if (canvasRef.current) {
          const blob = await new Promise<Blob | null>((resolve) => {
            canvasRef.current?.toBlob(resolve, 'image/png');
          });
          
          if (blob) {
            const file = new File([blob], 'backlog-weekly.png', { type: 'image/png' });
            await navigator.share({
              text: getShareText(),
              files: [file]
            });
            return;
          }
        }
        
        // Fallback to text
        await navigator.share({ text: getShareText() });
      } catch { /* user cancelled */ }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleTwitterShare = () => {
    const text = `I earned ${CalculationUtils.formatCurrency(totalEarnings)} on bathroom breaks last week 🚽💰\n\n🔥 ${user.currentStreak} day streak`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://back-log.com')}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard failed */ }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `backlog-week-${CalculationUtils.formatCurrency(totalEarnings).replace('$', '')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Fun fact line
  const funFact = sessionCount === 0
    ? 'No sessions last week — fresh week ahead 💪'
    : sessionCount === 1
    ? 'One session is one more than zero. Keep it up.'
    : `You averaged ${CalculationUtils.formatCurrency(avgEarningsPerSession)} per break — not bad.`;

  const canShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
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
              {rankEmoji} {rankLabel}
            </div>
          )}
        </div>

        {/* Share card preview */}
        <div className="px-6 py-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-600/30 shadow-lg">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ display: imageGenerated ? 'block' : 'none' }}
            />
            {!imageGenerated && (
              <div className="w-full aspect-square bg-slate-800 animate-pulse flex items-center justify-center">
                <span className="text-slate-500">Generating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats row */}
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

        {/* Fun fact */}
        <div className="px-6 pb-2">
          <p className="text-xs text-slate-500 text-center italic">{funFact}</p>
        </div>

        {/* Share actions */}
        <div className="px-6 pb-6 pt-3 space-y-3">
          {/* Primary share */}
          {canShare && (
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(56,189,248,0.4))',
                border: '1px solid rgba(168,85,247,0.5)',
                color: '#e2e8f0',
              }}
            >
              <Share2 className="w-4 h-4" />
              Share Your Week
            </button>
          )}

          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Twitter className="w-4 h-4 text-slate-300" />
              <span className="text-xs text-slate-400">Twitter</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-300" />
              )}
              <span className="text-xs text-slate-400">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span className="text-xs text-slate-400">Save</span>
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
