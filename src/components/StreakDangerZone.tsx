import React, { useState, useEffect } from 'react';
import { AlertTriangle, Flame, Clock, Zap } from 'lucide-react';

interface StreakDangerZoneProps {
  currentStreak: number;
  hasSessionToday: boolean;
  onStartSession: () => void;
}

type UrgencyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical' | 'emergency';

interface UrgencyConfig {
  level: UrgencyLevel;
  icon: typeof AlertTriangle;
  message: string;
  subMessage: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconClass: string;
  pulseClass: string;
}

/**
 * StreakDangerZone - Escalating visual warning as midnight approaches
 * 
 * Inspired by OPENDEV's "event-driven system reminders" concept.
 * Shows progressively urgent warnings to protect user streaks.
 */
export const StreakDangerZone: React.FC<StreakDangerZoneProps> = ({
  currentStreak,
  hasSessionToday,
  onStartSession,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Don't show if no streak or already logged today
  if (currentStreak === 0 || hasSessionToday) {
    return null;
  }

  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const timeDecimal = hour + minute / 60;

  // Calculate urgency based on time of day
  const getUrgencyConfig = (): UrgencyConfig | null => {
    // Before 8 PM - no warning
    if (timeDecimal < 20) {
      return null;
    }

    // 11:30 PM - 11:59 PM: EMERGENCY (30 minutes left)
    if (timeDecimal >= 23.5) {
      const minutesLeft = Math.ceil((24 - timeDecimal) * 60);
      return {
        level: 'emergency',
        icon: Flame,
        message: `💀 ${minutesLeft} MINUTES LEFT!`,
        subMessage: `Your ${currentStreak}-day streak DIES at midnight`,
        bgClass: 'bg-gradient-to-r from-red-600/30 via-orange-600/30 to-red-600/30',
        borderClass: 'border-red-500/60',
        textClass: 'text-red-300',
        iconClass: 'text-red-400',
        pulseClass: 'animate-pulse',
      };
    }

    // 11:00 PM - 11:30 PM: CRITICAL (1 hour left)
    if (timeDecimal >= 23) {
      return {
        level: 'critical',
        icon: Flame,
        message: '🔥 DANGER ZONE: 1 hour left!',
        subMessage: `${currentStreak}-day streak needs one session NOW`,
        bgClass: 'bg-gradient-to-r from-red-500/25 via-orange-500/25 to-red-500/25',
        borderClass: 'border-red-400/50',
        textClass: 'text-red-300',
        iconClass: 'text-red-400',
        pulseClass: 'animate-pulse',
      };
    }

    // 10:00 PM - 11:00 PM: HIGH (2 hours left)
    if (timeDecimal >= 22) {
      return {
        level: 'high',
        icon: AlertTriangle,
        message: '⚠️ 2 hours left!',
        subMessage: `Keep your ${currentStreak}-day streak alive`,
        bgClass: 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20',
        borderClass: 'border-amber-400/40',
        textClass: 'text-amber-300',
        iconClass: 'text-amber-400',
        pulseClass: '',
      };
    }

    // 9:00 PM - 10:00 PM: MEDIUM (3 hours left)
    if (timeDecimal >= 21) {
      return {
        level: 'medium',
        icon: Clock,
        message: '3 hours to protect your streak',
        subMessage: `${currentStreak} days strong — don't break the chain`,
        bgClass: 'bg-gradient-to-r from-yellow-500/15 via-amber-500/15 to-yellow-500/15',
        borderClass: 'border-yellow-400/30',
        textClass: 'text-yellow-300',
        iconClass: 'text-yellow-400',
        pulseClass: '',
      };
    }

    // 8:00 PM - 9:00 PM: LOW (gentle reminder)
    return {
      level: 'low',
      icon: Zap,
      message: 'Your streak needs attention today',
      subMessage: `${currentStreak}-day streak waiting for you`,
      bgClass: 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10',
      borderClass: 'border-indigo-400/20',
      textClass: 'text-indigo-300',
      iconClass: 'text-indigo-400',
      pulseClass: '',
    };
  };

  const config = getUrgencyConfig();

  // No warning to show
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={`mb-6 rounded-2xl p-4 border backdrop-blur-xl shadow-lg transition-all duration-500 ${config.bgClass} ${config.borderClass} ${config.pulseClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl ${config.bgClass}`}>
            <Icon className={`w-5 h-5 ${config.iconClass}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-sm ${config.textClass}`}>
              {config.message}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {config.subMessage}
            </div>
          </div>
        </div>
        
        <button
          onClick={onStartSession}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            config.level === 'emergency' || config.level === 'critical'
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
              : config.level === 'high'
              ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/30'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          }`}
        >
          Start Now
        </button>
      </div>

      {/* Visual urgency bar for high+ levels */}
      {(config.level === 'high' || config.level === 'critical' || config.level === 'emergency') && (
        <div className="mt-3 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              config.level === 'emergency'
                ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse'
                : config.level === 'critical'
                ? 'bg-gradient-to-r from-red-400 to-orange-400'
                : 'bg-gradient-to-r from-amber-400 to-yellow-400'
            }`}
            style={{
              width:
                config.level === 'emergency'
                  ? '95%'
                  : config.level === 'critical'
                  ? '80%'
                  : '65%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StreakDangerZone;
