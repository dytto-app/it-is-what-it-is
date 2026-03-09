/**
 * Sound utilities for Back-log
 * Uses Web Audio API for lightweight, pleasant audio cues
 */

const SOUND_ENABLED_KEY = 'soundsEnabled';

// Audio context singleton (created on demand to comply with autoplay policies)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  // Respect prefers-reduced-motion
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }

  return audioContext;
};

/**
 * Play a simple tone with the Web Audio API
 */
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15
): void => {
  const ctx = getAudioContext();
  if (!ctx || !SoundUtils.isEnabled()) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  // Fade in and out to avoid clicks
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, now + duration - 0.01);

  oscillator.start(now);
  oscillator.stop(now + duration);
};

/**
 * Play a simple chord (multiple tones)
 */
const playChord = (
  frequencies: number[],
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.1
): void => {
  for (const freq of frequencies) {
    playTone(freq, duration, type, volume / frequencies.length);
  }
};

export const SoundUtils = {
  /** Is sound enabled in user preferences? */
  isEnabled(): boolean {
    return localStorage.getItem(SOUND_ENABLED_KEY) === 'true';
  },

  /** Enable or disable sounds */
  setEnabled(enabled: boolean): void {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
  },

  /**
   * Session milestone sound (5min, 10min, 15min, 20min)
   * Gentle ascending chime
   */
  sessionMilestone(): void {
    // C5 - E5 quick arpeggio
    playTone(523, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 80);
  },

  /**
   * Session warning sound (25 min — approaching limit)
   * Two-note warning chime
   */
  sessionWarning(): void {
    // G4 - G5 octave jump
    playTone(392, 0.15, 'triangle', 0.15);
    setTimeout(() => playTone(784, 0.2, 'triangle', 0.12), 120);
  },

  /**
   * Session start sound
   * Pleasant activation tone
   */
  sessionStart(): void {
    // C4 - E4 - G4 ascending
    playTone(262, 0.08, 'sine', 0.08);
    setTimeout(() => playTone(330, 0.08, 'sine', 0.1), 60);
    setTimeout(() => playTone(392, 0.12, 'sine', 0.1), 120);
  },

  /**
   * Session end sound
   * Satisfying completion chime
   */
  sessionEnd(): void {
    // G4 - C5 - E5 - G5 rising arpeggio
    playTone(392, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(523, 0.1, 'sine', 0.12), 80);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 160);
    setTimeout(() => playTone(784, 0.18, 'sine', 0.1), 240);
  },

  /**
   * Session auto-stopped sound (hit 30min limit)
   * Soft descending tone
   */
  sessionAutoStop(): void {
    // E5 - C5 descending
    playTone(659, 0.15, 'triangle', 0.12);
    setTimeout(() => playTone(523, 0.2, 'triangle', 0.1), 130);
  },

  /**
   * Achievement unlock sound
   * Celebratory fanfare
   */
  achievementUnlock(): void {
    // C5 - E5 - G5 chord burst
    playChord([523, 659, 784], 0.25, 'sine', 0.15);
    setTimeout(() => playChord([587, 740, 880], 0.35, 'sine', 0.12), 200);
  },

  /**
   * Daily goal reached sound
   * Success chime
   */
  goalReached(): void {
    // C5 - E5 - G5 - C6 fanfare
    playTone(523, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(784, 0.1, 'sine', 0.1), 200);
    setTimeout(() => playTone(1047, 0.25, 'sine', 0.12), 300);
  },

  /**
   * Initialize audio context (call on first user interaction)
   * Required by browser autoplay policies
   */
  initialize(): void {
    getAudioContext();
  },
};

export default SoundUtils;
