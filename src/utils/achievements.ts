import { Achievement, Session } from '../types';

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Drop',
    description: 'Complete your first session',
    icon: 'Zap',
    threshold: 1,
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
    id: 'hundred-dollars',
    title: 'Century Club',
    description: 'Earn $100 in break time',
    icon: 'DollarSign',
    threshold: 100,
    type: 'earnings'
  },
  {
    id: 'one-hour',
    title: 'Time Well Spent',
    description: 'Accumulate 1 hour of sessions',
    icon: 'Clock',
    threshold: 3600,
    type: 'time'
  },
  {
    id: 'weekly-warrior',
    title: 'Weekly Warrior',
    description: 'Complete 50 sessions',
    icon: 'Award',
    threshold: 50,
    type: 'sessions'
  }
];

export const AchievementUtils = {
  checkAchievements(
    sessions: Session[], 
    currentAchievements: Achievement[]
  ): Achievement[] {
    const totalSessions = sessions.length;
    const totalEarnings = sessions.reduce((sum, s) => sum + s.earnings, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    const updatedAchievements = [...currentAchievements];

    DEFAULT_ACHIEVEMENTS.forEach(achievement => {
      const existing = updatedAchievements.find(a => a.id === achievement.id);
      
      if (!existing || existing.unlockedAt) return;

      let shouldUnlock = false;
      
      switch (achievement.type) {
        case 'sessions':
          shouldUnlock = totalSessions >= achievement.threshold;
          break;
        case 'earnings':
          shouldUnlock = totalEarnings >= achievement.threshold;
          break;
        case 'time':
          shouldUnlock = totalTime >= achievement.threshold;
          break;
      }

      if (shouldUnlock) {
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
  }
};