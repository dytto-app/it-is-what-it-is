import React, { useState } from 'react';
import { User, Settings, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
  onExportData: () => void;
  onClearData: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  user, 
  onUpdateUser, 
  onExportData, 
  onClearData 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.nickname || '');
  const [hourlyWage, setHourlyWage] = useState(user.hourlyWage.toString());
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user.showOnLeaderboard);

  const handleSave = () => {
    const wage = parseFloat(hourlyWage);
    if (isNaN(wage) || wage <= 0) {
      alert('Please enter a valid hourly wage');
      return;
    }

    onUpdateUser({
      ...user,
      nickname: nickname.trim() || undefined,
      hourlyWage: wage,
      showOnLeaderboard
    });
    setIsEditing(false);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      onClearData();
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* Profile header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 mb-4">
          <User className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {user.nickname || 'Anonymous User'}
        </h2>
        <p className="text-gray-400 text-sm font-mono">
          ID: {user.id.slice(0, 8)}...
        </p>
      </div>

      {/* Profile settings */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-3 py-2 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nickname (Optional)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter a nickname"
                className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 transition-all duration-200"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-900/50 rounded-xl border border-gray-700/50 text-white">
                {user.nickname || 'Not set'}
              </div>
            )}
          </div>

          {/* Hourly wage */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hourly Wage
            </label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-900/50 rounded-xl border border-gray-700/50 text-white">
                ${user.hourlyWage.toFixed(2)} per hour
              </div>
            )}
          </div>

          {/* Leaderboard visibility */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-300">Show on Leaderboard</span>
                <p className="text-xs text-gray-500 mt-1">
                  Allow your stats to appear on the global leaderboard
                </p>
              </div>
              {isEditing ? (
                <button
                  onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                    showOnLeaderboard ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-200 ${
                    showOnLeaderboard ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              ) : (
                <div className="flex items-center text-gray-400">
                  {showOnLeaderboard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
              )}
            </label>
          </div>

          {/* Save button */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Data management */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        
        <div className="space-y-3">
          <button
            onClick={onExportData}
            className="w-full flex items-center justify-center px-4 py-3 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </button>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Data
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Account created: {user.createdAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};