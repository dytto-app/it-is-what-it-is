import React from 'react';
import { BarChart3, History, Trophy, User, Timer, Users } from 'lucide-react';

type TabType = 'tracker' | 'analytics' | 'history' | 'achievements' | 'leaderboard' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'analytics' as TabType, icon: BarChart3, label: 'Stats' },
    { id: 'history' as TabType, icon: History, label: 'History' },
    { id: 'tracker' as TabType, icon: Timer, label: 'Track' },
    { id: 'achievements' as TabType, icon: Trophy, label: 'Awards' },
    { id: 'leaderboard' as TabType, icon: Users, label: 'Board' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto">
      {/* Mobile Navigation */}
      <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-slate-700/50 h-20">
        <div className="h-full flex items-center justify-around px-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center w-16 h-16 transition-colors duration-200 ${
                activeTab === id
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">
                {label}
              </span>
              {activeTab === id && (
                <div className="absolute bottom-0 w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="bg-gradient-to-r from-black/80 to-black/70 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="flex items-center justify-center p-2">
            {tabs.map(({ id, icon: Icon, label }) => (
              <div key={id} className="flex-1 max-w-[120px]">
                <button
                  onClick={() => onTabChange(id)}
                  className={`w-full flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 shadow-lg border border-indigo-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="truncate">{label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
