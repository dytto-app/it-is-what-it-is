import { supabase } from './supabase';
import { User, Session, Achievement } from '../types';

export const DatabaseUtils = {
  // ===== USER OPERATIONS =====
  async getUserProfile(userId: string): Promise<User> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!data) throw new Error('User profile not found');

    return {
      id: data.id,
      nickname: data.nickname,
      hourlyWage: data.hourly_wage,
      createdAt: new Date(data.created_at),
      showOnLeaderboard: data.show_on_leaderboard,
      salary: data.salary || 0,
      salaryPeriod: data.salary_period || 'weekly',
      onboarded: data.onboarded || false
    };
  },

  async updateUser(user: User): Promise<void> {
    await supabase
      .from('profiles')
      .update({
        nickname: user.nickname,
        hourly_wage: user.hourlyWage,
        show_on_leaderboard: user.showOnLeaderboard,
        salary: user.salary,
        salary_period: user.salaryPeriod,
        onboarded: user.onboarded,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
  },

  // ===== SESSION OPERATIONS =====
  async getSessions(userId: string): Promise<Session[]> {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    return (data || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      startTime: new Date(s.start_time),
      endTime: s.end_time ? new Date(s.end_time) : null,
      duration: s.duration,
      earnings: parseFloat(s.earnings),
      isActive: s.is_active
    }));
  },

  async createSession(session: Session): Promise<Session> {
    const { data } = await supabase
      .from('sessions')
      .insert([{
        id: session.id,
        user_id: session.userId,
        start_time: session.startTime.toISOString(),
        end_time: null,
        duration: 0,
        earnings: 0,
        is_active: true
      }])
      .select()
      .single();

    return {
      id: data.id,
      userId: data.user_id,
      startTime: new Date(data.start_time),
      endTime: null,
      duration: data.duration,
      earnings: parseFloat(data.earnings),
      isActive: data.is_active
    };
  },

  async endSession(sessionId: string, endTime: Date, duration: number, earnings: number): Promise<void> {
    await supabase
      .from('sessions')
      .update({
        end_time: endTime.toISOString(),
        duration,
        earnings: earnings.toString(),
        is_active: false
      })
      .eq('id', sessionId);
  },

  // ===== ACHIEVEMENT OPERATIONS =====
  async getAchievements(): Promise<Achievement[]> {
    const { data } = await supabase
      .from('achievements')
      .select('*');

    return (data || []).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      threshold: a.threshold,
      type: a.type as 'sessions' | 'earnings' | 'time'
    }));
  },

  async getUserAchievements(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    return (data || []).map(a => a.achievement_id);
  },

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) return; // Already unlocked
    } catch (error) {
      // Row doesn't exist, which is expected for first unlock
    }

    // Insert the new achievement unlock
    await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      }]);
  },

  // ===== LEADERBOARD OPERATIONS =====
  async getLeaderboard() {
    const { data } = await supabase
      .from('profiles')
      .select(`
        id,
        nickname,
        show_on_leaderboard,
        sessions (
          earnings,
          duration
        )
      `)
      .eq('show_on_leaderboard', true)
      .order('id');

    return (data || []).map(profile => {
      const sessions = profile.sessions || [];
      const totalEarnings = sessions.reduce((sum: number, s: any) => sum + parseFloat(s.earnings), 0);
      const totalTime = sessions.reduce((sum: number, s: any) => sum + s.duration, 0);

      return {
        userId: profile.id,
        nickname: profile.nickname || 'Anonymous',
        totalEarnings,
        totalTime,
        sessionCount: sessions.length
      };
    }).sort((a, b) => b.totalEarnings - a.totalEarnings);
  },

  // ===== COSMETICS OPERATIONS =====
  async getCosmetics() {
    const { data } = await supabase
      .from('cosmetics')
      .select('*');

    return data || [];
  },

  async getUserCosmetics(userId: string) {
    const { data } = await supabase
      .from('user_cosmetics')
      .select('cosmetic_id')
      .eq('user_id', userId);

    return (data || []).map(c => c.cosmetic_id);
  },

  async purchaseCosmetic(userId: string, cosmeticId: string): Promise<void> {
    const { data: existing } = await supabase
      .from('user_cosmetics')
      .select('id')
      .eq('user_id', userId)
      .eq('cosmetic_id', cosmeticId)
      .single();

    if (!existing) {
      await supabase
        .from('user_cosmetics')
        .insert([{
          user_id: userId,
          cosmetic_id: cosmeticId,
          purchased_at: new Date().toISOString()
        }]);
    }
  },

  async equipCosmetics(userId: string, frameId: string | null, badgeId: string | null, titleId: string | null): Promise<void> {
    const { data: existing } = await supabase
      .from('user_equipped_cosmetics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('user_equipped_cosmetics')
        .update({
          frame_id: frameId,
          badge_id: badgeId,
          title_id: titleId
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_equipped_cosmetics')
        .insert([{
          user_id: userId,
          frame_id: frameId,
          badge_id: badgeId,
          title_id: titleId
        }]);
    }
  }
};
