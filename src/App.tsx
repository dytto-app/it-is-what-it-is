import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Session, Achievement, LeaderboardEntry } from './types';
import { StorageUtils } from './utils/storage';
import { CalculationUtils } from './utils/calculations';
import { AchievementUtils } from './utils/achievements';
import { SessionTracker } from './components/SessionTracker';
import { Analytics } from './components/Analytics';
import { SessionHistory } from './components/SessionHistory';
import { Achievements } from './components/Achievements';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Navigation } from './components/Navigation';

type TabType = 'tracker' | 'analytics' | 'history' | 'achievements' | 'leaderboard' | 'profile';

const MAX_SESSION_DURATION = 30 * 60; // 30 minutes in seconds

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('tracker');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Initialize user and load data
  useEffect(() => {
    let existingUser = StorageUtils.getUser();
    
    if (!existingUser) {
      existingUser = {
        id: uuidv4(),
        hourlyWage: 20, // Default wage
        createdAt: new Date(),
        showOnLeaderboard: false
      };
      StorageUtils.saveUser(existingUser);
    }
    
    setUser(existingUser);
    setSessions(StorageUtils.getSessions());
    setActiveSession(StorageUtils.getActiveSession());
    
    const existingAchievements = StorageUtils.getAchievements();
    if (existingAchievements.length === 0) {
      const initialAchievements = AchievementUtils.initializeAchievements();
      StorageUtils.saveAchievements(initialAchievements);
      setAchievements(initialAchievements);
    } else {
      setAchievements(existingAchievements);
    }
  }, []);

  // Timer for active session
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      
      const duration = Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000);
      
      // Auto-stop session after max duration
      if (duration >= MAX_SESSION_DURATION) {
        handleSessionEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Check achievements when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      const updatedAchievements = AchievementUtils.checkAchievements(sessions, achievements);
      setAchievements(updatedAchievements);
      StorageUtils.saveAchievements(updatedAchievements);
    }
  }, [sessions.length]);

  const handleSessionStart = () => {
    if (!user || activeSession) return;

    const newSession: Session = {
      id: uuidv4(),
      userId: user.id,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      earnings: 0,
      isActive: true
    };

    setActiveSession(newSession);
    StorageUtils.saveActiveSession(newSession);
  };

  const handleSessionEnd = () => {
    if (!activeSession || !user) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000);
    const earnings = CalculationUtils.calculateEarnings(user.hourlyWage, duration);

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
    
    StorageUtils.saveSessions(updatedSessions);
    StorageUtils.saveActiveSession(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    StorageUtils.saveUser(updatedUser);
  };

  const handleExportData = () => {
    const data = StorageUtils.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paid-to-poop-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    StorageUtils.clearAllData();
    window.location.reload();
  };

  // Calculate current session stats
  const currentDuration = activeSession 
    ? Math.floor((currentTime - activeSession.startTime.getTime()) / 1000)
    : 0;
  
  const currentEarnings = activeSession && user
    ? CalculationUtils.calculateEarnings(user.hourlyWage, currentDuration)
    : 0;

  // Mock leaderboard data (in a real app, this would come from your backend)
  const leaderboardEntries: LeaderboardEntry[] = [
    {
      userId: user?.id || '',
      nickname: user?.nickname || '',
      totalEarnings: sessions.reduce((sum, s) => sum + s.earnings, 0),
      totalTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      sessionCount: sessions.length
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
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
        return <Leaderboard entries={leaderboardEntries} currentUserId={user.id} />;
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
        {/* Header */}
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent mb-2">
            Paid to Poop
          </h1>
          <p className="text-gray-400 text-sm">
            Premium anonymous break time tracking
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6 px-4">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main content */}
        <div className="max-w-md mx-auto">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

export default App;