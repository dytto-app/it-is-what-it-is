import React, { useMemo, useState, useCallback } from 'react';
import { Sparkles, Share2, Copy, Check, User2, Twitter } from 'lucide-react';
import { Session } from '../types';
import { calculatePersonality, getSecondaryTrait } from '../utils/personality';

interface PersonalityProfileProps {
  sessions: Session[];
  currentStreak: number;
  longestStreak: number;
  nickname?: string;
}

export const PersonalityProfile: React.FC<PersonalityProfileProps> = ({
  sessions,
  currentStreak,
  longestStreak,
  nickname,
}) => {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const personality = useMemo(
    () => calculatePersonality(sessions, currentStreak, longestStreak),
    [sessions, currentStreak, longestStreak]
  );

  const secondaryTrait = useMemo(
    () => personality ? getSecondaryTrait(sessions, personality.id) : null,
    [sessions, personality]
  );

  const completedSessions = sessions.filter(s => !s.isActive && s.duration > 0);
  const isEligible = completedSessions.length >= 5;

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

  if (!personality) {
    return null;
  }

  return (
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
            <div className="mt-4 flex gap-2">
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
  );
};
