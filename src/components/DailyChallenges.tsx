import React, { useMemo, useEffect, useRef } from 'react';
import { Session } from '../types';
import { getDailyChallenges, hasConfettiFired, markChallengeConfettiFired } from '../utils/challenges';
import confetti from 'canvas-confetti';

interface DailyChallengesProps {
  sessions: Session[];
  currentStreak: number;
}

function fireChallengeConfetti() {
  // Two-burst celebration — distinct from achievement/streak effects
  const colors = ['#a78bfa', '#818cf8', '#6ee7b7', '#fbbf24'];

  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors,
    scalar: 0.85,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.65 },
      colors,
      scalar: 0.7,
    });
  }, 250);
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ sessions, currentStreak }) => {
  const challenges = useMemo(() => getDailyChallenges(), []);
  const firedRef = useRef<Set<string>>(new Set());

  // Fire confetti on first completion — but only once per challenge per day
  useEffect(() => {
    for (const challenge of challenges) {
      const completed = challenge.isCompleted(sessions, currentStreak);
      if (completed && !hasConfettiFired(challenge.id) && !firedRef.current.has(challenge.id)) {
        firedRef.current.add(challenge.id);
        markChallengeConfettiFired(challenge.id);
        fireChallengeConfetti();
        // Only fire for one at a time to avoid spam — first unhandled one wins
        break;
      }
    }
  }, [sessions, currentStreak, challenges]);

  const completedCount = challenges.filter(c => c.isCompleted(sessions, currentStreak)).length;

  return (
    <div className="mt-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-300">Daily Challenges</span>
          <span className="text-xs text-slate-500">resets midnight</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          completedCount === 3
            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
            : 'bg-slate-700/50 text-slate-400'
        }`}>
          {completedCount}/3
        </span>
      </div>

      {/* Challenge cards */}
      <div className="space-y-2">
        {challenges.map((challenge) => {
          const progress = challenge.getProgress(sessions, currentStreak);
          const completed = challenge.isCompleted(sessions, currentStreak);
          const pct = Math.round(progress * 100);

          return (
            <div
              key={challenge.id}
              className={`relative rounded-2xl px-4 py-3 border backdrop-blur-sm transition-all duration-300 overflow-hidden ${
                completed
                  ? 'bg-gradient-to-r from-violet-500/15 via-purple-500/10 to-indigo-500/15 border-violet-400/30 shadow-lg shadow-violet-500/10'
                  : 'bg-gradient-to-r from-black/40 to-black/30 border-slate-700/40 hover:border-slate-600/50'
              }`}
            >
              {/* Completion shimmer */}
              {completed && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer pointer-events-none" />
              )}

              <div className="flex items-center gap-3">
                {/* Emoji + check */}
                <div className={`relative flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-lg ${
                  completed ? 'bg-violet-500/20' : 'bg-slate-800/60'
                }`}>
                  {completed ? (
                    <span className="text-base">✅</span>
                  ) : (
                    <span className="text-base">{challenge.emoji}</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${completed ? 'text-violet-200' : 'text-slate-200'}`}>
                    {challenge.title}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {challenge.description}
                  </div>

                  {/* Progress bar */}
                  {!completed && progress > 0 && (
                    <div className="mt-2 w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Progress label */}
                <div className={`flex-shrink-0 text-xs font-semibold tabular-nums ${
                  completed ? 'text-violet-300' : 'text-slate-500'
                }`}>
                  {completed ? 'Done!' : pct > 0 ? `${pct}%` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All done banner */}
      {completedCount === 3 && (
        <div className="mt-3 text-center py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
          🏆 All challenges cleared! See you tomorrow.
        </div>
      )}
    </div>
  );
};
