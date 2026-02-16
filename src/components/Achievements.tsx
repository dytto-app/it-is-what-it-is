import React, { useState, useMemo } from 'react';
import { 
  Trophy, Lock, Star, Crown, Target, Clock, DollarSign, Sparkles,
  Award, Banknote, Briefcase, Calendar, Clock3, Clock4, Clock8, Clock12,
  Coffee, Diamond, Flame, Gauge, Gem, Moon, Mountain, Play, Sandwich,
  Shield, Sunrise, Timer, Utensils, Zap
} from 'lucide-react';
import { Achievement, Session } from '../types';
import { AchievementUtils } from '../utils/achievements';
import { CalculationUtils } from '../utils/calculations';

// Icon map for achievement icons (avoids importing all lucide icons)
const AchievementIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy, Star, Crown, Target, Clock, DollarSign, Award, Banknote, Briefcase,
  Calendar, Clock3, Clock4, Clock8, Clock12, Coffee, Diamond, Flame, Gauge,
  Gem, Moon, Mountain, Play, Sandwich, Shield, Sunrise, Timer, Utensils, Zap
};

interface AchievementsProps {
  achievements: Achievement[];
  sessions?: Session[];
  currentStreak?: number;
}

type CategoryType = 'all' | 'beginner' | 'sessions' | 'earnings' | 'time' | 'special';

export const Achievements: React.FC<AchievementsProps> = ({ achievements, sessions = [], currentStreak = 0 }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const categories = AchievementUtils.getAchievementsByCategory(achievements);

  // Calculate progress metrics from sessions
  const progressMetrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalEarnings = sessions.reduce((sum, s) => sum + s.earnings, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Calculate special achievement progress
    const earlyBirdSessions = sessions.filter(s => s.startTime.getHours() < 8).length;
    const nightOwlSessions = sessions.filter(s => s.startTime.getHours() >= 22).length;
    const speedySessions = sessions.filter(s => s.duration < 30).length;
    const marathonSessions = sessions.filter(s => s.duration > 1200).length;
    const weekendSessions = sessions.filter(s => {
      const day = s.startTime.getDay();
      return day === 0 || day === 6;
    }).length;
    const workdaySessions = sessions.filter(s => {
      const day = s.startTime.getDay();
      return day >= 1 && day <= 5;
    }).length;
    const midnightSessions = sessions.filter(s => s.startTime.getHours() === 0).length;
    const lunchSessions = sessions.filter(s => s.startTime.getHours() === 12).length;
    
    // Max sessions in a day
    const sessionsByDay: { [key: string]: number } = {};
    sessions.forEach(s => {
      const dateKey = s.startTime.toDateString();
      sessionsByDay[dateKey] = (sessionsByDay[dateKey] || 0) + 1;
    });
    const maxSessionsInDay = Math.max(...Object.values(sessionsByDay), 0);
    
    return {
      totalSessions,
      totalEarnings,
      totalTime,
      currentStreak,
      earlyBirdSessions,
      nightOwlSessions,
      speedySessions,
      marathonSessions,
      weekendSessions,
      workdaySessions,
      midnightSessions,
      lunchSessions,
      maxSessionsInDay,
    };
  }, [sessions, currentStreak]);

  // Get progress for a specific achievement
  const getAchievementProgress = (achievement: Achievement): { current: number; target: number; percentage: number } | null => {
    if (achievement.unlockedAt) return null; // Already unlocked, no progress needed
    
    let current = 0;
    const target = achievement.threshold;
    
    // Map achievement IDs to their progress values
    switch (achievement.id) {
      // Session count achievements
      case 'first-session':
      case 'five-sessions':
      case 'ten-sessions':
      case 'twenty-five-sessions':
      case 'fifty-sessions':
      case 'hundred-sessions':
      case 'two-fifty-sessions':
      case 'five-hundred-sessions':
        current = progressMetrics.totalSessions;
        break;
      
      // Earnings achievements
      case 'first-dollar':
      case 'ten-dollars':
      case 'fifty-dollars':
      case 'hundred-dollars':
      case 'five-hundred-dollars':
      case 'thousand-dollars':
        current = progressMetrics.totalEarnings;
        break;
      
      // Time achievements
      case 'fifteen-minutes':
      case 'one-hour':
      case 'five-hours':
      case 'ten-hours':
      case 'twenty-four-hours':
        current = progressMetrics.totalTime;
        break;
      
      // Streak achievements
      case 'streak-3':
      case 'streak-7':
      case 'streak-14':
      case 'streak-30':
      case 'streak-100':
        current = progressMetrics.currentStreak;
        break;
      
      // Special achievements with numeric progress
      case 'early-bird':
        current = progressMetrics.earlyBirdSessions;
        break;
      case 'night-owl':
        current = progressMetrics.nightOwlSessions;
        break;
      case 'speed-demon':
        current = progressMetrics.speedySessions;
        break;
      case 'marathon-runner':
        current = progressMetrics.marathonSessions;
        break;
      case 'weekend-warrior':
        current = progressMetrics.weekendSessions;
        break;
      case 'workday-hero':
        current = progressMetrics.workdaySessions;
        break;
      case 'midnight-warrior':
        current = progressMetrics.midnightSessions;
        break;
      case 'lunch-break-legend':
        current = progressMetrics.lunchSessions;
        break;
      case 'power-user':
        current = progressMetrics.maxSessionsInDay;
        break;
      
      default:
        return null; // Can't track progress for this achievement
    }
    
    const percentage = Math.min(100, (current / target) * 100);
    return { current, target, percentage };
  };

  // Format progress display based on achievement type
  const formatProgress = (achievement: Achievement, progress: { current: number; target: number }): string => {
    switch (achievement.type) {
      case 'earnings':
        return `$${progress.current.toFixed(2)} / $${progress.target}`;
      case 'time':
        return `${CalculationUtils.formatDuration(progress.current)} / ${CalculationUtils.formatDuration(progress.target)}`;
      default:
        return `${Math.floor(progress.current)} / ${progress.target}`;
    }
  };

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
      color: 'from-emerald-400 to-teal-500'
    },
    {
      key: 'beginner',
      label: 'Beginner',
      icon: Star,
      achievements: categories.beginner,
      color: 'from-yellow-400 to-amber-500'
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
      color: 'from-red-400 to-pink-500'
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
      color: 'from-cyan-400 to-sky-500'
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
          {/* <p className="text-slate-300 text-lg mb-6">
            Unlock achievements and showcase your progress
          </p> */}
          
          {/* Overall Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 font-semibold">Overall Progress</span>
              <span className="text-yellow-400 font-bold">{unlockedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-black/30 backdrop-blur-lg rounded-full h-3 border border-slate-600/30 shadow-lg">
              <div
                className="bg-yellow-500 h-full rounded-full transition-all duration-1000 shadow-lg shadow-yellow-500/30"
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
          {categoryData.map(({ key, icon: Icon, achievements: categoryAchievements, color }) => {
            const stats = getCategoryStats(categoryAchievements);
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as CategoryType)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  selectedCategory === key
                    ? 'bg-black/30 border shadow-2xl backdrop-blur-md border-current/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
                style={{
                  color: selectedCategory === key ? (
                    color.includes('yellow') ? '#fbbf24' :
                    color.includes('emerald') ? '#10b981' :
                    color.includes('cyan') ? '#22d3ee' :
                    color.includes('blue') ? '#3b82f6' :
                    color.includes('red') ? '#f87171' :
                    color.includes('purple') ? '#a855f7' :
                    color.includes('orange') ? '#f97316' : '#64748b'
                  ) : undefined,
                  boxShadow: selectedCategory === key ? `0 0 20px ${
                    color.includes('yellow') ? 'rgba(251, 191, 36, 0.3)' :
                    color.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' :
                    color.includes('cyan') ? 'rgba(34, 211, 238, 0.3)' :
                    color.includes('blue') ? 'rgba(59, 130, 246, 0.3)' :
                    color.includes('red') ? 'rgba(248, 113, 113, 0.3)' :
                    color.includes('purple') ? 'rgba(168, 85, 247, 0.3)' :
                    'rgba(249, 115, 22, 0.3)'
                  }` : undefined
                }}
              >
                {selectedCategory === key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                )}
                <Icon className="w-5 h-5 mb-2" />
                {/* <span className="text-sm font-semibold">{label}</span> */}
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
            const IconComponent = AchievementIcons[achievement.icon] || Trophy;
            const isUnlocked = !!achievement.unlockedAt;
            const rarity = getAchievementRarity(achievement);
            const currentCategoryColor = categoryData.find(c => c.key === selectedCategory)?.color || 'from-emerald-400 to-teal-500';

            const getAccentColor = () => {
              if (currentCategoryColor.includes('yellow')) return { accent: 'yellow', textAccent: 'text-yellow-400', bgAccent: 'bg-yellow-500/20', borderAccent: 'border-yellow-400/50', shadowColor: 'shadow-yellow-500/30' };
              if (currentCategoryColor.includes('emerald')) return { accent: 'emerald', textAccent: 'text-emerald-400', bgAccent: 'bg-emerald-500/20', borderAccent: 'border-emerald-400/50', shadowColor: 'shadow-emerald-500/30' };
              if (currentCategoryColor.includes('cyan')) return { accent: 'cyan', textAccent: 'text-cyan-400', bgAccent: 'bg-cyan-500/20', borderAccent: 'border-cyan-400/50', shadowColor: 'shadow-cyan-500/30' };
              if (currentCategoryColor.includes('blue')) return { accent: 'blue', textAccent: 'text-blue-400', bgAccent: 'bg-blue-500/20', borderAccent: 'border-blue-400/50', shadowColor: 'shadow-blue-500/30' };
              if (currentCategoryColor.includes('red')) return { accent: 'red', textAccent: 'text-red-400', bgAccent: 'bg-red-500/20', borderAccent: 'border-red-400/50', shadowColor: 'shadow-red-500/30' };
              if (currentCategoryColor.includes('purple')) return { accent: 'purple', textAccent: 'text-purple-400', bgAccent: 'bg-purple-500/20', borderAccent: 'border-purple-400/50', shadowColor: 'shadow-purple-500/30' };
              return { accent: 'yellow', textAccent: 'text-yellow-400', bgAccent: 'bg-yellow-500/20', borderAccent: 'border-yellow-400/50', shadowColor: 'shadow-yellow-500/30' };
            };

            const accent = getAccentColor();

            return (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 transform hover:scale-[1.02] ${
                  isUnlocked
                    ? `${accent.bgAccent} border-2 ${accent.borderAccent} shadow-2xl ${accent.shadowColor}`
                    : 'bg-gradient-to-br from-black/60 to-black/40 border border-slate-600/30 shadow-lg hover:shadow-xl'
                }`}
              >

                <div className="relative flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${
                    isUnlocked
                      ? `${accent.bgAccent} ${accent.borderAccent} ${accent.shadowColor}`
                      : 'bg-black/30 backdrop-blur-lg border-slate-600/30'
                  }`}>
                    {isUnlocked ? (
                      <IconComponent className={`w-8 h-8 ${accent.textAccent} drop-shadow-lg`} />
                    ) : (
                      <Lock className="w-8 h-8 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-bold ${
                        isUnlocked
                          ? 'text-yellow-400'
                          : 'text-slate-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isUnlocked
                          ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-400/30'
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
                      <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full border bg-yellow-500/20 border-yellow-400/50`}>
                        <Sparkles className={`w-3 h-3 mr-2 text-yellow-400`} />
                        <span className={`text-xs font-medium text-yellow-300`}>
                          Unlocked {achievement.unlockedAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {/* Progress bar for locked achievements */}
                    {!isUnlocked && (() => {
                      const progress = getAchievementProgress(achievement);
                      if (!progress) return null;
                      
                      return (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500">Progress</span>
                            <span className="text-xs text-slate-400 font-medium">
                              {formatProgress(achievement, progress)}
                            </span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-2 border border-slate-600/30">
                            <div
                              className="bg-gradient-to-r from-slate-500 to-slate-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          {progress.percentage > 0 && progress.percentage < 100 && (
                            <p className="text-xs text-slate-500 mt-1.5">
                              {progress.percentage >= 75 ? "Almost there!" : 
                               progress.percentage >= 50 ? "Halfway there!" : 
                               progress.percentage >= 25 ? "Good progress!" : "Keep going!"}
                            </p>
                          )}
                        </div>
                      );
                    })()}
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
