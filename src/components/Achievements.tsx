import React from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 mb-4">
          <Trophy className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Achievements</h2>
        <p className="text-gray-400">
          {unlockedCount} of {totalCount} unlocked
        </p>
        
        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto mt-4 bg-gray-800/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements grid */}
      <div className="space-y-3">
        {achievements.map((achievement) => {
          const IconComponent = (Icons as any)[achievement.icon] || Trophy;
          const isUnlocked = !!achievement.unlockedAt;

          return (
            <div
              key={achievement.id}
              className={`relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 ${
                isUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/50'
                  : 'bg-black/40 border-gray-800/50 hover:bg-gray-800/30'
              }`}
            >
              {/* Unlock effect */}
              {isUnlocked && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-emerald-500/20 border-emerald-500/30'
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}>
                  {isUnlocked ? (
                    <IconComponent className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    isUnlocked ? 'text-white' : 'text-gray-400'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    isUnlocked ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-emerald-400 mt-2">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};