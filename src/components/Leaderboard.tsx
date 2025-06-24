import React, { useState } from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserId }) => {
  const [sortBy, setSortBy] = useState<'earnings' | 'time' | 'sessions'>('earnings');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'alltime'>('weekly');

  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'earnings':
        return b.totalEarnings - a.totalEarnings;
      case 'time':
        return b.totalTime - a.totalTime;
      case 'sessions':
        return b.sessionCount - a.sessionCount;
      default:
        return 0;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-2xl border border-yellow-500/30 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Global Leaderboard</h2>
        <p className="text-gray-400">
          Anonymous rankings across all users
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Sort by */}
        <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-1 border border-gray-800/50">
          {[
            { key: 'earnings', label: 'Earnings' },
            { key: 'time', label: 'Time' },
            { key: 'sessions', label: 'Sessions' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key as any)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                sortBy === key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Time frame */}
        <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-1 border border-gray-800/50">
          {[
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'alltime', label: 'All Time' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeFrame(key as any)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                timeFrame === key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No leaderboard data available yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Enable leaderboard visibility in your profile to participate
            </p>
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.userId === currentUserId;

            return (
              <div
                key={entry.userId}
                className={`relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 ${
                  isCurrentUser
                    ? 'bg-emerald-500/10 border-emerald-400/30'
                    : rank <= 3
                    ? 'bg-yellow-500/10 border-yellow-400/20'
                    : 'bg-black/40 border-gray-800/50 hover:bg-gray-800/30'
                }`}
              >
                {isCurrentUser && (
                  <div className="absolute top-2 right-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                    You
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(rank)}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {entry.nickname || `User ${entry.userId.slice(0, 8)}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      {entry.sessionCount} sessions
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white">
                      {sortBy === 'earnings' && CalculationUtils.formatCurrency(entry.totalEarnings)}
                      {sortBy === 'time' && CalculationUtils.formatDuration(entry.totalTime)}
                      {sortBy === 'sessions' && entry.sessionCount}
                    </div>
                    <div className="text-sm text-gray-400">
                      {sortBy === 'earnings' && `${CalculationUtils.formatDuration(entry.totalTime)} total`}
                      {sortBy === 'time' && `${CalculationUtils.formatCurrency(entry.totalEarnings)} earned`}
                      {sortBy === 'sessions' && `${CalculationUtils.formatCurrency(entry.totalEarnings)} earned`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};