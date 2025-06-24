import React, { useState, useEffect } from 'react';
import { Play, Square, DollarSign, Clock } from 'lucide-react';
import { Session, User } from '../types';
import { CalculationUtils } from '../utils/calculations';

interface SessionTrackerProps {
  user: User;
  activeSession: Session | null;
  onSessionStart: () => void;
  onSessionEnd: () => void;
  currentEarnings: number;
  currentDuration: number;
}

export const SessionTracker: React.FC<SessionTrackerProps> = ({
  user,
  activeSession,
  onSessionStart,
  onSessionEnd,
  currentEarnings,
  currentDuration
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (activeSession) {
      setAnimate(true);
      const interval = setInterval(() => setAnimate(a => !a), 2000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl transition-all duration-3000 ${animate ? 'scale-150 opacity-20' : 'scale-100 opacity-10'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl transition-all duration-2000 ${animate ? 'scale-125 opacity-15' : 'scale-100 opacity-5'}`} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto text-center">
        {/* Status indicator */}
        <div className="mb-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
            activeSession 
              ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300' 
              : 'bg-gray-500/10 border-gray-400/20 text-gray-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 transition-all duration-300 ${
              activeSession ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
            }`} />
            {activeSession ? 'Session Active' : 'Ready to Start'}
          </div>
        </div>

        {/* Main action button */}
        <div className="mb-8">
          <button
            onClick={activeSession ? onSessionEnd : onSessionStart}
            className={`group relative w-40 h-40 rounded-full backdrop-blur-md border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              activeSession
                ? 'bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/20 shadow-lg shadow-red-500/10'
                : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
            {activeSession ? (
              <Square className="w-16 h-16 mx-auto" />
            ) : (
              <Play className="w-16 h-16 mx-auto ml-2" />
            )}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
          </button>
        </div>

        {/* Live stats */}
        {activeSession && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6 text-emerald-400 mr-2" />
                <span className="text-gray-300 font-medium">Current Earnings</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {CalculationUtils.formatCurrency(currentEarnings)}
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-emerald-400 mr-2" />
                <span className="text-gray-300 font-medium">Session Time</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {CalculationUtils.formatDuration(currentDuration)}
              </div>
            </div>
          </div>
        )}

        {/* Hourly rate display */}
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-gray-800/30">
          <div className="text-sm text-gray-400 mb-1">Your Hourly Rate</div>
          <div className="text-xl font-semibold text-white">
            {CalculationUtils.formatCurrency(user.hourlyWage)}/hour
          </div>
        </div>
      </div>
    </div>
  );
};