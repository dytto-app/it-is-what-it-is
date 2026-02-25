import confetti from 'canvas-confetti';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Get rarity based on achievement threshold
export function getAchievementRarity(threshold: number, achievementId: string): Rarity {
  if (threshold >= 500 || ['legendary-status', 'millionaire-mindset', 'full-day-champion'].includes(achievementId)) {
    return 'legendary';
  }
  if (threshold >= 100 || ['consistency-king', 'efficiency-expert', 'midnight-warrior'].includes(achievementId)) {
    return 'epic';
  }
  if (threshold >= 25 || ['weekend-warrior', 'workday-hero', 'power-user'].includes(achievementId)) {
    return 'rare';
  }
  if (threshold >= 5) {
    return 'uncommon';
  }
  return 'common';
}

// Color palettes for different rarities
const rarityColors: Record<Rarity, string[][]> = {
  common: [['#94a3b8', '#cbd5e1']], // Slate
  uncommon: [['#facc15', '#fde047']], // Yellow
  rare: [['#10b981', '#34d399']], // Emerald
  epic: [['#3b82f6', '#60a5fa']], // Blue
  legendary: [['#a855f7', '#c084fc'], ['#f472b6', '#f9a8d4']], // Purple + Pink
};

// Celebration effects based on rarity
export function celebrateAchievement(rarity: Rarity = 'common') {
  const colors = rarityColors[rarity];
  const colorList = colors.flat();
  
  // Base confetti settings
  const defaults = {
    spread: 60,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: colorList,
    disableForReducedMotion: true,
  };

  switch (rarity) {
    case 'legendary':
      // Epic multi-burst explosion for legendary achievements
      void confetti({
        ...defaults,
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        void confetti({
          ...defaults,
          particleCount: 50,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.6 },
        });
        void confetti({
          ...defaults,
          particleCount: 50,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.6 },
        });
      }, 200);
      setTimeout(() => {
        void confetti({
          ...defaults,
          particleCount: 75,
          spread: 120,
          origin: { y: 0.7 },
          startVelocity: 45,
        });
      }, 400);
      break;
      
    case 'epic':
      // Double burst for epic achievements
      void confetti({
        ...defaults,
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        void confetti({
          ...defaults,
          particleCount: 40,
          spread: 100,
          origin: { y: 0.65 },
        });
      }, 250);
      break;
      
    case 'rare':
      // Side cannons for rare achievements
      void confetti({
        ...defaults,
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      void confetti({
        ...defaults,
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      break;
      
    case 'uncommon':
      // Medium burst
      void confetti({
        ...defaults,
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
      break;
      
    default:
      // Simple burst for common
      void confetti({
        ...defaults,
        particleCount: 30,
        spread: 50,
        origin: { y: 0.65 },
      });
      break;
  }
}

// Streak freeze celebration — cyan/blue burst when freeze is earned at a milestone
export function celebrateStreakFreeze() {
  const colors = ['#22d3ee', '#67e8f9', '#38bdf8', '#818cf8', '#a5f3fc'];

  // Main burst from center
  void confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    startVelocity: 35,
    gravity: 0.9,
    decay: 0.93,
    disableForReducedMotion: true,
  });

  // Side icicles
  setTimeout(() => {
    void confetti({
      particleCount: 30,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.65 },
      colors,
      gravity: 0.8,
      startVelocity: 28,
      disableForReducedMotion: true,
    });
    void confetti({
      particleCount: 30,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.65 },
      colors,
      gravity: 0.8,
      startVelocity: 28,
      disableForReducedMotion: true,
    });
  }, 180);
}

// Multi-achievement celebration (when multiple unlock at once)
export function celebrateMultipleAchievements(count: number) {
  // Stagger celebrations
  for (let i = 0; i < Math.min(count, 3); i++) {
    setTimeout(() => {
      void confetti({
        particleCount: 40 + (i * 10),
        spread: 70 + (i * 15),
        origin: { y: 0.6 - (i * 0.05) },
        colors: ['#fbbf24', '#a855f7', '#3b82f6', '#10b981', '#f472b6'],
        disableForReducedMotion: true,
      });
    }, i * 300);
  }
}

// Session completion celebration — scaled by quality
// earnings: dollars (float), durationSec: seconds, isPersonalRecord: new high earnings
export function celebrateSessionEnd(earnings: number, durationSec: number, isPersonalRecord: boolean) {
  // Personal record — gold side cannon burst
  if (isPersonalRecord) {
    const goldColors = ['#fbbf24', '#f59e0b', '#fde68a', '#fcd34d'];
    void confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: goldColors,
      startVelocity: 32,
      decay: 0.92,
      disableForReducedMotion: true,
    });
    void confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: goldColors,
      startVelocity: 32,
      decay: 0.92,
      disableForReducedMotion: true,
    });
    return;
  }

  // Great session: $10+ or 30+ minutes
  if (earnings >= 10 || durationSec >= 30 * 60) {
    const greatColors = ['#34d399', '#6ee7b7', '#a7f3d0', '#10b981'];
    void confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.65 },
      colors: greatColors,
      startVelocity: 35,
      decay: 0.93,
      gravity: 0.85,
      disableForReducedMotion: true,
    });
    setTimeout(() => {
      void confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: greatColors,
        startVelocity: 28,
        disableForReducedMotion: true,
      });
    }, 250);
    return;
  }

  // Good session: $5+ or 15+ minutes
  if (earnings >= 5 || durationSec >= 15 * 60) {
    void confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#34d399', '#6ee7b7', '#a7f3d0'],
      startVelocity: 30,
      decay: 0.93,
      disableForReducedMotion: true,
    });
    return;
  }

  // Decent session: $1+ or 5+ minutes — subtle little burst
  if (earnings >= 1 || durationSec >= 5 * 60) {
    void confetti({
      particleCount: 22,
      spread: 50,
      origin: { y: 0.68 },
      colors: ['#34d399', '#a7f3d0', '#6ee7b7'],
      startVelocity: 25,
      decay: 0.92,
      ticks: 60,
      disableForReducedMotion: true,
    });
  }
  // Below threshold — no celebration (too short/small)
}
