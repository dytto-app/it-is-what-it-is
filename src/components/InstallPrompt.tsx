import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { Analytics as GA } from '../utils/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  sessionCount: number;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ sessionCount }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('backlog-install-dismissed');
    if (dismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      GA.event('PWA Installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Show prompt after user has completed at least 2 sessions
  useEffect(() => {
    if (deferredPrompt && sessionCount >= 2 && !isInstalled) {
      // Small delay so it doesn't appear immediately
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, sessionCount, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        GA.event('PWA Install Accepted');
      } else {
        GA.event('PWA Install Dismissed');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('backlog-install-dismissed', 'true');
    GA.event('PWA Install Banner Dismissed');
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-md mx-auto bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-blue-600/95 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl shadow-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-white/20 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-semibold text-sm">Install Back-log</span>
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </div>
              <p className="text-white/80 text-xs">
                Quick access from your home screen
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
