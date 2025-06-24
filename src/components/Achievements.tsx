import React, { useState } from 'react';
import { Trophy, Lock, Star, Crown, Target, Clock, DollarSign, Sparkles } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Achievement } from '../types';
import { AchievementUtils } from '../utils/achievements';

interface AchievementsProps {
  achievements: Achievement[];
}

type CategoryType = 'all' | 'beginner' | 'sessions' | 'earnings' | 'time' | 'special';

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const categories = AchievementUtils.getAchievementsByCategory(achievements);

  const getDisplayedAchievements = () => {
    if (selectedCategory === 'all') return achievements;
    return categories[selectedCategory as keyof typeof categories] || [];
  };

  const getCategoryStats = (categoryAchievements: Achievement[]) => {
    const unlocked = categoryAchievements.filter(a => a.unlockedAt).length;
    const total = categoryAchievements.length;
    return { unlocked, total, percentage: total > 0 ? (unlocked / total) * 100 : 0 };
  };

  const getAchievementRarity = (achievement: Achievement): { rarity: string; color: string } => {
    if (achievement.threshold >= 500 || ['legendary-status', 'millionaire-mindset', 'full-day-champion'].includes(achievement.id)) {
      return { rarity: 'Legendary', color: 'text-purple-400' };
    }
    if (achievement.threshold >= 100 || ['consistency-king', 'efficiency-expert', 'midnight-warrior'].includes(achievement.id)) {
      return { rarity: 'Epic', color: 'text-blue-400' };
    }
    if (achievement.threshold >= 25 || ['weekend-warrior', 'workday-hero', 'power-user'].includes(achievement.id)) {
      return { rarity: 'Rare', color: 'text-emerald-400' };
    }
    if (achievement.threshold >= 5) {
      return { rarity: 'Uncommon', color: 'text-yellow-400' };
    }
    return { rarity: 'Common', color: 'text-slate-400' };
  };

  const categoryData = [
    { 
      key: 'all', 
      label: 'All', 
      icon: Trophy, 
      achievements: achievements,
      color: 'from-yellow-400 to-amber-500'
    },
    { 
      key: 'beginner', 
      label: 'Beginner', 
      icon: Star, 
      achievements: categories.beginner,
      color: 'from-emerald-400 to-teal-500'
    },
    { 
      key: 'sessions', 
      label: 'Sessions', 
      icon: Target, 
      achievements: categories.sessions,
      color: 'from-blue-400 to-indigo-500'
    },
    { 
      key: 'earnings', 
      label: 'Earnings', 
      icon: DollarSign, 
      achievements: categories.earnings,
      color: 'from-emerald-400 to-green-500'
    },
    { 
      key: 'time', 
      label: 'Time', 
      icon: Clock, 
      achievements: categories.time,
      color: 'from-purple-400 to-pink-500'
    },
    { 
      key: 'special', 
      label: 'Special', 
      icon: Crown, 
      achievements: categories.special,
      color: 'from-orange-400 to-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400/30 to-amber-500/30 rounded-3xl border-2 border-yellow-400/50 mb-6 shadow-xl shadow-yellow-500/20">
            <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent mb-3">
            Achievements
          </h2>
          <p className="text-slate-300 text-lg mb-6">
            Unlock achievements and showcase your progress
          </p>
          
          {/* Overall Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 font-semibold">Overall Progress</span>
              <span className="text-yellow-400 font-bold">{unlockedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-black/30 backdrop-blur-lg rounded-full h-3 border border-slate-600/30 shadow-lg">
              <div 
                className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 h-full rounded-full transition-all duration-1000 shadow-lg shadow-yellow-500/30"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="text-sm text-slate-400 mt-2 text-center">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-500/20 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {categoryData.map(({ key, label, icon: Icon, achievements: categoryAchievements, color }) => {
            const stats = getCategoryStats(categoryAchievements);
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as CategoryType)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                  selectedCategory === key
                    ? `bg-gradient-to-br ${color}/20 border border-current/30 shadow-lg`
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
                style={{ 
                  color: selectedCategory === key ? (
                    color.includes('yellow') ? '#fbbf24' : 
                    color.includes('emerald') ? '#10b981' : 
                    color.includes('blue') ? '#3b82f6' : 
                    color.includes('purple') ? '#a855f7' : 
                    color.includes('orange') ? '#f97316' : '#64748b'
                  ) : undefined 
                }}
              >
                <Icon className="w-5 h-5 mb-2" />
                <span className="text-sm font-semibold">{label}</span>
                <div className="text-xs mt-1 opacity-75">
                  {stats.unlocked}/{stats.total}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-4">
        {getDisplayedAchievements().length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-12 border border-slate-500/20 shadow-xl">
              <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-6" />
              <p className="text-slate-400 text-lg mb-2">No achievements in this category</p>
              <p className="text-slate-500">
                Try a different category to see more achievements
              </p>
            </div>
          </div>
        ) : (
          getDisplayedAchievements().map((achievement) => {
            const IconComponent = (Icons as any)[achievement.icon] || Trophy;
            const isUnlocked = !!achievement.unlockedAt;
            const rarity = getAchievementRarity(achievement);

            return (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 transform hover:scale-[1.02] ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-500/20 via-amber-500/15 to-yellow-600/20 border-2 border-yellow-400/40 shadow-2xl shadow-yellow-500/20'
                    : 'bg-gradient-to-br from-black/60 to-black/40 border border-slate-600/30 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Animated background for unlocked achievements */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse" />
                )}

                <div className="relative flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-yellow-400/50 shadow-yellow-500/20'
                      : 'bg-black/30 backdrop-blur-lg border-slate-600/30'
                  }`}>
                    {isUnlocked ? (
                      <IconComponent className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                    ) : (
                      <Lock className="w-8 h-8 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-bold ${
                        isUnlocked 
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent' 
                          : 'text-slate-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isUnlocked 
                          ? `${rarity.color} bg-current/10 border border-current/20`
                          : 'text-slate-500 bg-slate-500/10 border border-slate-500/20'
                      }`}>
                        {rarity.rarity}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isUnlocked ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {isUnlocked && achievement.unlockedAt && (
                      <div className="mt-4 inline-flex items-center px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-400/30">
                        <Sparkles className="w-3 h-3 mr-2 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-medium">
                          Unlocked {achievement.unlockedAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Motivational message for locked achievements */}
      {unlockedCount < totalCount && (
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-500/20 shadow-xl">
            <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">Keep going!</p>
            <p className="text-slate-500">
              {totalCount - unlockedCount} more achievements to unlock
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
