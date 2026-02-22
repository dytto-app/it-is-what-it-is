import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User as UserIcon, LogOut, HelpCircle } from 'lucide-react';
import { User, Session, Achievement } from './types';
import { DatabaseUtils } from './utils/database';
import { CalculationUtils } from './utils/calculations';
import { AchievementUtils } from './utils/achievements';
import { celebrateAchievement, celebrateMultipleAchievements, celebrateStreakFreeze, getAchievementRarity } from './utils/confetti';
import { Haptics } from './utils/haptics';
import { NotificationUtils } from './utils/notifications';
import { SessionTracker } from './components/SessionTracker';
import { Navigation } from './components/Navigation';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { 
  AnalyticsSkeleton, 
  SessionHistorySkeleton, 
  AchievementsSkeleton, 
  LeaderboardSkeleton, 
  ProfileSkeleton 
} from './components/Skeleton';
import { ResetPassword } from './components/ResetPassword';
import { ShareSessionModal } from './components/ShareSessionModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { TutorialModal } from './components/TutorialModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { NotificationPrompt } from './components/NotificationPrompt';
import { supabase } from './utils/supabase';
import { Analytics as GA } from './utils/analytics';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// ISO week number helper
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Lazy load heavy components (Analytics uses recharts which is ~400KB)
const Analytics = lazy(() => import('./components/Analytics').then(m => ({ default: m.Analytics })));
const SessionHistory = lazy(() => import('./components/SessionHistory').then(m => ({ default: m.SessionHistory })));
const Achievements = lazy(() => import('./components/Achievements').then(m => ({ default: m.Achievements })));
const Leaderboard = lazy(() => import('./components/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Profile = lazy(() => import('./components/Profile').then(m => ({ default: m.Profile })));

type TabType = 'tracker' | 'analytics' | 'history' | 'achievements' | 'leaderboard' | 'profile';

const MAX_SESSION_DURATION = 30 * 60; // 30 minutes in seconds

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTabRaw] = useState<TabType>('tracker');
  const setActiveTab = (tab: TabType) => {
    setActiveTabRaw(tab);
    GA.pageView(`/${tab}`, `Back-log — ${tab}`);
  };
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authDefaultLogin, setAuthDefaultLogin] = useState(true);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const [completedSession, setCompletedSession] = useState<Session | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const handleSessionEndRef = useRef<(() => void) | null>(null);

  const NOTIF_PROMPT_KEY = 'notifPromptShown';

  // Check for password reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token && window.location.pathname === '/reset-password') {
      setResetPasswordToken(token);
    }
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setAuthUserId(data.session.user.id);
      }
      setAuthLoading(false);
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
      } else {
        setAuthUserId(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Warn user before leaving with an active session (#89)
  useEffect(() => {
    if (!activeSession) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active break session. Leaving now will stop your timer.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeSession]);

  // Initialize user and load data from Supabase
  useEffect(() => {
    if (!authUserId) return;

    const initializeApp = async () => {
      try {
        // Get user profile from Supabase (already exists from auth signup)
        const userProfile = await DatabaseUtils.getUserProfile(authUserId);
        setUser(userProfile);

        // Load sessions and achievements in parallel
        const [userSessions, unlockedAchievementIds, allAchievements] = await Promise.all([
          DatabaseUtils.getSessions(authUserId),
          DatabaseUtils.getUserAchievements(authUserId),
          DatabaseUtils.getAchievements()
        ]);

        setSessions(userSessions);

        // Map achievements with unlock status
        const achievementsWithStatus = allAchievements.map(achievement => ({
          ...achievement,
          unlockedAt: unlockedAchievementIds.includes(achievement.id) ? new Date() : undefined
        }));
        
        // Check and unlock achievements based on existing sessions (retroactive unlock)
        const checkedAchievements = AchievementUtils.checkAchievements(
          userSessions, 
          achievementsWithStatus, 
          userProfile.currentStreak
        );
        
        // Save any newly unlocked achievements
        const newlyUnlocked = checkedAchievements.filter(
          a => a.unlockedAt && !unlockedAchievementIds.includes(a.id)
        );
        for (const achievement of newlyUnlocked) {
          try {
            await DatabaseUtils.unlockAchievement(userProfile.id, achievement.id);
          } catch (err) {
            console.error('Failed to unlock achievement on init:', err);
          }
        }
        
        setAchievements(checkedAchievements);

        // Schedule streak reminder on app load if user has a streak but no session today yet
        if (userProfile.currentStreak > 0 && NotificationUtils.isEnabled() && NotificationUtils.getPermission() === 'granted') {
          const todayStr = new Date().toDateString();
          const hasTodaySession = userSessions.some(s => {
            const d = s.startTime instanceof Date ? s.startTime : new Date(s.startTime);
            return d.toDateString() === todayStr;
          });
          if (!hasTodaySession) {
            NotificationUtils.scheduleStreakReminder(userProfile.currentStreak);
          }
        }

        // Restore active session if any — close if stale (>30 min)
        const foundActiveSession = userSessions.find(s => s.isActive);
        if (foundActiveSession) {
          const elapsed = Math.floor((Date.now() - foundActiveSession.startTime.getTime()) / 1000);
          if (elapsed >= MAX_SESSION_DURATION) {
            // Session exceeded max duration — close it
            const closedSession = await DatabaseUtils.closeStaleSession(foundActiveSession, userProfile.hourlyWage);
            setSessions(prev => prev.map(s => s.id === closedSession.id ? closedSession : s));
          } else {
            setActiveSession(foundActiveSession);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [authUserId]);

  // Weekly summary: show on Mondays (or any day) once per week if user has last-week sessions
  useEffect(() => {
    if (!user || sessions.length === 0) return;

    const now = new Date();
    const weekKey = `weeklySummaryShown_${now.getFullYear()}_W${getISOWeek(now)}`;
    const alreadyShown = localStorage.getItem(weekKey);
    if (alreadyShown) return;

    // Show any day Mon–Sat (not Sunday — week boundary is ambiguous)
    // The ISO week key prevents double-showing within the same week
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if (dayOfWeek === 0) return; // skip Sunday

    // Check if there are sessions from last week
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(today.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
    const lastMonday = new Date(thisMonday.getTime() - 7 * 24 * 60 * 60 * 1000);

    const lastWeekSessions = sessions.filter(s => {
      const t = s.startTime instanceof Date ? s.startTime : new Date(s.startTime);
      return t >= lastMonday && t < thisMonday;
    });

    if (lastWeekSessions.length === 0) return;

    setShowWeeklySummary(true);
    localStorage.setItem(weekKey, 'true');
  }, [user, sessions]);

  // Timer for active session — uses ref to avoid stale closure
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      
      const duration = Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000);
      
      // Auto-stop session after max duration
      if (duration >= MAX_SESSION_DURATION) {
        handleSessionEndRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!user || !user.onboarded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          // Space to toggle session (only on tracker tab)
          if (activeTab === 'tracker') {
            e.preventDefault();
            if (activeSession) {
              handleSessionEndRef.current?.();
            } else {
              handleSessionStart();
            }
          }
          break;
        case 'Digit1':
        case 'Numpad1':
          e.preventDefault();
          setActiveTab('tracker');
          break;
        case 'Digit2':
        case 'Numpad2':
          e.preventDefault();
          setActiveTab('analytics');
          break;
        case 'Digit3':
        case 'Numpad3':
          e.preventDefault();
          setActiveTab('history');
          break;
        case 'Digit4':
        case 'Numpad4':
          e.preventDefault();
          setActiveTab('achievements');
          break;
        case 'Digit5':
        case 'Numpad5':
          e.preventDefault();
          setActiveTab('leaderboard');
          break;
        case 'Escape':
          // Close any open modal
          if (completedSession) {
            e.preventDefault();
            setCompletedSession(null);
          } else if (showShortcutsModal) {
            e.preventDefault();
            setShowShortcutsModal(false);
          }
          break;
        case 'Slash':
          // "?" key opens shortcuts modal (Shift + /)
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcutsModal(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, activeSession, completedSession, showShortcutsModal]);

  // Check achievements only after a session is completed (not on every render)
  const checkAndUpdateAchievements = useCallback(async (updatedSessions: Session[], currentStreak?: number) => {
    if (updatedSessions.length === 0 || !user) return;

    const updatedAchievements = AchievementUtils.checkAchievements(updatedSessions, achievements, currentStreak);

    // Save newly unlocked achievements to Supabase
    const newlyUnlocked = updatedAchievements.filter(
      achievement => achievement.unlockedAt && !achievements.find(a => a.id === achievement.id && a.unlockedAt)
    );

    for (const achievement of newlyUnlocked) {
      try {
        await DatabaseUtils.unlockAchievement(user.id, achievement.id);
        GA.event('Achievement Unlocked', {
          achievementId: achievement.id,
          achievementTitle: achievement.title,
        });
      } catch (err) {
        console.error('Failed to unlock achievement:', err);
      }
    }

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
      
      // Celebrate with confetti + haptic! 🎉
      Haptics.achievement();
      if (newlyUnlocked.length === 1) {
        // Single achievement - use rarity-based celebration
        const achievement = newlyUnlocked[0];
        const rarity = getAchievementRarity(achievement.threshold, achievement.id);
        celebrateAchievement(rarity);
      } else {
        // Multiple achievements at once - special multi celebration
        celebrateMultipleAchievements(newlyUnlocked.length);
      }
    }
  }, [user, achievements]);

  // Countdown effect for cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleSessionStart = async () => {
    if (!user || activeSession) return;

    // Client-side rate limit: minimum 10 seconds between sessions
    const lastSession = sessions[0]; // sessions are sorted desc
    if (lastSession && lastSession.endTime) {
      const timeSinceLastSession = Date.now() - lastSession.endTime.getTime();
      if (timeSinceLastSession < 10000) {
        const remaining = Math.ceil((10000 - timeSinceLastSession) / 1000);
        setCooldownRemaining(remaining);
        return;
      }
    }

    const newSession: Session = {
      id: uuidv4(),
      userId: user.id,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      earnings: 0,
      isActive: true
    };

    try {
      await DatabaseUtils.createSession(newSession);
      setActiveSession(newSession);
      Haptics.sessionStart();
      GA.event('Session Started', { sessionId: newSession.id });
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleSessionEnd = useCallback(async () => {
    if (!activeSession || !user) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000);
    const earnings = CalculationUtils.calculateEarnings(user.hourlyWage, duration);

    try {
      await DatabaseUtils.endSession(activeSession.id, endTime, duration, earnings);

      // Update streak after session ends
      const streakResult = await DatabaseUtils.updateStreak(user.id);
      
      // Update user state with new streak values (including freeze count)
      setUser(prevUser => prevUser ? {
        ...prevUser,
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        lastSessionDate: new Date(),
        streakFreezes: streakResult.streakFreezes
      } : null);

      const finishedSession: Session = {
        ...activeSession,
        endTime,
        duration,
        earnings,
        isActive: false
      };

      const updatedSessions = [...sessions, finishedSession];
      setSessions(updatedSessions);
      setActiveSession(null);
      Haptics.sessionEnd();
      
      // Show share modal with completed session
      setCompletedSession(finishedSession);
      
      // Track session completed
      GA.event('Session Completed', {
        duration: finishedSession.duration,
        earnings: finishedSession.earnings,
        streak: streakResult.currentStreak,
      });

      if (streakResult.freezeGranted) {
        GA.event('Streak Freeze Earned', { streak: streakResult.currentStreak });
        celebrateStreakFreeze();
      }
      if (streakResult.freezeConsumed) {
        GA.event('Streak Freeze Used', { streak: streakResult.currentStreak });
      }

      // Session completed — cancel today's streak reminder (already done), schedule for tomorrow
      NotificationUtils.cancelStreakReminder();
      if (streakResult.currentStreak > 0) {
        NotificationUtils.scheduleStreakReminder(streakResult.currentStreak);
      }

      // Check achievements after session completion (including streak achievements)
      checkAndUpdateAchievements(updatedSessions, streakResult.currentStreak);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [activeSession, user, sessions, checkAndUpdateAchievements]);

  // Keep ref updated so timer always calls the latest version
  useEffect(() => {
    handleSessionEndRef.current = handleSessionEnd;
  }, [handleSessionEnd]);

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await DatabaseUtils.updateUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleExportData = (format: 'json' | 'csv' = 'json') => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      // CSV export for sessions only
      const headers = ['date', 'start_time', 'end_time', 'duration_seconds', 'earnings'];
      const rows = sessions
        .filter(s => !s.isActive && s.endTime)
        .map(s => [
          s.startTime.toISOString().split('T')[0],
          s.startTime.toISOString(),
          s.endTime?.toISOString() || '',
          s.duration.toString(),
          s.earnings.toFixed(2)
        ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backlog-sessions-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // JSON export (includes user profile)
      const exportData = {
        user,
        sessions,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backlog-data-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUserId(null);
    setUser(null);
    setSessions([]);
    setActiveSession(null);
  };

  const handleClearData = async () => {
    if (!authUserId) return;
    try {
      // Actually delete all user data from Supabase (sessions, achievements, cosmetics, reset profile)
      await DatabaseUtils.deleteAllUserData(authUserId);
    } catch (error) {
      console.error('Failed to delete user data:', error);
      // Still sign out even if deletion fails
    }
    await supabase.auth.signOut();
    setAuthUserId(null);
    setUser(null);
    setSessions([]);
    setActiveSession(null);
    setAchievements([]);
  };

  // Calculate current session stats - ensure non-negative values
  const currentDuration = activeSession 
    ? Math.max(0, Math.floor((currentTime - activeSession.startTime.getTime()) / 1000))
    : 0;
  
  const currentEarnings = activeSession && user
    ? Math.max(0, CalculationUtils.calculateEarnings(user.hourlyWage, currentDuration))
    : 0;

  // Leaderboard loading is handled entirely by the Leaderboard component

  // Show password reset page if token is present
  if (resetPasswordToken) {
    return (
      <ResetPassword
        token={resetPasswordToken}
        supabaseUrl={supabaseUrl}
        onSuccess={() => {
          setResetPasswordToken(null);
          // Clear URL params
          window.history.replaceState({}, '', '/');
          setShowAuth(true);
          setAuthDefaultLogin(true);
        }}
        onBack={() => {
          setResetPasswordToken(null);
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  // Show nothing (blank screen) while we check auth to avoid landing page flash (#91)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show landing page or auth if not logged in
  if (!authUserId) {
    if (showAuth) {
      return (
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 pt-6">
            <button
              onClick={() => setShowAuth(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors text-sm mb-4 flex items-center gap-1"
            >
              ← Back to home
            </button>
          </div>
          <Auth onAuthSuccess={(userId) => setAuthUserId(userId)} defaultIsLogin={authDefaultLogin} />
        </div>
      );
    }
    return (
      <LandingPage
        onGetStarted={(mode) => {
          setAuthDefaultLogin(mode === 'login');
          setShowAuth(true);
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show onboarding if user hasn't completed it
  if (!user.onboarded) {
    return (
      <Onboarding
        onComplete={async (salary, salaryPeriod, hourlyWage) => {
          try {
            const updatedUser = { ...user, salary, salaryPeriod, hourlyWage, onboarded: true };
            await DatabaseUtils.updateUser(updatedUser);
            setUser(updatedUser);
            GA.event('Onboarding Completed', { salaryPeriod });
            
            // Show tutorial after onboarding (check if not shown before)
            const tutorialShown = localStorage.getItem('tutorialShown');
            if (!tutorialShown) {
              setShowTutorial(true);
            }
          } catch (error) {
            console.error('Failed to save onboarding:', error);
            throw error;
          }
        }}
      />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <SessionTracker
            user={user}
            activeSession={activeSession}
            onSessionStart={handleSessionStart}
            onSessionEnd={handleSessionEnd}
            currentEarnings={currentEarnings}
            currentDuration={currentDuration}
            cooldownRemaining={cooldownRemaining}
          />
        );
      case 'analytics':
        return (
          <Suspense fallback={<AnalyticsSkeleton />}>
            <Analytics
              sessions={sessions}
              currentStreak={user.currentStreak}
              longestStreak={user.longestStreak}
            />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<SessionHistorySkeleton />}>
            <SessionHistory sessions={sessions} onExport={handleExportData} />
          </Suspense>
        );
      case 'achievements':
        return (
          <Suspense fallback={<AchievementsSkeleton />}>
            <Achievements achievements={achievements} sessions={sessions} currentStreak={user.currentStreak} streakFreezes={user.streakFreezes || 0} />
          </Suspense>
        );
      case 'leaderboard':
        return (
          <Suspense fallback={<LeaderboardSkeleton />}>
            <Leaderboard currentUserId={user.id} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<ProfileSkeleton />}>
            <Profile
              user={user}
              onUpdateUser={handleUpdateUser}
              onExportData={handleExportData}
              onClearData={handleClearData}
              onSignOut={handleSignOut}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Offline indicator */}
      <OfflineIndicator />
      
      <div className="container mx-auto pb-20 md:pb-6">
        {/* Enhanced Header */}
        <div className="text-center py-8 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl blur-2xl" />
          
          <div className="relative">
            {/* Profile Button - Top Left within content */}
            <button
              onClick={() => setActiveTab(activeTab === 'profile' ? 'tracker' : 'profile')}
              aria-label={activeTab === 'profile' ? 'Close profile' : 'View profile'}
              className={`absolute top-0 left-0 z-50 p-3 backdrop-blur-lg rounded-xl border transition-all duration-300 shadow-lg ${
                activeTab === 'profile'
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/30'
                  : 'bg-black/30 border-slate-600/30 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Top Right Buttons */}
            <div className="absolute top-0 right-0 z-50 flex items-center gap-2">
              {/* Keyboard Shortcuts Button - Desktop Only */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                aria-label="View keyboard shortcuts"
                className="hidden md:flex p-3 backdrop-blur-lg rounded-xl border border-slate-600/30 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/30 transition-all duration-300 shadow-lg"
                title="Keyboard shortcuts (?)"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                aria-label="Sign out of account"
                className="p-3 backdrop-blur-lg rounded-xl border border-slate-600/30 text-slate-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-400/30 transition-all duration-300 shadow-lg"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
              backlog
            </h1>
            {/* <p className="text-slate-300 text-lg font-medium mb-2">
              Premium anonymous break time tracking
            </p> */}
            {/* <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-purple-300 text-sm">Elite Edition</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </div> */}
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 px-4">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main content with consistent width */}
        <div className="w-full max-w-md mx-auto px-4">
          <div className="w-full">
            {renderActiveTab()}
          </div>
        </div>
      </div>

      {/* Footer — hidden on mobile where bottom nav occupies the same space */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 border-t border-slate-700/30 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 text-center">
          <a
            href="https://ayaanpupala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            built by dytto
          </a>
        </div>
      </div>

      {/* Share session modal */}
      {completedSession && (
        <ShareSessionModal
          session={completedSession}
          currentStreak={user.currentStreak}
          onClose={() => {
            setCompletedSession(null);
            // After share modal — offer notification opt-in if:
            //   • never asked before
            //   • not already enabled
            //   • permission not denied
            const alreadyAsked = localStorage.getItem(NOTIF_PROMPT_KEY);
            const alreadyEnabled = NotificationUtils.isEnabled();
            const permission = NotificationUtils.getPermission();
            if (!alreadyAsked && !alreadyEnabled && permission !== 'denied' && permission !== 'unsupported') {
              setShowNotificationPrompt(true);
            }
          }}
        />
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* PWA install prompt */}
      <InstallPrompt sessionCount={sessions.filter(s => !s.isActive).length} />

      {/* Welcome back modal for dormant users */}
      {user && (
        <WelcomeBackModal
          user={user}
          sessions={sessions}
          onDismiss={() => {}}
          onStartSession={() => setActiveTab('tracker')}
        />
      )}

      {/* Tutorial modal for first-time users */}
      {showTutorial && (
        <TutorialModal
          onClose={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorialShown', 'true');
            GA.event('Tutorial Completed', {});
          }}
        />
      )}

      {/* Notification opt-in prompt — shown once after first session if not already enabled */}
      {showNotificationPrompt && user && (
        <NotificationPrompt
          streakDays={user.currentStreak || 1}
          onAccept={() => {
            localStorage.setItem(NOTIF_PROMPT_KEY, 'true');
            setShowNotificationPrompt(false);
            GA.event('Notifications Enabled via Prompt', { streak: user.currentStreak });
          }}
          onDismiss={() => {
            localStorage.setItem(NOTIF_PROMPT_KEY, 'true');
            setShowNotificationPrompt(false);
            GA.event('Notifications Prompt Dismissed', { streak: user.currentStreak });
          }}
        />
      )}

      {/* Weekly earnings summary — Monday morning recap */}
      {showWeeklySummary && user && (
        <WeeklySummaryModal
          user={user}
          sessions={sessions}
          onClose={() => {
            setShowWeeklySummary(false);
            GA.event('Weekly Summary Dismissed', {});
          }}
        />
      )}
    </div>
  );
}

export default App;
