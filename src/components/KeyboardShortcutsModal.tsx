import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useFocusTrap } from '../utils/useFocusTrap';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', description: 'Start/stop session', context: '(on Tracker tab)' },
    { key: '1', description: 'Go to Tracker' },
    { key: '2', description: 'Go to Analytics' },
    { key: '3', description: 'Go to History' },
    { key: '4', description: 'Go to Achievements' },
    { key: '5', description: 'Go to Leaderboard' },
    { key: 'Esc', description: 'Close modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="keyboard-shortcuts-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div ref={focusTrapRef} className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-w-sm w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Keyboard className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 id="keyboard-shortcuts-title" className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map(({ key, description, context }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">{description}</span>
                {context && (
                  <span className="text-xs text-slate-500">{context}</span>
                )}
              </div>
              <kbd className="px-2.5 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm font-mono text-indigo-300 min-w-[2.5rem] text-center">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
          Desktop only · Disabled when typing
        </p>
      </div>
    </div>
  );
};
