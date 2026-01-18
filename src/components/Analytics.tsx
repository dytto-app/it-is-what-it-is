import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, DollarSign, Target, BarChart3, Sparkles } from 'lucide-react';
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

      {/* Insights section */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-6">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Most productive hour</span>
              <span className="text-indigo-400 font-semibold">
                {analytics.topHour}:00
              </span>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Monthly total</span>
              <span className="text-emerald-400 font-semibold">
                {CalculationUtils.formatCurrency(analytics.monthlyTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
