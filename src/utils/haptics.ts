/**
 * Haptic feedback utilities for mobile devices
 * Uses the Vibration API (navigator.vibrate)
 */

const canVibrate = () => 'vibrate' in navigator;

export const Haptics = {
  /** Short pulse for session start (50ms) */
  sessionStart() {
    if (canVibrate()) {
      navigator.vibrate(50);
    }
  },

  /** Double pulse for session end (50ms, pause, 50ms) */
  sessionEnd() {
    if (canVibrate()) {
      navigator.vibrate([50, 30, 50]);
    }
  },

  /** Celebration pattern for achievement unlock */
  achievement() {
    if (canVibrate()) {
      navigator.vibrate([100, 30, 100, 30, 100]);
    }
  },

  /** Light tap for button interactions */
  tap() {
    if (canVibrate()) {
      navigator.vibrate(10);
    }
  },
};
