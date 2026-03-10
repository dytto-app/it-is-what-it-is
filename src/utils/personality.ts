/**
 * Break Personality Profile — Discover your break style (#68)
 * 
 * Analyzes user session patterns and categorizes them into personality types.
 * Inspired by COLD-Steer paper's training-free personalization.
 */

import { Session } from '../types';

export interface BreakPersonality {
  id: string;
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  traits: string[];
  color: string; // Tailwind gradient
}

export const PERSONALITIES: Record<string, BreakPersonality> = {
  earlyBird: {
    id: 'earlyBird',
    name: 'The Early Bird',
    emoji: '🌅',
    description: 'You seize the day — and the bathroom — before most people hit snooze.',
    funFact: 'Early risers earn 10% more on average (we made that up, but it feels true).',
    traits: ['Morning person', 'Productive peaks before noon', 'Probably drinks coffee'],
    color: 'from-amber-500 to-orange-400',
  },
  nightOwl: {
    id: 'nightOwl',
    name: 'The Night Owl',
    emoji: '🦉',
    description: 'While the world sleeps, you are racking up earnings in the moonlight.',
    funFact: 'Night owls are statistically more creative. Or so they tell themselves at 2am.',
    traits: ['Late-night sessions', 'Peak productivity after dark', 'Questionable sleep schedule'],
    color: 'from-indigo-600 to-purple-500',
  },
  marathoner: {
    id: 'marathoner',
    name: 'The Marathon Runner',
    emoji: '🏃',
    description: 'You do not rush. You savor. Every session is an experience.',
    funFact: 'Your legs have definitely fallen asleep at least once.',
    traits: ['Long sessions', 'High earner', 'Possibly reading this during a session'],
    color: 'from-emerald-500 to-teal-400',
  },
  speedDemon: {
    id: 'speedDemon',
    name: 'The Speed Demon',
    emoji: '⚡',
    description: 'In and out faster than a caffeine rush. Efficiency is your middle name.',
    funFact: 'You have calculated the optimal bathroom distance from your desk.',
    traits: ['Quick sessions', 'High frequency', 'Time optimizer'],
    color: 'from-yellow-400 to-amber-500',
  },
  consistencyKing: {
    id: 'consistencyKing',
    name: 'The Consistency King',
    emoji: '👑',
    description: 'Day after day, session after session. You are the definition of reliable.',
    funFact: 'Your streak is probably giving Duolingo anxiety.',
    traits: ['Daily tracker', 'Strong streaks', 'Habit master'],
    color: 'from-violet-500 to-purple-400',
  },
  bathroomBoss: {
    id: 'bathroomBoss',
    name: 'The Bathroom Boss',
    emoji: '🚽',
    description: 'You know why you are here. Classic bathroom breaks, maximum earnings.',
    funFact: 'You are using this app as intended. We respect that.',
    traits: ['Bathroom loyalist', 'True to the mission', 'Efficient earner'],
    color: 'from-indigo-500 to-blue-400',
  },
  coffeeConnoisseur: {
    id: 'coffeeConnoisseur',
    name: 'The Coffee Connoisseur',
    emoji: '☕',
    description: 'Espresso breaks? Tracked. Latte runs? Monetized. You are caffeinated and profitable.',
    funFact: 'Your coffee breaks have their own coffee breaks.',
    traits: ['Coffee enthusiast', 'Midday peaks', 'Probably jittery'],
    color: 'from-amber-600 to-yellow-500',
  },
  walkingWonder: {
    id: 'walkingWonder',
    name: 'The Walking Wonder',
    emoji: '🚶',
    description: 'Steps and earnings — you are tracking both. Health and wealth in one.',
    funFact: '10,000 steps AND getting paid? This is the future.',
    traits: ['Walk breaks', 'Healthy habit', 'Probably fits the Fitbit demographic'],
    color: 'from-green-500 to-emerald-400',
  },
  socialButterfly: {
    id: 'socialButterfly',
    name: 'The Social Butterfly',
    emoji: '💬',
    description: 'Watercooler champion. Every chat break is a networking opportunity.',
    funFact: 'You have probably heard the latest office gossip before anyone else.',
    traits: ['Chat breaks', 'People person', 'Knows everyones business'],
    color: 'from-blue-500 to-cyan-400',
  },
  varietyVirtuoso: {
    id: 'varietyVirtuoso',
    name: 'The Variety Virtuoso',
    emoji: '🌈',
    description: 'Why pick one break type when you can master them all? Range is your superpower.',
    funFact: 'Your break portfolio is more diversified than most 401(k)s.',
    traits: ['All break types', 'Adaptable', 'Jack of all trades'],
    color: 'from-pink-500 to-purple-500',
  },
  weekendWarrior: {
    id: 'weekendWarrior',
    name: 'The Weekend Warrior',
    emoji: '🎮',
    description: 'Weekdays are for work. Weekends are for... also tracking work breaks, apparently.',
    funFact: 'Your couch has seen more action than your office chair.',
    traits: ['Weekend heavy', 'Relaxed vibes', 'Probably WFH'],
    color: 'from-rose-500 to-pink-400',
  },
  grinder: {
    id: 'grinder',
    name: 'The Grinder',
    emoji: '💼',
    description: 'Monday through Friday, you are locked in. Weekends are for resting (not earning).',
    funFact: 'Your productivity peaks on Tuesdays. We have done the math.',
    traits: ['Weekday warrior', 'Professional breaks', '9-to-5 energy'],
    color: 'from-slate-600 to-zinc-500',
  },
  risingStar: {
    id: 'risingStar',
    name: 'The Rising Star',
    emoji: '🌟',
    description: 'You are new here, but already climbing. The leaderboard should be nervous.',
    funFact: 'Your session count is small but your potential is unlimited.',
    traits: ['New user', 'Growing fast', 'One to watch'],
    color: 'from-cyan-400 to-blue-500',
  },
  legend: {
    id: 'legend',
    name: 'The Legend',
    emoji: '🏆',
    description: 'You have seen it all. High earnings, long streaks, and probably wrote reviews.',
    funFact: 'Your profile should be in a museum.',
    traits: ['High earner', 'Long streaks', 'Power user'],
    color: 'from-amber-400 to-yellow-300',
  },
};

interface PersonalityScore {
  id: string;
  score: number;
}

/**
 * Calculate the user's break personality based on their session data.
 */
export function calculatePersonality(
  sessions: Session[],
  currentStreak: number,
  longestStreak: number
): BreakPersonality | null {
  const completed = sessions.filter(s => !s.isActive && s.duration > 0);
  
  // Need at least 5 sessions for meaningful personality
  if (completed.length < 5) {
    return PERSONALITIES.risingStar;
  }

  const scores: PersonalityScore[] = [];

  // Calculate various metrics
  const avgDuration = completed.reduce((s, x) => s + x.duration, 0) / completed.length;
  const totalEarnings = completed.reduce((s, x) => s + x.earnings, 0);
  
  // Hour distribution
  const hourCounts = new Array(24).fill(0);
  completed.forEach(s => hourCounts[s.startTime.getHours()]++);
  const morningCount = hourCounts.slice(5, 10).reduce((a, b) => a + b, 0);
  const eveningCount = hourCounts.slice(20, 24).reduce((a, b) => a + b, 0);
  
  // Day distribution
  const dayCounts = new Array(7).fill(0);
  completed.forEach(s => dayCounts[s.startTime.getDay()]++);
  const weekdayCount = dayCounts.slice(1, 6).reduce((a, b) => a + b, 0);
  const weekendCount = dayCounts[0] + dayCounts[6];
  
  // Category distribution
  const categoryCounts: Record<string, number> = {};
  completed.forEach(s => {
    const cat = s.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const uniqueCategories = Object.keys(categoryCounts).filter(k => categoryCounts[k] > 0).length;
  
  // Recent activity (last 14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentSessions = completed.filter(s => s.startTime >= twoWeeksAgo);
  const recentDays = new Set(recentSessions.map(s => s.startTime.toDateString())).size;

  // ─── Score each personality ─────────────────────────────────────────────────

  // Early Bird: >40% morning sessions
  if (morningCount / completed.length > 0.4) {
    scores.push({ id: 'earlyBird', score: 80 + (morningCount / completed.length) * 20 });
  }

  // Night Owl: >30% evening sessions
  if (eveningCount / completed.length > 0.3) {
    scores.push({ id: 'nightOwl', score: 80 + (eveningCount / completed.length) * 20 });
  }

  // Marathon Runner: avg session > 15 min (900s)
  if (avgDuration > 900) {
    scores.push({ id: 'marathoner', score: 80 + Math.min(20, (avgDuration - 900) / 60) });
  }

  // Speed Demon: avg session < 3 min (180s) with at least 10 sessions
  if (avgDuration < 180 && completed.length >= 10) {
    scores.push({ id: 'speedDemon', score: 85 + (180 - avgDuration) / 10 });
  }

  // Consistency King: 10+ days in last 2 weeks
  if (recentDays >= 10) {
    scores.push({ id: 'consistencyKing', score: 85 + recentDays - 10 });
  }

  // Bathroom Boss: >70% bathroom sessions
  const bathroomPct = (categoryCounts['bathroom'] || 0) / completed.length;
  if (bathroomPct > 0.7) {
    scores.push({ id: 'bathroomBoss', score: 80 + bathroomPct * 20 });
  }

  // Coffee Connoisseur: >50% coffee sessions
  const coffeePct = (categoryCounts['coffee'] || 0) / completed.length;
  if (coffeePct > 0.5) {
    scores.push({ id: 'coffeeConnoisseur', score: 80 + coffeePct * 20 });
  }

  // Walking Wonder: >50% walk sessions
  const walkPct = (categoryCounts['walk'] || 0) / completed.length;
  if (walkPct > 0.5) {
    scores.push({ id: 'walkingWonder', score: 80 + walkPct * 20 });
  }

  // Social Butterfly: >50% chat sessions
  const chatPct = (categoryCounts['chat'] || 0) / completed.length;
  if (chatPct > 0.5) {
    scores.push({ id: 'socialButterfly', score: 80 + chatPct * 20 });
  }

  // Variety Virtuoso: 4+ categories with reasonably even distribution
  if (uniqueCategories >= 4) {
    const categoryValues = Object.values(categoryCounts);
    const maxCat = Math.max(...categoryValues);
    const evenness = 1 - (maxCat / completed.length); // Higher = more even
    if (evenness > 0.5) {
      scores.push({ id: 'varietyVirtuoso', score: 80 + uniqueCategories * 5 });
    }
  }

  // Weekend Warrior: >60% weekend sessions (min 10 total)
  if (completed.length >= 10 && weekendCount / completed.length > 0.6) {
    scores.push({ id: 'weekendWarrior', score: 80 + (weekendCount / completed.length) * 20 });
  }

  // Grinder: >80% weekday sessions (min 15 total)
  if (completed.length >= 15 && weekdayCount / completed.length > 0.8) {
    scores.push({ id: 'grinder', score: 80 + (weekdayCount / completed.length) * 20 });
  }

  // Legend: 30+ day streak OR 100+ sessions OR $500+ total earnings
  if (longestStreak >= 30 || completed.length >= 100 || totalEarnings >= 500) {
    const legendScore = 
      (longestStreak >= 30 ? 30 : 0) +
      (completed.length >= 100 ? 30 : 0) +
      (totalEarnings >= 500 ? 30 : 0) + 10;
    scores.push({ id: 'legend', score: legendScore });
  }

  // Pick the highest scoring personality
  if (scores.length === 0) {
    // Fallback: Rising Star for users without a clear pattern
    return PERSONALITIES.risingStar;
  }

  scores.sort((a, b) => b.score - a.score);
  return PERSONALITIES[scores[0].id];
}

/**
 * Get a secondary personality trait for more depth.
 */
export function getSecondaryTrait(
  sessions: Session[],
  primaryId: string
): string | null {
  const completed = sessions.filter(s => !s.isActive && s.duration > 0);
  if (completed.length < 10) return null;

  const avgDuration = completed.reduce((s, x) => s + x.duration, 0) / completed.length;
  
  // Secondary traits that do not overlap with primary
  const traits: { id: string; trait: string; condition: boolean }[] = [
    { id: 'marathoner', trait: 'with marathon endurance', condition: avgDuration > 600 && primaryId !== 'marathoner' },
    { id: 'speedDemon', trait: 'with lightning speed', condition: avgDuration < 180 && primaryId !== 'speedDemon' },
    { id: 'consistencyKing', trait: 'with royal consistency', condition: false }, // Calculated separately
    { id: 'highEarner', trait: 'with impressive earnings', condition: completed.reduce((s, x) => s + x.earnings, 0) > 100 },
  ];

  const match = traits.find(t => t.condition);
  return match?.trait || null;
}
