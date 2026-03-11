import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Share2, Copy, Check, User2, Twitter, Download, X, Image } from 'lucide-react';
import { Session } from '../types';
import { calculatePersonality, getSecondaryTrait } from '../utils/personality';

interface PersonalityProfileProps {
  sessions: Session[];
  currentStreak: number;
  longestStreak: number;
  nickname?: string;
}

// Map Tailwind gradient classes to actual color pairs for canvas
const GRADIENT_COLORS: Record<string, [string, string]> = {
  'from-amber-500 to-orange-400': ['#f59e0b', '#fb923c'],
  'from-indigo-600 to-purple-500': ['#4f46e5', '#a855f7'],
  'from-emerald-500 to-teal-400': ['#10b981', '#2dd4bf'],
  'from-yellow-400 to-amber-500': ['#facc15', '#f59e0b'],
  'from-violet-500 to-purple-400': ['#8b5cf6', '#c084fc'],
  'from-indigo-500 to-blue-400': ['#6366f1', '#60a5fa'],
  'from-amber-600 to-yellow-500': ['#d97706', '#eab308'],
  'from-green-500 to-emerald-400': ['#22c55e', '#34d399'],
  'from-blue-500 to-cyan-400': ['#3b82f6', '#22d3ee'],
  'from-pink-500 to-purple-500': ['#ec4899', '#a855f7'],
  'from-rose-500 to-pink-400': ['#f43f5e', '#f472b6'],
  'from-slate-600 to-zinc-500': ['#475569', '#71717a'],
  'from-cyan-400 to-blue-500': ['#22d3ee', '#3b82f6'],
  'from-amber-400 to-yellow-300': ['#fbbf24', '#fde047'],
};

// Helper for rounded rectangles on canvas
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

export const PersonalityProfile: React.FC<PersonalityProfileProps> = ({
  sessions,
  currentStreak,
  longestStreak,
  nickname,
}) => {
  const [showShare, setShowShare] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute these first so they can be used in hooks
  const completedSessions = useMemo(
    () => sessions.filter(s => !s.isActive && s.duration > 0),
    [sessions]
  );
  const isEligible = completedSessions.length >= 5;

  const personality = useMemo(
    () => calculatePersonality(sessions, currentStreak, longestStreak),
    [sessions, currentStreak, longestStreak]
  );

  const secondaryTrait = useMemo(
    () => personality ? getSecondaryTrait(sessions, personality.id) : null,
    [sessions, personality]
  );

  const shareText = useMemo(() => {
    if (!personality) return '';
    return `I'm ${personality.emoji} ${personality.name} on Back-log!\n\n${personality.description}\n\nDiscover your break personality: back-log.com`;
  }, [personality]);

  const handleShare = useCallback(async () => {
    if (!personality) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Break Personality: ${personality.name}`,
          text: shareText,
          url: 'https://back-log.com',
        });
      } catch (err) {
        // User cancelled or share failed — fall back to copy
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [personality, shareText]);

  const handleTwitterShare = useCallback(() => {
    if (!personality) return;
    const tweetText = encodeURIComponent(
      `I'm ${personality.emoji} ${personality.name} on Back-log!\n\n"${personality.description}"\n\nDiscover your break personality:`
    );
    const url = encodeURIComponent('https://back-log.com');
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`, '_blank');
  }, [personality]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current || !personality) return;
    const link = document.createElement('a');
    link.download = `backlog-${personality.id}-personality.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }, [personality]);

  const handleShareWithImage = useCallback(async () => {
    if (!canvasRef.current || !personality) return;

    if (navigator.share) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvasRef.current?.toBlob(resolve, 'image/png');
        });
        
        if (blob) {
          const file = new File([blob], 'backlog-personality.png', { type: 'image/png' });
          await navigator.share({
            text: shareText,
            files: [file]
          });
          return;
        }
        
        await navigator.share({ text: shareText });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [personality, shareText]);

  // Generate canvas share card image
  useEffect(() => {
    if (!showShareCard || !personality) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset image generated state when modal opens
    setImageGenerated(false);

    // Set canvas size (square for social sharing)
    canvas.width = 600;
    canvas.height = 600;

    // Get gradient colors for this personality
    const colors = GRADIENT_COLORS[personality.color] || ['#8b5cf6', '#a855f7'];

    // Background gradient using personality colors
    const gradient = ctx.createLinearGradient(0, 0, 600, 600);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 600);

    // Subtle overlay for depth
    const overlay = ctx.createLinearGradient(0, 0, 0, 600);
    overlay.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    overlay.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, 600, 600);

    // Decorative sparkles (seeded for consistency)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    const sparklePositions = [
      [50, 100], [150, 50], [500, 80], [550, 150], [80, 450],
      [520, 400], [300, 30], [450, 550], [100, 520], [400, 100],
      [250, 480], [350, 520], [180, 280], [420, 280], [60, 300],
      [540, 320], [200, 150], [380, 50], [280, 550], [480, 480]
    ];
    sparklePositions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Border glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 550, 550);
    ctx.shadowBlur = 0;

    // Header badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    roundRect(ctx, 200, 50, 200, 32, 16);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MY BREAK PERSONALITY', 300, 71);

    // Main emoji
    ctx.font = '100px system-ui, -apple-system, sans-serif';
    ctx.fillText(personality.emoji, 300, 190);

    // Personality name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.fillText(personality.name, 300, 260);

    // Secondary trait
    if (secondaryTrait) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'italic 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(secondaryTrait, 300, 295);
    }

    // Description (word wrap)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    const descWords = personality.description.split(' ');
    let line = '';
    let y = secondaryTrait ? 340 : 320;
    const maxWidth = 480;
    
    for (const word of descWords) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), 300, y);
        line = word + ' ';
        y += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 300, y);

    // Traits row
    const traitsY = y + 55;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    roundRect(ctx, 60, traitsY - 22, 480, 44, 22);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText(personality.traits.join('  •  '), 300, traitsY + 5);

    // Stats row
    const statsY = traitsY + 75;
    const statsSpacing = 150;
    const statsStartX = 150;

    // Sessions stat
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(completedSessions.length.toString(), statsStartX, statsY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('SESSIONS', statsStartX, statsY + 20);

    // Streak stat
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(currentStreak.toString(), statsStartX + statsSpacing, statsY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('DAY STREAK', statsStartX + statsSpacing, statsY + 20);

    // Best streak stat
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(longestStreak.toString(), statsStartX + statsSpacing * 2, statsY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('BEST STREAK', statsStartX + statsSpacing * 2, statsY + 20);

    // User attribution
    if (nickname) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'italic 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(`— ${nickname}`, 300, 530);
    }

    // Footer branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('back-log.com', 300, 570);

    setImageGenerated(true);
  }, [showShareCard, personality, secondaryTrait, completedSessions.length, currentStreak, longestStreak, nickname]);

  if (!personality) {
    return null;
  }

  const canShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <>
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-6 border border-pink-500/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <User2 className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent">
              Your Break Personality
            </h3>
          </div>
          {isEligible && (
            <button
              onClick={() => setShowShare(!showShare)}
              className="p-2 bg-pink-500/10 hover:bg-pink-500/20 rounded-xl transition-colors"
              aria-label="Share personality"
            >
              <Share2 className="w-4 h-4 text-pink-400" />
            </button>
          )}
        </div>

        {!isEligible ? (
          /* Not enough data */
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🔮</div>
            <p className="text-slate-300 font-medium mb-1">Personality Loading...</p>
            <p className="text-slate-500 text-sm">
              Complete {5 - completedSessions.length} more session{5 - completedSessions.length !== 1 ? 's' : ''} to discover your break personality
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < completedSessions.length
                      ? 'bg-pink-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Main personality card */}
            <div
              className={`bg-gradient-to-br ${personality.color} rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden`}
            >
              {/* Background sparkles */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-300" />
                <div className="absolute bottom-6 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse delay-500" />
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
              </div>

              <div className="relative">
                {/* Emoji + Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl drop-shadow-lg">{personality.emoji}</div>
                  <div>
                    <div className="text-2xl font-bold text-white drop-shadow-md">
                      {personality.name}
                    </div>
                    {secondaryTrait && (
                      <div className="text-white/70 text-sm italic">
                        {secondaryTrait}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/90 text-sm leading-relaxed mb-4 drop-shadow-sm">
                  {personality.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {personality.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Fun fact */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
                    <p className="text-white/80 text-xs italic leading-relaxed">
                      {personality.funFact}
                    </p>
                  </div>
                </div>

                {/* User attribution */}
                {nickname && (
                  <div className="mt-4 text-right">
                    <span className="text-white/60 text-xs">
                      — {nickname} on Back-log
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Share panel */}
            {showShare && (
              <div className="mt-4 space-y-2">
                {/* Share Card Button */}
                <button
                  onClick={() => setShowShareCard(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500/30 to-purple-500/30 hover:from-pink-500/40 hover:to-purple-500/40 text-white font-medium py-2.5 px-4 rounded-xl transition-all border border-pink-500/30"
                >
                  <Image className="w-4 h-4" />
                  <span>Create Share Card</span>
                </button>
                
                {/* Quick share row */}
                <div className="flex gap-2">
                  <button
                    onClick={handleTwitterShare}
                    className="flex items-center justify-center gap-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-medium py-2.5 px-4 rounded-xl transition-colors border border-sky-500/20"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-medium py-2.5 px-4 rounded-xl transition-colors border border-pink-500/20"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Stats context */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/20 rounded-xl p-2">
                <div className="text-lg font-bold text-pink-300">{completedSessions.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Sessions</div>
              </div>
              <div className="bg-black/20 rounded-xl p-2">
                <div className="text-lg font-bold text-pink-300">{currentStreak}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Streak</div>
              </div>
              <div className="bg-black/20 rounded-xl p-2">
                <div className="text-lg font-bold text-pink-300">{longestStreak}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Best</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Share Card Modal */}
      {showShareCard && personality && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowShareCard(false); }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a0a2e 50%, #0d1117 100%)',
              border: '1px solid rgba(236,72,153,0.3)',
              boxShadow: '0 0 60px rgba(236,72,153,0.2)',
            }}
          >
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30"
              style={{ background: 'radial-gradient(ellipse, #ec4899, transparent)' }} />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={() => setShowShareCard(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Share Card</span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                Your <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #ec4899, #a855f7)' }}>Personality</span>
              </h2>
            </div>

            {/* Canvas preview */}
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

            {/* Share actions */}
            <div className="px-6 pb-6 pt-4 space-y-3">
              {/* Primary share with image */}
              {canShare && (
                <button
                  onClick={handleShareWithImage}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.4), rgba(168,85,247,0.4))',
                    border: '1px solid rgba(236,72,153,0.5)',
                    color: '#e2e8f0',
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share with Image
                </button>
              )}

              {/* Secondary actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleTwitterShare}
                  className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Twitter className="w-4 h-4 text-slate-300" />
                  <span className="text-xs text-slate-400">Twitter</span>
                </button>

                <button
                  onClick={handleShare}
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
                onClick={() => setShowShareCard(false)}
                className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
