import React from 'react';
import { BarChart3, History, Trophy, User, Timer, Users } from 'lucide-react';

type TabType = 'tracker' | 'analytics' | 'history' | 'achievements' | 'leaderboard' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'tracker' as TabType, icon: Timer, label: 'Track' },
    { id: 'analytics' as TabType, icon: BarChart3, label: 'Stats' },
    { id: 'history' as TabType, icon: History, label: 'History' },
    { id: 'achievements' as TabType, icon: Trophy, label: 'Awards' },
    { id: 'leaderboard' as TabType, icon: Users, label: 'Board' },
    { id: 'profile' as TabType, icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto">
      <div className="bg-black/80 backdrop-blur-xl border-t border-gray-800/50 md:border md:rounded-2xl md:bg-black/40">
        <div className="flex justify-around md:justify-center md:gap-2 p-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-3 py-3 md:px-4 md:py-3 rounded-xl transition-all duration-200 min-w-0 ${
                activeTab === id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-lg shadow-emerald-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs md:text-sm md:ml-2 mt-1 md:mt-0 truncate">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};