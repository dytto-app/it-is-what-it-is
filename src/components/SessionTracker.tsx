import React, { useState, useEffect } from 'react';
import { Play, Square, DollarSign, Clock, Sparkles } from 'lucide-react';
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
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (activeSession) {
      setAnimate(true);
      const interval = setInterval(() => setAnimate(a => !a), 3000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    if (activeSession) {
      onSessionEnd();
    } else {
      onSessionStart();
    }
  };

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center py-8">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl transition-all duration-4000 ${animate ? 'scale-150 opacity-30' : 'scale-100 opacity-15'}`} />
        <div className={`absolute bottom-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl transition-all duration-3000 ${animate ? 'scale-125 opacity-25' : 'scale-100 opacity-10'}`} />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl transition-all duration-5000 ${animate ? 'scale-110 opacity-20' : 'scale-100 opacity-5'}`} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto text-center">
        {/* Enhanced status indicator */}
        <div className="mb-8">
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-lg border-2 transition-all duration-500 shadow-lg ${
            activeSession 
              ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/40 text-emerald-300 shadow-emerald-500/20' 
              : 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-slate-400/40 text-slate-300 shadow-slate-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-3 transition-all duration-500 ${
              activeSession ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-slate-400'
            }`} />
            {activeSession ? 'Session Strong' : 'Ready'}
            {activeSession && <Sparkles className="w-4 h-4 ml-2 animate-pulse" />}
          </div>
        </div>

        {/* Incredible main action button */}
        <div className="mb-8 relative">
          <button
            onClick={handleButtonClick}
            className={`group relative w-48 h-48 rounded-full backdrop-blur-xl border-4 transition-all duration-500 transform hover:scale-110 active:scale-95 overflow-hidden ${
              activeSession
                ? 'bg-gradient-to-br from-red-500/20 via-pink-500/20 to-red-600/20 border-red-400/50 text-red-300 hover:from-red-500/30 hover:via-pink-500/30 hover:to-red-600/30 shadow-2xl shadow-red-500/25'
                : 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-600/20 border-indigo-400/50 text-indigo-300 hover:from-indigo-500/30 hover:via-purple-500/30 hover:to-blue-600/30 shadow-2xl shadow-indigo-500/25'
            }`}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Ripple effects */}
            {ripples.map(ripple => (
              <div
                key={ripple.id}
                className="absolute rounded-full bg-white/30 animate-ping"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
              />
            ))}

            {/* Icon with enhanced animations */}
            <div className="relative z-10 flex items-center justify-center h-full">
              {activeSession ? (
                <Square className="w-20 h-20 transition-all duration-300 group-hover:scale-110 drop-shadow-lg" />
              ) : (
                <Play className="w-20 h-20 ml-2 transition-all duration-300 group-hover:scale-110 drop-shadow-lg" />
              )}
            </div>

            {/* Rotating border effect */}
            <div className={`absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r ${
              activeSession 
                ? 'from-red-400/50 via-pink-400/50 to-red-400/50' 
                : 'from-indigo-400/50 via-purple-400/50 to-indigo-400/50'
            } bg-clip-border animate-spin`} style={{ animationDuration: '3s' }} />
            
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
          </button>

          {/* Floating particles around button */}
          {activeSession && (
            <>
              <div className="absolute -top-4 -left-4 w-2 h-2 bg-emerald-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }} />
              <div className="absolute -top-2 -right-6 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-4 -right-4 w-2 h-2 bg-emerald-300 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s' }} />
              <div className="absolute -bottom-2 -left-6 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-30" style={{ animationDelay: '1.5s' }} />
            </>
          )}
        </div>

        {/* Enhanced live stats */}
        {activeSession && (
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-xl mr-3">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-slate-300 font-semibold">Payload</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                {CalculationUtils.formatCurrency(currentEarnings)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
              <div className="flex items-center justify-center mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl mr-3">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-slate-300 font-semibold">Time</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                {CalculationUtils.formatDuration(Math.max(0, currentDuration))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced hourly rate display */}
        <div className="bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-500/20 shadow-lg">
          <div className="text-sm text-slate-400 mb-2 font-medium">Rate</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">
            {CalculationUtils.formatCurrency(user.hourlyWage)}/hour
          </div>
        </div>
      </div>
    </div>
  );
};
