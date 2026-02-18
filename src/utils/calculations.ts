import { Session, Analytics, Insight } from '../types';

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
  },

  generateInsights(sessions: Session[], currentStreak: number, longestStreak: number): Insight[] {
    const completedSessions = sessions.filter(s => !s.isActive && s.duration > 0);
    if (completedSessions.length < 2) return [];

    const insights: Insight[] = [];
    const now = new Date();

    // --- Timing: peak hour ---
    const hourCounts = new Array(24).fill(0);
    completedSessions.forEach(s => hourCounts[s.startTime.getHours()]++);
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const hourLabel = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12} ${ampm}`;
    };
    insights.push({
      emoji: '⏰',
      text: `You most often break around ${hourLabel(peakHour)}`,
      category: 'timing',
    });

    // --- Best day of the week ---
    const dayCounts = new Array(7).fill(0);
    const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
    completedSessions.forEach(s => dayCounts[s.startTime.getDay()]++);
    const bestDay = dayCounts.indexOf(Math.max(...dayCounts));
    if (dayCounts[bestDay] > 1) {
      insights.push({
        emoji: '📅',
        text: `${dayNames[bestDay]} are your most active day`,
        category: 'timing',
      });
    }

    // --- Average session earnings ---
    const avgEarnings = completedSessions.reduce((s, x) => s + x.earnings, 0) / completedSessions.length;
    if (completedSessions.length >= 3) {
      insights.push({
        emoji: '💰',
        text: `Your sessions average ${CalculationUtils.formatCurrency(avgEarnings)} each`,
        category: 'earnings',
      });
    }

    // --- Monthly pace ---
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthSessions = completedSessions.filter(s => s.startTime >= monthStart);
    if (monthSessions.length >= 3 && dayOfMonth >= 5) {
      const monthTotal = monthSessions.reduce((s, x) => s + x.earnings, 0);
      const projectedMonthly = (monthTotal / dayOfMonth) * daysInMonth;
      insights.push({
        emoji: '📈',
        text: `You're on track to earn ${CalculationUtils.formatCurrency(projectedMonthly)} this month`,
        category: 'earnings',
      });
    }

    // --- Last 7 days consistency ---
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent7 = completedSessions.filter(s => s.startTime >= sevenDaysAgo);
    const recentDaySet = new Set(recent7.map(s => s.startTime.toDateString()));
    const activeDays = recentDaySet.size;
    if (activeDays > 0) {
      insights.push({
        emoji: '🗓️',
        text: `You've tracked on ${activeDays} of the last 7 days`,
        category: 'consistency',
      });
    }

    // --- Best week ever ---
    const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    weekStart.setHours(0, 0, 0, 0);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekSessions = completedSessions.filter(
      s => s.startTime >= prevWeekStart && s.startTime < weekStart
    );
    if (prevWeekSessions.length >= 2) {
      const prevWeekTotal = prevWeekSessions.reduce((s, x) => s + x.earnings, 0);
      // Check if it was the best week
      let weekBuckets: Record<string, number> = {};
      completedSessions.forEach(s => {
        const wk = new Date(s.startTime);
        wk.setDate(wk.getDate() - wk.getDay());
        wk.setHours(0, 0, 0, 0);
        const key = wk.toISOString();
        weekBuckets[key] = (weekBuckets[key] || 0) + s.earnings;
      });
      const weekTotals = Object.values(weekBuckets);
      const maxWeek = Math.max(...weekTotals);
      if (prevWeekTotal >= maxWeek * 0.95) {
        insights.push({
          emoji: '🏆',
          text: `Last week was your best ever: ${CalculationUtils.formatCurrency(prevWeekTotal)}`,
          category: 'milestone',
        });
      }
    }

    // --- Streak proximity ---
    if (longestStreak > 3 && currentStreak > 0 && currentStreak < longestStreak) {
      const daysAway = longestStreak - currentStreak;
      if (daysAway <= 3) {
        insights.push({
          emoji: '🔥',
          text: `${daysAway} more day${daysAway === 1 ? '' : 's'} to beat your record streak of ${longestStreak}!`,
          category: 'milestone',
        });
      }
    }

    // --- Weekday vs weekend split ---
    const weekdaySessions = completedSessions.filter(s => s.startTime.getDay() >= 1 && s.startTime.getDay() <= 5);
    const weekendSessions = completedSessions.filter(s => s.startTime.getDay() === 0 || s.startTime.getDay() === 6);
    if (weekdaySessions.length >= 5 && weekendSessions.length >= 2) {
      const wdAvg = weekdaySessions.reduce((s, x) => s + x.earnings, 0) / weekdaySessions.length;
      const weAvg = weekendSessions.reduce((s, x) => s + x.earnings, 0) / weekendSessions.length;
      if (wdAvg > weAvg * 1.1) {
        const pct = Math.round(((wdAvg - weAvg) / weAvg) * 100);
        insights.push({
          emoji: '💼',
          text: `Your weekday sessions earn ${pct}% more than weekends`,
          category: 'earnings',
        });
      }
    }

    // Rotate: pick up to 3 diverse insights (one per category if possible)
    const selected: Insight[] = [];
    const categories: Insight['category'][] = ['timing', 'earnings', 'consistency', 'milestone'];
    for (const cat of categories) {
      const match = insights.find(i => i.category === cat && !selected.includes(i));
      if (match) selected.push(match);
      if (selected.length === 3) break;
    }
    // Fill remaining slots if fewer than 3 categories present
    for (const i of insights) {
      if (selected.length >= 3) break;
      if (!selected.includes(i)) selected.push(i);
    }

    return selected;
  }
};
