import React, { useState, useMemo } from 'react';
import { Download, Calendar, Clock, DollarSign, History, Sparkles, TrendingUp, Filter, Search, Zap, Target } from 'lucide-react';
import { Session } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface SessionHistoryProps {
  sessions: Session[];
  onExport: () => void;
}

type SortOption = 'date' | 'duration' | 'earnings' | 'efficiency';
type FilterOption = 'all' | 'today' | 'week' | 'month';

export const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onExport }) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [searchTerm, setSearchTerm] = useState('');

  const filterSessions = (sessions: Session[], filter: FilterOption): Session[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filter) {
      case 'today':
        return sessions.filter(s => s.startTime >= today);
      case 'week':
        return sessions.filter(s => s.startTime >= weekStart);
      case 'month':
        return sessions.filter(s => s.startTime >= monthStart);
      default:
        return sessions;
    }
  };

  const sortSessions = (sessions: Session[], sortBy: SortOption): Session[] => {
    return [...sessions].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.startTime.getTime() - a.startTime.getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'earnings':
          return b.earnings - a.earnings;
        case 'efficiency':
          const efficiencyA = a.duration > 0 ? a.earnings / (a.duration / 3600) : 0;
          const efficiencyB = b.duration > 0 ? b.earnings / (b.duration / 3600) : 0;
          return efficiencyB - efficiencyA;
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedSessions = useMemo(() => {
    let result = filterSessions(sessions, filter);
    
    if (searchTerm) {
      result = result.filter(session => {
        const dateString = session.startTime.toLocaleDateString();
        const timeString = session.startTime.toLocaleTimeString();
        return dateString.includes(searchTerm) || timeString.includes(searchTerm);
      });
    }
    
    return sortSessions(result, sortBy);
  }, [sessions, filter, sortBy, searchTerm]);

  const stats = useMemo(() => {
    const totalEarnings = filteredAndSortedSessions.reduce((sum, s) => sum + s.earnings, 0);
    const totalTime = filteredAndSortedSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgEarnings = filteredAndSortedSessions.length > 0 ? totalEarnings / filteredAndSortedSessions.length : 0;
    const avgDuration = filteredAndSortedSessions.length > 0 ? totalTime / filteredAndSortedSessions.length : 0;
    const longestSession = Math.max(...filteredAndSortedSessions.map(s => s.duration), 0);
    const highestEarning = Math.max(...filteredAndSortedSessions.map(s => s.earnings), 0);
    
    return {
      totalEarnings,
      totalTime,
      avgEarnings,
      avgDuration,
      longestSession,
      highestEarning,
      count: filteredAndSortedSessions.length
    };
  }, [filteredAndSortedSessions]);

  // Prepare data for recent sessions display
  const recentSessions = filteredAndSortedSessions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-3xl border-2 border-emerald-400/50 mb-6 shadow-xl shadow-emerald-500/20">
            <History className="w-10 h-10 text-emerald-400 drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            History
          </h2>
          {/* <p className="text-slate-300 text-lg">
            Spotless record of your productivity
          </p> */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-sm font-medium">Live Analytics</span>
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
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
            <span className="text-slate-300 font-semibold">Total</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            {CalculationUtils.formatCurrency(stats.totalEarnings)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/30 shadow-xl shadow-blue-500/10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl mr-3">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-slate-300 font-semibold">Time</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            {CalculationUtils.formatDuration(stats.totalTime)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-400/30 shadow-xl shadow-purple-500/10">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-500/20 rounded-xl mr-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-slate-300 font-semibold">Endurance</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            {CalculationUtils.formatDuration(Math.round(stats.avgDuration))}
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
            {stats.count}
          </div>
        </div>
      </div>

      {/* Insights section */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-6">
          Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Longest</span>
              <span className="text-blue-400 font-semibold">
                {CalculationUtils.formatDuration(stats.longestSession)}
              </span>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Biggest</span>
              <span className="text-emerald-400 font-semibold">
                {CalculationUtils.formatCurrency(stats.highestEarning)}
              </span>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Wage</span>
              <span className="text-purple-400 font-semibold">
                {CalculationUtils.formatCurrency(stats.avgEarnings)}
              </span>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Rate</span>
              <span className="text-yellow-400 font-semibold">
                {stats.totalTime > 0 ? `$${(stats.totalEarnings / (stats.totalTime / 3600)).toFixed(1)}/hr` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="space-y-6">
        {/* Filter and Search */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-xl mr-3">
              <Filter className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Filter & Search
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-500/20 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400/50 transition-all duration-300"
              />
            </div>

            {/* Filter buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as FilterOption)}
                  className={`flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    filter === key
                      ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-400/40 shadow-lg shadow-emerald-500/20'
                      : 'bg-black/30 text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'date', label: 'Date', icon: Calendar },
                { key: 'duration', label: 'Duration', icon: Clock },
                { key: 'earnings', label: 'Earnings', icon: DollarSign },
                { key: 'efficiency', label: 'Efficiency', icon: Zap }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as SortOption)}
                  className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ${
                    sortBy === key
                      ? 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-teal-300 border border-teal-400/40'
                      : 'bg-black/30 text-slate-300 hover:text-white hover:bg-slate-700/50 border border-slate-600/30'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 shadow-lg shadow-emerald-500/10 font-semibold"
        >
          <Download className="w-5 h-5 mr-3" />
          Export Session Data
          <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
        </button>
      </div>

      {/* Recent Sessions */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-xl mr-3">
            <History className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Recent Sessions
          </h3>
        </div>
        
        {recentSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-6" />
            <p className="text-slate-400 text-lg mb-2">No sessions found</p>
            <p className="text-slate-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No sessions found for the selected time period'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session, index) => {
              const efficiency = session.duration > 0 ? session.earnings / (session.duration / 3600) : 0;
              const isTopPerformer = index < 3;

              return (
                <div
                  key={session.id}
                  className={`bg-gradient-to-br backdrop-blur-xl rounded-2xl p-4 md:p-6 border transition-all duration-500 ${
                    isTopPerformer
                      ? 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30 shadow-lg shadow-emerald-500/10'
                      : 'from-black/40 to-black/30 border-slate-600/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${
                        isTopPerformer ? 'bg-emerald-500/20' : 'bg-slate-500/20'
                      }`}>
                        <Calendar className={`w-4 h-4 ${
                          isTopPerformer ? 'text-emerald-400' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-slate-300 font-semibold text-xs md:text-sm">
                        {session.startTime.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {isTopPerformer && (
                      <div className="text-xs text-emerald-400 font-bold">
                        #{index + 1}
                      </div>
                    )}
                  </div>

                  {/* Main earnings */}
                  <div className={`text-lg md:text-xl font-bold mb-3 ${
                    isTopPerformer
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent'
                      : 'text-slate-200'
                  }`}>
                    {CalculationUtils.formatCurrency(session.earnings)}
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-blue-400 font-semibold">
                        {CalculationUtils.formatDuration(session.duration)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-slate-400">Time</span>
                      <span className="text-slate-300">
                        {session.startTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-slate-400">Rate</span>
                      <span className="text-yellow-400 font-semibold">
                        ${efficiency.toFixed(1)}/hr
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
