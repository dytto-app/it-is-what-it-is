import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Calendar, PenLine, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Session } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface NotesJournalProps {
  sessions: Session[];
}

interface NoteEntry {
  session: Session;
  date: Date;
}

interface DayGroup {
  dateKey: string;
  displayDate: string;
  notes: NoteEntry[];
}

export const NotesJournal: React.FC<NotesJournalProps> = ({ sessions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Filter sessions that have notes
  const notesWithSessions = useMemo(() => {
    return sessions
      .filter(s => s.notes && s.notes.trim().length > 0)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [sessions]);

  // Apply search filter
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notesWithSessions;
    const term = searchTerm.toLowerCase();
    return notesWithSessions.filter(s => 
      s.notes?.toLowerCase().includes(term) ||
      s.startTime.toLocaleDateString().toLowerCase().includes(term)
    );
  }, [notesWithSessions, searchTerm]);

  // Group by day
  const groupedByDay = useMemo(() => {
    const groups: Map<string, DayGroup> = new Map();
    
    for (const session of filteredNotes) {
      const date = session.startTime;
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          dateKey,
          displayDate: date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
          }),
          notes: []
        });
      }
      
      groups.get(dateKey)!.notes.push({
        session,
        date
      });
    }
    
    return Array.from(groups.values());
  }, [filteredNotes]);

  const toggleDay = (dateKey: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  // Expand all days by default when there are few entries
  const isExpanded = (dateKey: string) => {
    if (groupedByDay.length <= 3) return true;
    return expandedDays.has(dateKey);
  };

  if (notesWithSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-3xl border border-violet-400/30 mb-6">
          <BookOpen className="w-10 h-10 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">No thoughts yet</h3>
        <p className="text-slate-400 max-w-sm mx-auto">
          Start jotting down ideas during your sessions. They'll appear here in your journal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-violet-500/20 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-3xl border-2 border-violet-400/50 mb-6 shadow-xl shadow-violet-500/20">
            <BookOpen className="w-10 h-10 text-violet-400 drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Thoughts from the Throne
          </h2>
          <p className="text-slate-300">
            {notesWithSessions.length} {notesWithSessions.length === 1 ? 'idea' : 'ideas'} captured
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search your thoughts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-violet-500/20 text-white placeholder-slate-400 focus:outline-none focus:border-violet-400/50 transition-all duration-300"
        />
      </div>

      {/* Journal entries */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No notes match your search</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDay.map((dayGroup) => (
            <div
              key={dayGroup.dateKey}
              className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl border border-violet-500/15 overflow-hidden"
            >
              {/* Day header */}
              <button
                onClick={() => toggleDay(dayGroup.dateKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-violet-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/20 rounded-xl">
                    <Calendar className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-slate-200 font-semibold">
                    {dayGroup.displayDate}
                  </span>
                  <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                    {dayGroup.notes.length} {dayGroup.notes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>
                {groupedByDay.length > 3 && (
                  isExpanded(dayGroup.dateKey) 
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Notes for this day */}
              {isExpanded(dayGroup.dateKey) && (
                <div className="border-t border-violet-500/10 px-4 pb-4 space-y-3">
                  {dayGroup.notes.map((entry) => (
                    <div
                      key={entry.session.id}
                      className="mt-3 bg-black/30 rounded-xl p-4 border border-slate-700/30"
                    >
                      {/* Note content */}
                      <div className="flex items-start gap-3 mb-3">
                        <PenLine className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
                        <p className="text-slate-200 leading-relaxed">
                          {entry.session.notes}
                        </p>
                      </div>

                      {/* Session context */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {entry.date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-emerald-400">
                            {CalculationUtils.formatCurrency(entry.session.earnings)}
                          </span>
                        </div>
                        <span className="text-slate-600">•</span>
                        <span>
                          {CalculationUtils.formatDuration(entry.session.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
