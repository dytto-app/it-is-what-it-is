import { supabase } from './supabase';
import { User, Session, Achievement } from '../types';

export const DatabaseUtils = {
  // ===== USER OPERATIONS =====
  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(`Failed to load profile: ${error.message}`);
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
    const { error } = await supabase
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

    if (error) throw new Error(`Failed to update profile: ${error.message}`);
  },

  // ===== SESSION OPERATIONS =====
  async getSessions(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw new Error(`Failed to load sessions: ${error.message}`);

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
    const { data, error } = await supabase
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

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    if (!data) throw new Error('Session creation returned no data');

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
    const { error } = await supabase
      .from('sessions')
      .update({
        end_time: endTime.toISOString(),
        duration,
        earnings: earnings.toString(),
        is_active: false
      })
      .eq('id', sessionId);

    if (error) throw new Error(`Failed to end session: ${error.message}`);
  },

  async closeStaleSession(session: Session, hourlyWage: number): Promise<Session> {
    const maxDuration = 30 * 60; // 30 minutes
    const endTime = new Date(session.startTime.getTime() + maxDuration * 1000);
    const earnings = (hourlyWage * maxDuration) / 3600;

    const { error } = await supabase
      .from('sessions')
      .update({
        end_time: endTime.toISOString(),
        duration: maxDuration,
        earnings: earnings.toString(),
        is_active: false
      })
      .eq('id', session.id);

    if (error) throw new Error(`Failed to close stale session: ${error.message}`);

    return {
      ...session,
      endTime,
      duration: maxDuration,
      earnings,
      isActive: false
    };
  },

  // ===== ACHIEVEMENT OPERATIONS =====
  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*');

    if (error) throw new Error(`Failed to load achievements: ${error.message}`);

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
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to load user achievements: ${error.message}`);

    return (data || []).map(a => a.achievement_id);
  },

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    // Use upsert to avoid race conditions and duplicate checks
    const { error } = await supabase
      .from('user_achievements')
      .upsert(
        {
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        },
        { onConflict: 'user_id,achievement_id' }
      );

    if (error) throw new Error(`Failed to unlock achievement: ${error.message}`);
  },

  // ===== LEADERBOARD OPERATIONS =====
  async getLeaderboard(timeFrame: 'daily' | 'weekly' | 'alltime' = 'alltime') {
    // Calculate date range based on timeFrame
    const now = new Date();
    let startDate = new Date(0); // Beginning of time for 'alltime'

    if (timeFrame === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeFrame === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        nickname,
        show_on_leaderboard,
        sessions (
          earnings,
          duration,
          start_time
        )
      `)
      .eq('show_on_leaderboard', true)
      .order('id');

    if (error) throw new Error(`Failed to load leaderboard: ${error.message}`);

    return (data || []).map(profile => {
      const sessions = (profile.sessions || []).filter((s: any) => {
        const sessionDate = new Date(s.start_time);
        return sessionDate >= startDate;
      });

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
    const { data, error } = await supabase
      .from('cosmetics')
      .select('*');

    if (error) throw new Error(`Failed to load cosmetics: ${error.message}`);
    return data || [];
  },

  async getUserCosmetics(userId: string) {
    const { data, error } = await supabase
      .from('user_cosmetics')
      .select('cosmetic_id')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to load user cosmetics: ${error.message}`);
    return (data || []).map(c => c.cosmetic_id);
  },

  // NOTE: Direct cosmetic purchase removed for security.
  // Cosmetics are granted server-side only via the Stripe webhook handler.
  // See: supabase/functions/stripe-webhook/index.ts


  async equipCosmetics(userId: string, frameId: string | null, badgeId: string | null, titleId: string | null): Promise<void> {
    const { error } = await supabase
      .from('user_equipped_cosmetics')
      .upsert(
        {
          user_id: userId,
          frame_id: frameId,
          badge_id: badgeId,
          title_id: titleId
        },
        { onConflict: 'user_id' }
      );

    if (error) throw new Error(`Failed to equip cosmetics: ${error.message}`);
  }
};
