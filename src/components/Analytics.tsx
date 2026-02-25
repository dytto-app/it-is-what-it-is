import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, DollarSign, Target, BarChart3, Sparkles, Lightbulb, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Session } from '../types';
import { CalculationUtils } from '../utils/calculations';

// ── Monthly Earnings Heatmap ──────────────────────────────────────────────────

interface MonthlyCalendarProps {
  sessions: Session[];
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ sessions }) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [hovered, setHovered] = useState<string | null>(null); // 'YYYY-MM-DD'

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    // Don't go past current month
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // Build day→earnings map for this month
  const dayMap = useMemo(() => {
    const map: Record<string, { earnings: number; count: number }> = {};
    for (const s of sessions) {
      const d = s.startTime instanceof Date ? s.startTime : new Date(s.startTime);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const key = `${viewYear}-${viewMonth + 1}-${d.getDate()}`;
        if (!map[key]) map[key] = { earnings: 0, count: 0 };
        map[key].earnings += s.earnings;
        map[key].count++;
      }
    }
    return map;
  }, [sessions, viewYear, viewMonth]);

  // Compute quintile thresholds from non-zero days
  const earnValues = Object.values(dayMap).map(v => v.earnings).filter(v => v > 0).sort((a, b) => a - b);
  const q = (p: number) => earnValues[Math.floor(earnValues.length * p)] ?? 0;
  const thresholds = [q(0.25), q(0.5), q(0.75), Infinity];

  const getColor = (earnings: number) => {
    if (earnings <= 0) return 'bg-slate-800/60 border-slate-700/30';
    if (earnings <= thresholds[0]) return 'bg-emerald-900/60 border-emerald-700/40';
    if (earnings <= thresholds[1]) return 'bg-emerald-700/60 border-emerald-600/50';
    if (earnings <= thresholds[2]) return 'bg-emerald-500/60 border-emerald-400/60';
    return 'bg-emerald-400/80 border-emerald-300/70';
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(totalCells - firstDay - daysInMonth).fill(null),
  ];

  const monthTotal = Object.values(dayMap).reduce((s, v) => s + v.earnings, 0);

  return (
    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/15 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          {monthTotal > 0 && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
              {CalculationUtils.formatCurrency(monthTotal)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-all disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-500 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const key = `${viewYear}-${viewMonth + 1}-${day}`;
          const data = dayMap[key];
          const isToday = isCurrentMonth && day === now.getDate();
          const isHovered = hovered === key;

          return (
            <div
              key={key}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              className={`relative aspect-square rounded-lg border transition-all duration-150 cursor-default flex flex-col items-center justify-center gap-0.5 ${
                getColor(data?.earnings ?? 0)
              } ${isToday ? 'ring-1 ring-indigo-400/60' : ''} ${isHovered && data ? 'scale-110 z-10' : ''}`}
            >
              <span className={`text-[10px] font-semibold leading-none ${
                isToday ? 'text-indigo-300' : data ? 'text-emerald-200' : 'text-slate-600'
              }`}>
                {day}
              </span>
              {data && (
                <span className="text-[8px] font-bold text-emerald-300 leading-none">
                  ${data.earnings.toFixed(0)}
                </span>
              )}

              {/* Tooltip on hover */}
              {isHovered && data && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="bg-black/90 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl">
                    <div className="font-bold text-emerald-300">{CalculationUtils.formatCurrency(data.earnings)}</div>
                    <div className="text-slate-400">{data.count} session{data.count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-slate-600">less</span>
        {['bg-slate-800/60','bg-emerald-900/60','bg-emerald-700/60','bg-emerald-500/60','bg-emerald-400/80'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-slate-600">more</span>
      </div>
    </div>
  );
};

interface AnalyticsProps {
  sessions: Session[];
  currentStreak?: number;
  longestStreak?: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions, currentStreak = 0, longestStreak = 0 }) => {
  const analytics = CalculationUtils.generateAnalytics(sessions);
  const insights = useMemo(
    () => CalculationUtils.generateInsights(sessions, currentStreak, longestStreak),
    [sessions, currentStreak, longestStreak]
  );

  // Prepare hourly data for the chart
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const sessionsAtHour = sessions.filter(s => s.startTime.getHours() === hour);
    return {
      hour: hour.toString().padStart(2, '0') + ':00',
      sessions: sessionsAtHour.length,
      earnings: sessionsAtHour.reduce((sum, s) => sum + s.earnings, 0)
    };
  });

  // Weekly breakdown
  const weeklyData = Array.from({ length: 7 }, (_, day) => {
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
    const sessionsOnDay = sessions.filter(s => s.startTime.getDay() === day);
    return {
      day: dayName,
      sessions: sessionsOnDay.length,
      earnings: sessionsOnDay.reduce((sum, s) => sum + s.earnings, 0)
    };
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-3xl border-2 border-blue-400/50 mb-6 shadow-xl shadow-blue-500/20">
            <BarChart3 className="w-10 h-10 text-blue-400 drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Analytics
          </h2>
          {/* <p className="text-slate-300 text-lg">
            What is it all for
          </p> */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">Data</span>
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Enhanced Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-3xl p-6 border border-emerald-400/30 shadow-xl shadow-emerald-500/10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-xl mr-3">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-slate-300 font-semibold">Today</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            {CalculationUtils.formatCurrency(analytics.dailyTotal)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/30 shadow-xl shadow-blue-500/10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl mr-3">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-slate-300 font-semibold">Week</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            {CalculationUtils.formatCurrency(analytics.weeklyTotal)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-400/30 shadow-xl shadow-purple-500/10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-500/20 rounded-xl mr-3">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-slate-300 font-semibold">Endurance</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            {CalculationUtils.formatDuration(Math.round(analytics.averageSession))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-6 border border-orange-400/30 shadow-xl shadow-orange-500/10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-500/20 rounded-xl mr-3">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-slate-300 font-semibold">Runs</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-300 bg-clip-text text-transparent">
            {analytics.totalSessions}
          </div>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="space-y-6">
        {/* Hourly activity */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-500/20 rounded-xl mr-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Activity by Hour
            </h3>
          </div>
          <div className="h-80 bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="sessions" 
                  fill="#60a5fa"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly breakdown */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl mr-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Weekly Pattern
            </h3>
          </div>
          <div className="h-80 bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="earnings" 
                  fill="#a855f7"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Heatmap */}
      <MonthlyCalendar sessions={sessions} />

      {/* Smart Insights section */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-yellow-500/20 rounded-xl mr-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
            Your Patterns
          </h3>
        </div>

        {insights.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            Track a few more sessions to unlock personal insights ✨
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{insight.emoji}</span>
                  <span className="text-slate-200 text-sm font-medium leading-snug">{insight.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
