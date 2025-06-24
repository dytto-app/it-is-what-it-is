import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, DollarSign, Target } from 'lucide-react';
import { Session } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface AnalyticsProps {
  sessions: Session[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions }) => {
  const analytics = CalculationUtils.generateAnalytics(sessions);

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
    <div className="space-y-6 px-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="ml-2 text-sm text-gray-300">Today</span>
          </div>
          <div className="text-xl font-bold text-white">
            {CalculationUtils.formatCurrency(analytics.dailyTotal)}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="ml-2 text-sm text-gray-300">This Week</span>
          </div>
          <div className="text-xl font-bold text-white">
            {CalculationUtils.formatCurrency(analytics.weeklyTotal)}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="ml-2 text-sm text-gray-300">Avg Session</span>
          </div>
          <div className="text-xl font-bold text-white">
            {CalculationUtils.formatDuration(Math.round(analytics.averageSession))}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="ml-2 text-sm text-gray-300">Total Sessions</span>
          </div>
          <div className="text-xl font-bold text-white">
            {analytics.totalSessions}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Hourly activity */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">Activity by Hour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="sessions" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly breakdown */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Pattern</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="earnings" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};