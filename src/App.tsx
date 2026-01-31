import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User as UserIcon } from 'lucide-react';
import { User, Session, Achievement } from './types';
import { DatabaseUtils } from './utils/database';
import { CalculationUtils } from './utils/calculations';
import { AchievementUtils } from './utils/achievements';
import { SessionTracker } from './components/SessionTracker';
import { Analytics } from './components/Analytics';
import { SessionHistory } from './components/SessionHistory';
import { Achievements } from './components/Achievements';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Navigation } from './components/Navigation';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { supabase } from './utils/supabase';

type TabType = 'tracker' | 'analytics' | 'history' | 'achievements' | 'leaderboard' | 'profile';

const MAX_SESSION_DURATION = 30 * 60; // 30 minutes in seconds

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('tracker');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setAuthUserId(data.session.user.id);
      }
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
        setAchievements(achievementsWithStatus);

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

  // Check achievements only after a session is completed (not on every render)
  const checkAndUpdateAchievements = async (updatedSessions: Session[]) => {
    if (updatedSessions.length === 0 || !user) return;

    const updatedAchievements = AchievementUtils.checkAchievements(updatedSessions, achievements);

    // Save newly unlocked achievements to Supabase
    const newlyUnlocked = updatedAchievements.filter(
      achievement => achievement.unlockedAt && !achievements.find(a => a.id === achievement.id && a.unlockedAt)
    );

    for (const achievement of newlyUnlocked) {
      try {
        await DatabaseUtils.unlockAchievement(user.id, achievement.id);
      } catch (err) {
        console.error('Failed to unlock achievement:', err);
      }
    }

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
    }
  };

  const handleSessionStart = async () => {
    if (!user || activeSession) return;

    // Client-side rate limit: minimum 10 seconds between sessions
    const lastSession = sessions[0]; // sessions are sorted desc
    if (lastSession && lastSession.endTime) {
      const timeSinceLastSession = Date.now() - lastSession.endTime.getTime();
      if (timeSinceLastSession < 10000) {
        console.warn('Session rate limited: please wait before starting a new session');
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

      const completedSession: Session = {
        ...activeSession,
        endTime,
        duration,
        earnings,
        isActive: false
      };

      const updatedSessions = [...sessions, completedSession];
      setSessions(updatedSessions);
      setActiveSession(null);

      // Check achievements after session completion
      checkAndUpdateAchievements(updatedSessions);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [activeSession, user, sessions, achievements]);

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

  const handleExportData = () => {
    const exportData = {
      user,
      sessions,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backlog-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    await supabase.auth.signOut();
    setAuthUserId(null);
    setUser(null);
    setSessions([]);
    setActiveSession(null);
  };

  // Calculate current session stats - ensure non-negative values
  const currentDuration = activeSession 
    ? Math.max(0, Math.floor((currentTime - activeSession.startTime.getTime()) / 1000))
    : 0;
  
  const currentEarnings = activeSession && user
    ? Math.max(0, CalculationUtils.calculateEarnings(user.hourlyWage, currentDuration))
    : 0;

  // Leaderboard loading is handled entirely by the Leaderboard component

  // Show auth if not logged in
  if (!authUserId) {
    return <Auth onAuthSuccess={(userId) => setAuthUserId(userId)} />;
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
          />
        );
      case 'analytics':
        return <Analytics sessions={sessions} />;
      case 'history':
        return <SessionHistory sessions={sessions} onExport={handleExportData} />;
      case 'achievements':
        return <Achievements achievements={achievements} />;
      case 'leaderboard':
        return <Leaderboard entries={[]} currentUserId={user.id} />;
      case 'profile':
        return (
          <Profile
            user={user}
            onUpdateUser={handleUpdateUser}
            onExportData={handleExportData}
            onClearData={handleClearData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto pb-20 md:pb-6">
        {/* Enhanced Header */}
        <div className="text-center py-8 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl blur-2xl" />
          
          <div className="relative">
            {/* Profile Button - Top Left within content */}
            <button
              onClick={() => setActiveTab(activeTab === 'profile' ? 'tracker' : 'profile')}
              className={`absolute top-0 left-0 z-50 p-3 backdrop-blur-lg rounded-xl border transition-all duration-300 shadow-lg ${
                activeTab === 'profile'
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/30'
                  : 'bg-black/30 border-slate-600/30 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </button>
            
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

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-700/30 bg-black/80 backdrop-blur-lg">
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
    </div>
  );
}

export default App;
