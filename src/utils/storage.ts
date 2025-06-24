import { User, Session, Achievement } from '../types';

const STORAGE_KEYS = {
  USER: 'ptp_user',
  SESSIONS: 'ptp_sessions',
  ACHIEVEMENTS: 'ptp_achievements',
  ACTIVE_SESSION: 'ptp_active_session'
};

export const StorageUtils = {
  // User management
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    const user = JSON.parse(data);
    return {
      ...user,
      createdAt: new Date(user.createdAt)
    };
  },

  saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Session management
  getSessions(): Session[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    return JSON.parse(data).map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null
    }));
  },

  saveSessions(sessions: Session[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getActiveSession(): Session | null {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!data) return null;
    const session = JSON.parse(data);
    return {
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null
    };
  },

  saveActiveSession(session: Session | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  },

  // Achievement management
  getAchievements(): Achievement[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!data) return [];
    return JSON.parse(data).map((achievement: any) => ({
      ...achievement,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
    }));
  },

  saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  // Data export
  exportData(): string {
    const user = this.getUser();
    const sessions = this.getSessions();
    const achievements = this.getAchievements();
    
    return JSON.stringify({
      user,
      sessions,
      achievements,
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  // Data deletion
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};