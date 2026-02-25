export interface User {
  id: string;
  nickname?: string;
  hourlyWage: number;
  createdAt: Date;
  showOnLeaderboard: boolean;
  salary: number;
  salaryPeriod: 'hourly' | 'weekly' | 'monthly' | 'annually';
  onboarded: boolean;
  recoveryEmail?: string;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: Date;
  streakFreezes: number;
  /** Optional daily earnings goal in cents (e.g. 200 = $2.00). Null = no goal set. */
  dailyGoalCents?: number | null;
  /** Unique referral code for sharing (auto-generated, uppercase alphanum) */
  referralCode?: string | null;
  /** Number of successful referrals this user has made */
  referralCount?: number;
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
  type: 'sessions' | 'earnings' | 'time' | 'streak' | 'special';
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  nickname: string;
  totalEarnings: number;
  totalTime: number;
  sessionCount: number;
  equippedCosmetics?: {
    frame: string | null;
    badge: string | null;
    title: string | null;
  };
}

export interface Analytics {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  averageSession: number;
  totalSessions: number;
  topHour: number;
}

export interface Insight {
  emoji: string;
  text: string;
  category: 'timing' | 'earnings' | 'consistency' | 'milestone';
}