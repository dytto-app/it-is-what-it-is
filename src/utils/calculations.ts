import { Session, Analytics } from '../types';

export const CalculationUtils = {
  calculateEarnings(hourlyWage: number, durationInSeconds: number): number {
    // Ensure non-negative values
    const safeDuration = Math.max(0, durationInSeconds);
    const safeWage = Math.max(0, hourlyWage);
    return (safeWage * safeDuration) / 3600;
  },

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  },

  formatDuration(seconds: number): string {
    // Ensure non-negative values
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  generateAnalytics(sessions: Session[]): Analytics {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart.getTime() - (dayStart.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailySessions = sessions.filter(s => s.startTime >= dayStart);
    const weeklySessions = sessions.filter(s => s.startTime >= weekStart);
    const monthlySessions = sessions.filter(s => s.startTime >= monthStart);

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSession = sessions.length > 0 ? totalDuration / sessions.length : 0;

    // Calculate top hour
    const hourCounts = new Array(24).fill(0);
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      hourCounts[hour]++;
    });
    const topHour = hourCounts.indexOf(Math.max(...hourCounts));

    return {
      dailyTotal: dailySessions.reduce((sum, s) => sum + s.earnings, 0),
      weeklyTotal: weeklySessions.reduce((sum, s) => sum + s.earnings, 0),
      monthlyTotal: monthlySessions.reduce((sum, s) => sum + s.earnings, 0),
      averageSession,
      totalSessions: sessions.length,
      topHour
    };
  }
};
