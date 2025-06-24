import React, { useState } from 'react';
import { Download, Calendar, Clock, DollarSign } from 'lucide-react';
import { Session } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface SessionHistoryProps {
  sessions: Session[];
  onExport: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onExport }) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filterSessions = (sessions: Session[], filter: string): Session[] => {
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

  const filteredSessions = filterSessions(sessions, filter).sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  );

  const totalEarnings = filteredSessions.reduce((sum, s) => sum + s.earnings, 0);
  const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Session History</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <span className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {CalculationUtils.formatCurrency(totalEarnings)}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {CalculationUtils.formatDuration(totalTime)}
          </span>
          <span>{filteredSessions.length} sessions</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Filter buttons */}
        <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-1 border border-gray-800/50">
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                filter === key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={onExport}
          className="flex items-center justify-center px-4 py-3 bg-black/40 backdrop-blur-md rounded-xl border border-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Sessions list */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No sessions found for this period</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50 hover:bg-gray-800/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {session.startTime.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {session.startTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {session.endTime && ` - ${session.endTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs text-gray-400">Duration</div>
                    <div className="font-medium text-white text-sm">
                      {CalculationUtils.formatDuration(session.duration)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Earned</div>
                    <div className="font-medium text-emerald-400 text-sm">
                      {CalculationUtils.formatCurrency(session.earnings)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};