import { Session } from '../types';

export interface DailyChallenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  type: 'sessions' | 'earnings' | 'timing' | 'duration' | 'streak';
  target: number; // numeric target (count, cents, hour, seconds)
  getProgress: (sessions: Session[], currentStreak: number) => number; // 0-1
  isCompleted: (sessions: Session[], currentStreak: number) => boolean;
}

// All possible challenge templates
const CHALLENGE_POOL: Array<{
  id: string;
  emoji: string;
  titleFn: (n: number) => string;
  descFn: (n: number) => string;
  type: DailyChallenge['type'];
  variants: number[]; // possible target values
  progressFn: (sessions: Session[], target: number, streak: number) => number;
  completedFn: (sessions: Session[], target: number, streak: number) => boolean;
}> = [
  {
    id: 'sessions_today',
    emoji: '☕',
    titleFn: (n) => `${n} Break${n > 1 ? 's' : ''} Today`,
    descFn: (n) => `Take ${n} break session${n > 1 ? 's' : ''} before midnight`,
    type: 'sessions',
    variants: [2, 3, 4],
    progressFn: (sessions, target) => {
      const today = todayCount(sessions);
      return Math.min(1, today / target);
    },
    completedFn: (sessions, target) => todayCount(sessions) >= target,
  },
  {
    id: 'early_bird',
    emoji: '🌅',
    titleFn: () => 'Early Bird',
    descFn: () => 'Take your first break before noon',
    type: 'timing',
    variants: [12], // noon (hour)
    progressFn: (sessions, target) => {
      const todaySessions = getTodaySessions(sessions);
      return todaySessions.some(s => s.startTime.getHours() < target) ? 1 : 0;
    },
    completedFn: (sessions, target) => getTodaySessions(sessions).some(s => s.startTime.getHours() < target),
  },
  {
    id: 'long_session',
    emoji: '⏱️',
    titleFn: (n) => `Slow Down`,
    descFn: (n) => `Take a break longer than ${n} minutes`,
    type: 'duration',
    variants: [5 * 60, 8 * 60, 10 * 60], // seconds
    progressFn: (sessions, target) => {
      const todaySessions = getTodaySessions(sessions).filter(s => !s.isActive);
      const best = Math.max(0, ...todaySessions.map(s => s.duration));
      return Math.min(1, best / target);
    },
    completedFn: (sessions, target) =>
      getTodaySessions(sessions).filter(s => !s.isActive).some(s => s.duration >= target),
  },
  {
    id: 'streak_alive',
    emoji: '🔥',
    titleFn: () => 'Keep It Alive',
    descFn: () => 'Take any break to protect your streak',
    type: 'streak',
    variants: [1],
    progressFn: (sessions) => (todayCount(sessions) >= 1 ? 1 : 0),
    completedFn: (sessions) => todayCount(sessions) >= 1,
  },
  {
    id: 'morning_double',
    emoji: '☀️',
    titleFn: () => 'Morning Double',
    descFn: () => 'Take 2 breaks before noon',
    type: 'timing',
    variants: [2],
    progressFn: (sessions, target) => {
      const count = getTodaySessions(sessions).filter(s => s.startTime.getHours() < 12).length;
      return Math.min(1, count / target);
    },
    completedFn: (sessions, target) =>
      getTodaySessions(sessions).filter(s => s.startTime.getHours() < 12).length >= target,
  },
  {
    id: 'lunch_break',
    emoji: '🥪',
    titleFn: () => 'Lunch Break',
    descFn: () => 'Take a break between 12 PM and 2 PM',
    type: 'timing',
    variants: [12], // hour start (12-14)
    progressFn: (sessions) => {
      const hit = getTodaySessions(sessions).some(s => {
        const h = s.startTime.getHours();
        return h >= 12 && h < 14;
      });
      return hit ? 1 : 0;
    },
    completedFn: (sessions) =>
      getTodaySessions(sessions).some(s => {
        const h = s.startTime.getHours();
        return h >= 12 && h < 14;
      }),
  },
  {
    id: 'quick_break',
    emoji: '⚡',
    titleFn: () => 'Quick Win',
    descFn: () => 'Complete a break under 3 minutes',
    type: 'duration',
    variants: [180], // max 3 min in seconds
    progressFn: (sessions) => {
      const done = getTodaySessions(sessions)
        .filter(s => !s.isActive && s.duration > 10 && s.duration <= 180).length > 0;
      return done ? 1 : 0;
    },
    completedFn: (sessions) =>
      getTodaySessions(sessions).filter(s => !s.isActive && s.duration > 10 && s.duration <= 180).length > 0,
  },
  {
    id: 'earn_today',
    emoji: '💰',
    titleFn: (n) => `Earn $${(n / 100).toFixed(0)} Today`,
    descFn: (n) => `Rack up $${(n / 100).toFixed(0)} in break earnings today`,
    type: 'earnings',
    variants: [100, 200, 500], // cents
    progressFn: (sessions, target) => {
      const earned = getTodaySessions(sessions).reduce((sum, s) => sum + s.earnings, 0);
      return Math.min(1, earned / (target / 100));
    },
    completedFn: (sessions, target) => {
      const earned = getTodaySessions(sessions).reduce((sum, s) => sum + s.earnings, 0);
      return earned >= target / 100;
    },
  },
];

// Helpers
function getTodaySessions(sessions: Session[]): Session[] {
  const today = new Date().toDateString();
  return sessions.filter(s => {
    const t = s.startTime instanceof Date ? s.startTime : new Date(s.startTime);
    return t.toDateString() === today;
  });
}

function todayCount(sessions: Session[]): number {
  return getTodaySessions(sessions).filter(s => !s.isActive).length;
}

// Deterministic seeder using date string + index
function seededRandom(seed: number): number {
  // Simple xorshift
  let x = seed;
  x ^= x << 13;
  x ^= x >> 7;
  x ^= x << 17;
  return Math.abs(x) / 2147483647;
}

function dateToSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * Generate today's 3 daily challenges deterministically.
 * Same date → same challenges for all users.
 */
export function getDailyChallenges(): DailyChallenge[] {
  const seed = dateToSeed(new Date());
  const picked: DailyChallenge[] = [];
  const usedIds = new Set<string>();

  let attempt = 0;
  while (picked.length < 3 && attempt < 100) {
    const rand = seededRandom(seed + attempt * 31337);
    const poolIdx = Math.floor(rand * CHALLENGE_POOL.length);
    const template = CHALLENGE_POOL[poolIdx];

    if (!usedIds.has(template.id)) {
      usedIds.add(template.id);
      const variantRand = seededRandom(seed + attempt * 7919 + 1);
      const variantIdx = Math.floor(variantRand * template.variants.length);
      const target = template.variants[variantIdx];

      picked.push({
        id: `${template.id}_${target}_${seed}`,
        emoji: template.emoji,
        title: template.titleFn(target),
        description: template.descFn(target),
        type: template.type,
        target,
        getProgress: (sessions, streak) => template.progressFn(sessions, target, streak),
        isCompleted: (sessions, streak) => template.completedFn(sessions, target, streak),
      });
    }
    attempt++;
  }

  return picked;
}

/** Returns the localStorage key for today's completions */
export function todayCompletionsKey(): string {
  const d = new Date();
  return `dailyChallengesDone_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

/** Mark a challenge as having fired confetti (so we don't fire twice) */
export function markChallengeConfettiFired(challengeId: string): void {
  const key = todayCompletionsKey();
  const existing = JSON.parse(localStorage.getItem(key) || '[]') as string[];
  if (!existing.includes(challengeId)) {
    existing.push(challengeId);
    localStorage.setItem(key, JSON.stringify(existing));
  }
}

/** Check if confetti already fired for this challenge today */
export function hasConfettiFired(challengeId: string): boolean {
  const key = todayCompletionsKey();
  const existing = JSON.parse(localStorage.getItem(key) || '[]') as string[];
  return existing.includes(challengeId);
}
