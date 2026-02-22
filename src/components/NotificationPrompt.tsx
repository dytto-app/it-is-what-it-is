import React from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationUtils } from '../utils/notifications';

interface NotificationPromptProps {
  streakDays: number;
  onAccept: () => void;
  onDismiss: () => void;
}

/**
 * Contextual prompt to enable streak reminders.
 * Shows after session end (once, if user hasn't been asked yet) when they have a streak.
 * Much better than burying the toggle in Profile settings.
 */
export const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  streakDays,
  onAccept,
  onDismiss,
}) => {
  const handleAccept = async () => {
    const granted = await NotificationUtils.requestPermission();
    if (granted) {
      NotificationUtils.setEnabled(true);
      NotificationUtils.scheduleStreakReminder(streakDays);
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl p-5 shadow-2xl">
        {/* Icon + close */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copy */}
        <h3 className="text-white font-semibold text-base mb-1">
          {streakDays > 1
            ? `Protect your ${streakDays}-day streak?`
            : 'Want a reminder tomorrow?'}
        </h3>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          We'll nudge you at 7 PM if you haven't taken a break yet.
          {streakDays > 1 ? ' Keep the streak alive.' : ''}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Enable reminders
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
};
