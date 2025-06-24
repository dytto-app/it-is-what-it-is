export interface User {
  id: string;
  nickname?: string;
  hourlyWage: number;
  createdAt: Date;
  showOnLeaderboard: boolean;
}

export interface Session {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  earnings: number;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  type: 'sessions' | 'earnings' | 'time';
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  nickname: string;
  totalEarnings: number;
  totalTime: number;
  sessionCount: number;
}

export interface Analytics {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  averageSession: number;
  totalSessions: number;
  topHour: number;
}