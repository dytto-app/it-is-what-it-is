import { Achievement, Session } from '../types';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Beginner Achievements
  {
    id: 'first-session',
    title: 'First Drop',
    description: 'Complete your first session',
    icon: 'Zap',
    threshold: 1,
    type: 'sessions'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a session before 8 AM',
    icon: 'Sunrise',
    threshold: 1,
    type: 'sessions'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a session after 10 PM',
    icon: 'Moon',
    threshold: 1,
    type: 'sessions'
  },

  // Session Count Achievements
  {
    id: 'five-sessions',
    title: 'Getting Started',
    description: 'Complete 5 sessions',
    icon: 'Play',
    threshold: 5,
    type: 'sessions'
  },
  {
    id: 'ten-sessions',
    title: 'Getting Regular',
    description: 'Complete 10 sessions',
    icon: 'Target',
    threshold: 10,
    type: 'sessions'
  },
  {
    id: 'twenty-five-sessions',
    title: 'Dedicated User',
    description: 'Complete 25 sessions',
    icon: 'Award',
    threshold: 25,
    type: 'sessions'
  },
  {
    id: 'fifty-sessions',
    title: 'Weekly Warrior',
    description: 'Complete 50 sessions',
    icon: 'Shield',
    threshold: 50,
    type: 'sessions'
  },
  {
    id: 'hundred-sessions',
    title: 'Century Master',
    description: 'Complete 100 sessions',
    icon: 'Crown',
    threshold: 100,
    type: 'sessions'
  },
  {
    id: 'two-fifty-sessions',
    title: 'Elite Professional',
    description: 'Complete 250 sessions',
    icon: 'Star',
    threshold: 250,
    type: 'sessions'
  },
  {
    id: 'five-hundred-sessions',
    title: 'Legendary Status',
    description: 'Complete 500 sessions',
    icon: 'Trophy',
    threshold: 500,
    type: 'sessions'
  },

  // Earnings Achievements
  {
    id: 'first-dollar',
    title: 'First Buck',
    description: 'Earn your first dollar',
    icon: 'DollarSign',
    threshold: 1,
    type: 'earnings'
  },
  {
    id: 'ten-dollars',
    title: 'Coffee Money',
    description: 'Earn $10 in break time',
    icon: 'Coffee',
    threshold: 10,
    type: 'earnings'
  },
  {
    id: 'fifty-dollars',
    title: 'Lunch Money',
    description: 'Earn $50 in break time',
    icon: 'Utensils',
    threshold: 50,
    type: 'earnings'
  },
  {
    id: 'hundred-dollars',
    title: 'Century Club',
    description: 'Earn $100 in break time',
    icon: 'Banknote',
    threshold: 100,
    type: 'earnings'
  },
  {
    id: 'five-hundred-dollars',
    title: 'High Roller',
    description: 'Earn $500 in break time',
    icon: 'Gem',
    threshold: 500,
    type: 'earnings'
  },
  {
    id: 'thousand-dollars',
    title: 'Millionaire Mindset',
    description: 'Earn $1,000 in break time',
    icon: 'Diamond',
    threshold: 1000,
    type: 'earnings'
  },

  // Time Achievements
  {
    id: 'fifteen-minutes',
    title: 'Quick Break',
    description: 'Accumulate 15 minutes of sessions',
    icon: 'Clock',
    threshold: 900,
    type: 'time'
  },
  {
    id: 'one-hour',
    title: 'Time Well Spent',
    description: 'Accumulate 1 hour of sessions',
    icon: 'Clock3',
    threshold: 3600,
    type: 'time'
  },
  {
    id: 'five-hours',
    title: 'Time Master',
    description: 'Accumulate 5 hours of sessions',
    icon: 'Clock4',
    threshold: 18000,
    type: 'time'
  },
  {
    id: 'ten-hours',
    title: 'Dedication Incarnate',
    description: 'Accumulate 10 hours of sessions',
    icon: 'Clock8',
    threshold: 36000,
    type: 'time'
  },
  {
    id: 'twenty-four-hours',
    title: 'Full Day Champion',
    description: 'Accumulate 24 hours of sessions',
    icon: 'Clock12',
    threshold: 86400,
    type: 'time'
  },

  // Special Achievements
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete a session in under 30 seconds',
    icon: 'Zap',
    threshold: 1,
    type: 'sessions'
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Complete a session longer than 20 minutes',
    icon: 'Timer',
    threshold: 1,
    type: 'sessions'
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Complete sessions on 7 consecutive days',
    icon: 'Calendar',
    threshold: 7,
    type: 'sessions'
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Complete 10 sessions on weekends',
    icon: 'Mountain',
    threshold: 10,
    type: 'sessions'
  },
  {
    id: 'workday-hero',
    title: 'Workday Hero',
    description: 'Complete 25 sessions on weekdays',
    icon: 'Briefcase',
    threshold: 25,
    type: 'sessions'
  },
  {
    id: 'efficiency-expert',
    title: 'Efficiency Expert',
    description: 'Maintain average session time under 5 minutes',
    icon: 'Gauge',
    threshold: 1,
    type: 'sessions'
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Complete 5 sessions in one day',
    icon: 'Flame',
    threshold: 5,
    type: 'sessions'
  },
  {
    id: 'midnight-warrior',
    title: 'Midnight Warrior',
    description: 'Complete a session at exactly midnight',
    icon: 'Moon',
    threshold: 1,
    type: 'sessions'
  },
  {
    id: 'lunch-break-legend',
    title: 'Lunch Break Legend',
    description: 'Complete 10 sessions between 12-1 PM',
    icon: 'Sandwich',
    threshold: 10,
    type: 'sessions'
  },

  // Streak Achievements
  {
    id: 'streak-3',
    title: '3-Day Streak',
    description: 'Maintain a 3-day streak',
    icon: 'Flame',
    threshold: 3,
    type: 'streak'
  },
  {
    id: 'streak-7',
    title: 'Week Streak',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    threshold: 7,
    type: 'streak'
  },
  {
    id: 'streak-14',
    title: 'Two Week Streak',
    description: 'Maintain a 14-day streak',
    icon: 'Flame',
    threshold: 14,
    type: 'streak'
  },
  {
    id: 'streak-30',
    title: 'Month Streak',
    description: 'Maintain a 30-day streak',
    icon: 'Flame',
    threshold: 30,
    type: 'streak'
  },
  {
    id: 'streak-100',
    title: 'Century Streak',
    description: 'Maintain a 100-day streak',
    icon: 'Fire',
    threshold: 100,
    type: 'streak'
  }
];

export const AchievementUtils = {
  checkAchievements(
    sessions: Session[], 
    currentAchievements: Achievement[],
    currentStreak?: number
  ): Achievement[] {
    const totalSessions = sessions.length;
    const totalEarnings = sessions.reduce((sum, s) => sum + s.earnings, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    const streak = currentStreak || 0;

    const updatedAchievements = [...currentAchievements];

    // Helper function to check if achievement should unlock
    const shouldUnlockAchievement = (achievement: Achievement): boolean => {
      switch (achievement.id) {
        case 'early-bird':
          return sessions.some(s => s.startTime.getHours() < 8);
        
        case 'night-owl':
          return sessions.some(s => s.startTime.getHours() >= 22);
        
        case 'speed-demon':
          return sessions.some(s => s.duration < 30);
        
        case 'marathon-runner':
          return sessions.some(s => s.duration > 1200); // 20 minutes
        
        case 'consistency-king':
          return checkConsecutiveDays(sessions) >= 7;
        
        case 'weekend-warrior':
          return sessions.filter(s => {
            const day = s.startTime.getDay();
            return day === 0 || day === 6; // Sunday or Saturday
          }).length >= 10;
        
        case 'workday-hero':
          return sessions.filter(s => {
            const day = s.startTime.getDay();
            return day >= 1 && day <= 5; // Monday to Friday
          }).length >= 25;
        
        case 'efficiency-expert':
          return averageSessionTime < 300 && totalSessions >= 10; // Under 5 minutes average
        
        case 'power-user':
          return checkMaxSessionsInDay(sessions) >= 5;
        
        case 'midnight-warrior':
          return sessions.some(s => s.startTime.getHours() === 0);
        
        case 'lunch-break-legend':
          return sessions.filter(s => {
            const hour = s.startTime.getHours();
            return hour === 12;
          }).length >= 10;
        
        default:
          // Standard threshold-based achievements
          switch (achievement.type) {
            case 'sessions':
              return totalSessions >= achievement.threshold;
            case 'earnings':
              return totalEarnings >= achievement.threshold;
            case 'time':
              return totalTime >= achievement.threshold;
            case 'streak':
              return streak >= achievement.threshold;
            default:
              return false;
          }
      }
    };

    DEFAULT_ACHIEVEMENTS.forEach(achievement => {
      const existing = updatedAchievements.find(a => a.id === achievement.id);
      
      if (!existing || existing.unlockedAt) return;

      if (shouldUnlockAchievement(achievement)) {
        const index = updatedAchievements.findIndex(a => a.id === achievement.id);
        if (index >= 0) {
          updatedAchievements[index] = {
            ...achievement,
            unlockedAt: new Date()
          };
        } else {
          updatedAchievements.push({
            ...achievement,
            unlockedAt: new Date()
          });
        }
      }
    });

    return updatedAchievements;
  },

  initializeAchievements(): Achievement[] {
    return DEFAULT_ACHIEVEMENTS.map(achievement => ({ ...achievement }));
  },

  getAchievementsByCategory(achievements: Achievement[]) {
    // Beginner achievements are the easiest first ones to unlock
    const beginnerIds = ['first-session', 'first-dollar', 'fifteen-minutes'];
    
    const categories = {
      beginner: achievements.filter(a => beginnerIds.includes(a.id)),
      sessions: achievements.filter(a => a.type === 'sessions' && !beginnerIds.includes(a.id)),
      earnings: achievements.filter(a => a.type === 'earnings' && !beginnerIds.includes(a.id)),
      time: achievements.filter(a => a.type === 'time' && !beginnerIds.includes(a.id)),
      streaks: achievements.filter(a => a.type === 'streak'),
      special: achievements.filter(a => a.type === 'special')
    };
    return categories;
  }
};

// Helper functions
function checkConsecutiveDays(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map(s => s.startTime.toDateString()))].sort();
  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }

  return maxConsecutive;
}

function checkMaxSessionsInDay(sessions: Session[]): number {
  const sessionsByDay: { [key: string]: number } = {};
  
  sessions.forEach(session => {
    const dateKey = session.startTime.toDateString();
    sessionsByDay[dateKey] = (sessionsByDay[dateKey] || 0) + 1;
  });

  return Math.max(...Object.values(sessionsByDay), 0);
}
