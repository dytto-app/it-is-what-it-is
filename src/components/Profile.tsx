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
  const [salary, setSalary] = useState(user.salary.toString());
  const [salaryPeriod, setSalaryPeriod] = useState(user.salaryPeriod);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user.showOnLeaderboard);

  const calculateHourlyRate = (salaryAmount: number, freq: string): number => {
    switch (freq) {
      case 'hourly':
        return salaryAmount;
      case 'weekly':
        return salaryAmount / 40;
      case 'monthly':
        return salaryAmount / (40 * 4.33);
      case 'annually':
        return salaryAmount / (40 * 52);
      default:
        return 0;
    }
  };

  const handleSave = () => {
    const salaryAmount = parseFloat(salary);
    if (isNaN(salaryAmount) || salaryAmount <= 0) {
      alert('Please enter a valid salary amount');
      return;
    }

    const calculatedHourlyWage = calculateHourlyRate(salaryAmount, salaryPeriod);

    onUpdateUser({
      ...user,
      nickname: nickname.trim() || undefined,
      salary: salaryAmount,
      salaryPeriod: salaryPeriod as 'hourly' | 'weekly' | 'monthly' | 'annually',
      hourlyWage: calculatedHourlyWage,
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
    <div className="space-y-6">
      {/* Enhanced Profile header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/20 shadow-2xl">
          {/* Profile Avatar */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-blue-500/30 rounded-3xl border-2 border-indigo-400/50 shadow-xl shadow-indigo-500/20 flex items-center justify-center backdrop-blur-lg">
              <User className="w-12 h-12 text-indigo-300 drop-shadow-lg" />
            </div>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-indigo-400/30 animate-pulse" />
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {user.nickname || 'Anonymous User'}
          </h2>
          <div className="inline-flex items-center px-4 py-2 bg-black/30 backdrop-blur-lg rounded-full border border-slate-600/30 shadow-lg">
            <span className="text-slate-300 text-sm font-mono">
              ID: {user.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Profile settings */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">
            Profile Settings
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center px-4 py-2 backdrop-blur-lg rounded-xl border transition-all duration-300 shadow-lg ${
              isEditing 
                ? 'bg-red-500/20 border-red-400/40 text-red-300 hover:bg-red-500/30' 
                : 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/30'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Nickname (Optional)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter a nickname"
                className="w-full px-4 py-4 bg-black/50 backdrop-blur-lg rounded-2xl border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 shadow-lg"
              />
            ) : (
              <div className="px-4 py-4 bg-black/30 backdrop-blur-lg rounded-2xl border border-slate-600/30 text-white shadow-lg">
                {user.nickname || 'Not set'}
              </div>
            )}
          </div>

          {/* Base Salary */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Amount
            </label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">$</span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  step="0.01"
                  min="0.01"
                  className="w-full pl-8 pr-4 py-4 bg-black/50 backdrop-blur-lg rounded-2xl border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 shadow-lg"
                />
              </div>
            ) : (
              <div className="px-4 py-4 bg-black/30 backdrop-blur-lg rounded-2xl border border-slate-600/30 text-white shadow-lg">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ${user.salary.toFixed(2)}
                </span>
                <span className="text-slate-400 ml-2"></span>
              </div>
            )}
          </div>

          {/* Salary Period */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Time
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'annually', label: 'Annual' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSalaryPeriod(value as any)}
                    className={`py-2 px-3 rounded-lg border-2 transition-all duration-300 font-semibold ${
                      salaryPeriod === value
                        ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-purple-500/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 bg-black/30 backdrop-blur-lg rounded-2xl border border-slate-600/30 text-slate-300 capitalize">
                {user.salaryPeriod}
              </div>
            )}
          </div>

          {/* Calculated Hourly Rate */}
          {isEditing && salary && (
            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 text-sm font-medium">
                Calculated Hourly Rate: ${(calculateHourlyRate(parseFloat(salary), salaryPeriod) || 0).toFixed(2)}/hr
              </p>
            </div>
          )}

          {/* Leaderboard visibility */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30 shadow-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-300">Show on Leaderboard</span>
                <p className="text-xs text-slate-500 mt-1">
                  Allow your stats to appear on the global leaderboard
                </p>
              </div>
              {isEditing ? (
                <button
                  onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-lg ${
                    showOnLeaderboard 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30' 
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 shadow-slate-500/30'
                  }`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${
                    showOnLeaderboard ? 'left-7' : 'left-0.5'
                  }`} />
                </button>
              ) : (
                <div className="flex items-center text-slate-400">
                  {showOnLeaderboard ? (
                    <div className="flex items-center text-emerald-400">
                      <Eye className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Visible</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-slate-500">
                      <EyeOff className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Hidden</span>
                    </div>
                  )}
                </div>
              )}
            </label>
          </div>

          {/* Save button */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-lg rounded-2xl border border-indigo-400/40 text-indigo-300 hover:from-indigo-500/40 hover:to-purple-500/40 transition-all duration-300 shadow-xl shadow-indigo-500/20 font-semibold"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Data management */}
      <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-500/20 shadow-xl">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-6">
          Data Management
        </h3>
        
        <div className="space-y-4">
          <button
            onClick={onExportData}
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-lg rounded-2xl border border-emerald-400/40 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 transition-all duration-300 shadow-xl shadow-emerald-500/20 font-semibold"
          >
            <Download className="w-5 h-5 mr-3" />
            Export All Data
          </button>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-red-400/40 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-xl shadow-red-500/20 font-semibold"
          >
            <Trash2 className="w-5 h-5 mr-3" />
            Delete All Data
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-600/30">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">Account created</p>
            <p className="text-sm text-slate-400 font-medium">
              {user.createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
