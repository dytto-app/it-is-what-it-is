import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Twitter, Copy, Check, Download } from 'lucide-react';
import { Session } from '../types';
import { CalculationUtils } from '../utils/calculations';
import { useFocusTrap } from '../utils/useFocusTrap';

interface ShareSessionModalProps {
  session: Session;
  currentStreak?: number;
  onClose: () => void;
}

export const ShareSessionModal: React.FC<ShareSessionModalProps> = ({
  session,
  currentStreak = 0,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusTrapRef = useFocusTrap(true);

  const earnings = session.earnings;
  const duration = session.duration;
  const formattedEarnings = CalculationUtils.formatCurrency(earnings);
  const formattedDuration = CalculationUtils.formatDuration(duration);

  // Generate share text
  const getShareText = () => {
    let text = `I just earned ${formattedEarnings} in ${formattedDuration} on Back-log 🚽💰`;
    if (currentStreak >= 3) {
      text += `\n🔥 ${currentStreak} day streak!`;
    }
    text += '\n\nhttps://back-log.com';
    return text;
  };

  // Generate shareable image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 600, Math.random() * 400, Math.random() * 50 + 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border glow effect
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 560, 360);
    ctx.shadowBlur = 0;

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('backlog', 300, 70);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText('session complete', 300, 100);

    // Main earnings display
    const earningsGradient = ctx.createLinearGradient(150, 140, 450, 200);
    earningsGradient.addColorStop(0, '#34d399');
    earningsGradient.addColorStop(1, '#6ee7b7');
    ctx.fillStyle = earningsGradient;
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillText(formattedEarnings, 300, 190);

    // Duration
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText(`in ${formattedDuration}`, 300, 240);

    // Streak badge if applicable
    if (currentStreak >= 3) {
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🔥 ${currentStreak} day streak`, 300, 290);
    }

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillText('back-log.com', 300, 360);

    // Emoji decorations
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillText('🚽', 80, 200);
    ctx.fillText('💰', 520, 200);

    setImageGenerated(true);
  }, [formattedEarnings, formattedDuration, currentStreak]);

  // Native share (Web Share API)
  const handleNativeShare = async () => {
    const shareText = getShareText();
    
    if (navigator.share) {
      try {
        // Try sharing with image first
        if (canvasRef.current) {
          const blob = await new Promise<Blob | null>((resolve) => {
            canvasRef.current?.toBlob(resolve, 'image/png');
          });
          
          if (blob) {
            const file = new File([blob], 'backlog-session.png', { type: 'image/png' });
            await navigator.share({
              text: shareText,
              files: [file]
            });
            return;
          }
        }
        
        // Fallback to text-only share
        await navigator.share({
          text: shareText,
          url: 'https://back-log.com'
        });
      } catch {
        // User cancelled or share failed - that's okay
      }
    }
  };

  // Twitter/X share
  const handleTwitterShare = () => {
    const text = `I just earned ${formattedEarnings} in ${formattedDuration} on @backlog_app 🚽💰${currentStreak >= 3 ? ` 🔥 ${currentStreak} day streak!` : ''}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://back-log.com')}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Download image
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `backlog-${formattedEarnings.replace('$', '')}-${formattedDuration.replace(':', 'm')}s.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const canShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div ref={focusTrapRef} className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close share modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-6 pb-4 px-6 text-center">
          <h2 id="share-modal-title" className="text-2xl font-bold text-white mb-1">Session Complete!</h2>
          <p className="text-slate-400 text-sm">Share your accomplishment</p>
        </div>

        {/* Preview card */}
        <div className="px-6 pb-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-600/30 shadow-lg">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ display: imageGenerated ? 'block' : 'none' }}
            />
            {!imageGenerated && (
              <div className="w-full aspect-[3/2] bg-slate-800 animate-pulse flex items-center justify-center">
                <span className="text-slate-500">Generating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Share buttons */}
        <div className="p-6 pt-2 space-y-3">
          {/* Primary share button */}
          {canShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          )}

          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleTwitterShare}
              aria-label="Share on Twitter"
              className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700/30"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-xs">Twitter</span>
            </button>

            <button
              onClick={handleCopy}
              aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
              className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700/30"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              aria-label="Download share image"
              className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700/30"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">Save</span>
            </button>
          </div>

          {/* Skip button */}
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
