import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, Star, Zap, Flame, Diamond, Sparkles, Shield, DollarSign, Clock, BarChart3, Calendar } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { CalculationUtils } from '../utils/calculations';
import { DatabaseUtils } from '../utils/database';
import { supabase } from '../utils/supabase';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onPurchaseCosmetic?: (cosmeticId: string) => Promise<void>;
  userOwnedCosmetics?: string[];
}

// Cosmetic items that can be purchased/unlocked
const COSMETICS = {
  frames: [
    { id: 'default', name: 'Default', price: 0, gradient: 'from-slate-500/20 to-slate-600/20', border: 'border-slate-500/30' },
    { id: 'gold', name: 'Golden Aura', price: 99, gradient: 'from-yellow-400/30 to-amber-500/30', border: 'border-yellow-400/50' },
    { id: 'diamond', name: 'Diamond Elite', price: 299, gradient: 'from-cyan-400/30 to-blue-500/30', border: 'border-cyan-400/50' },
    { id: 'fire', name: 'Blazing Fire', price: 199, gradient: 'from-red-500/30 to-orange-500/30', border: 'border-red-400/50' },
    { id: 'cosmic', name: 'Cosmic Energy', price: 699, gradient: 'from-purple-500/30 to-pink-500/30', border: 'border-purple-400/50' },
  ],
  badges: [
    { id: 'none', name: 'None', price: 0, icon: null },
    { id: 'star', name: 'Rising Star', price: 99, icon: Star, color: 'text-yellow-400' },
    { id: 'lightning', name: 'Speed Demon', price: 149, icon: Zap, color: 'text-blue-400' },
    { id: 'flame', name: 'On Fire', price: 199, icon: Flame, color: 'text-red-400' },
    { id: 'diamond', name: 'Diamond Pro', price: 299, icon: Diamond, color: 'text-cyan-400' },
    { id: 'shield', name: 'Elite Guard', price: 349, icon: Shield, color: 'text-purple-400' },
  ],
  titles: [
    { id: 'none', name: 'None', price: 0, text: '' },
    { id: 'rookie', name: 'The Rookie', price: 49, text: 'The Rookie' },
    { id: 'grinder', name: 'The Grinder', price: 99, text: 'The Grinder' },
    { id: 'legend', name: 'Living Legend', price: 199, text: 'Living Legend' },
    { id: 'master', name: 'Poop Master', price: 299, text: 'Poop Master' },
    { id: 'emperor', name: 'Toilet Emperor', price: 499, text: 'Toilet Emperor' },
  ]
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserId }) => {
  const [sortBy, setSortBy] = useState<'earnings' | 'time' | 'sessions'>('earnings');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
  const [showCosmetics, setShowCosmetics] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [userOwnedCosmetics, setUserOwnedCosmetics] = useState<string[]>([]);
  const [equippedCosmetics, setEquippedCosmetics] = useState<{ frame: string; badge: string; title: string }>({ frame: 'default', badge: 'none', title: 'none' });

  // Load user cosmetics on mount and handle payment success
  useEffect(() => {
    const loadUserCosmetics = async () => {
      try {
        const owned = await DatabaseUtils.getUserCosmetics(currentUserId);
        setUserOwnedCosmetics(owned);
      } catch (error) {
        console.error('Error loading owned cosmetics:', error);
      }

      try {
        // Load equipped cosmetics (may not exist for new users)
        const { data: equipped, error: equippedError } = await supabase
          .from('user_equipped_cosmetics')
          .select('frame_id, badge_id, title_id')
          .eq('user_id', currentUserId)
          .limit(1);

        if (equippedError) {
          console.error('Error loading equipped cosmetics:', equippedError);
          // Continue without equipped cosmetics - user will have default
          return;
        }

        if (equipped && equipped.length > 0) {
          const eq = equipped[0];
          setEquippedCosmetics({
            frame: eq.frame_id || 'default',
            badge: eq.badge_id || 'none',
            title: eq.title_id || 'none'
          });
        }
      } catch (error) {
        console.error('Error loading equipped cosmetics:', error);
      }
    };

    // Handle payment success redirect
    const handlePaymentSuccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const cosmeticId = params.get('cosmetic');
      const cosmeticType = params.get('type');

      if (paymentStatus === 'success' && cosmeticId) {
        try {
          // Mark cosmetic as purchased
          await DatabaseUtils.purchaseCosmetic(currentUserId, cosmeticId);

          // Reload cosmetics
          const owned = await DatabaseUtils.getUserCosmetics(currentUserId);
          setUserOwnedCosmetics(owned);

          // Show success message
          alert('Purchase successful! Your cosmetic is now available.');

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error processing payment:', error);
          alert('Failed to save your purchase. Please contact support.');
        }
      } else if (paymentStatus === 'cancelled') {
        alert('Payment cancelled.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    loadUserCosmetics();
    handlePaymentSuccess();
  }, [currentUserId]);

  const handlePurchaseCosmetic = async (
    cosmeticId: string,
    cosmeticType: 'frame' | 'badge' | 'title',
    price: number,
    name: string
  ) => {
    try {
      setPurchasingId(cosmeticId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            cosmeticId,
            cosmeticType,
            price,
            name,
            userId: currentUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to create checkout session';
        console.error('Checkout error response:', data);
        throw new Error(errorMsg);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Failed to process purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPurchasingId(null);
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'earnings':
        return b.totalEarnings - a.totalEarnings;
      case 'time':
        return b.totalTime - a.totalTime;
      case 'sessions':
        return b.sessionCount - a.sessionCount;
      default:
        return 0;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300 drop-shadow-lg" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600 drop-shadow-lg" />;
      default:
        return <span className="text-slate-400 font-bold text-lg">#{rank}</span>;
    }
  };

  const getUserCosmetics = (userId: string) => {
    // Only show equipped cosmetics for current user
    if (userId === currentUserId) {
      return equippedCosmetics;
    }
    return { frame: 'default', badge: 'none', title: 'none' };
  };

  const getFrameStyle = (frameId: string) => {
    const frame = COSMETICS.frames.find(f => f.id === frameId) || COSMETICS.frames[0];
    return { gradient: frame.gradient, border: frame.border };
  };

  const getBadgeComponent = (badgeId: string) => {
    const badge = COSMETICS.badges.find(b => b.id === badgeId);
    if (!badge || !badge.icon) return null;
    const IconComponent = badge.icon;
    return <IconComponent className={`w-5 h-5 ${badge.color} drop-shadow-lg`} />;
  };

  const getTitleText = (titleId: string) => {
    const title = COSMETICS.titles.find(t => t.id === titleId);
    return title?.text || '';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/20 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400/30 to-amber-500/30 rounded-3xl border-2 border-yellow-400/50 mb-6 shadow-xl shadow-yellow-500/20">
            <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent mb-3">
            Global Leaderboard
          </h2>
          <p className="text-slate-300 text-lg">
            Anonymous rankings across all users
          </p>
          {/* <div className="flex items-center justify-center mt-4 space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm font-medium">Featuring Premium Cosmetics</span>
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div> */}
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="space-y-4">
        {/* Sort by */}
        <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-500/20 shadow-lg">
          <div className="flex">
            {[
              { key: 'earnings', label: 'Earnings', Icon: DollarSign },
              { key: 'time', label: 'Time', Icon: Clock },
              { key: 'sessions', label: 'Sessions', Icon: BarChart3 }
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  sortBy === key
                    ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-400/40 shadow-lg shadow-indigo-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Time frame */}
        <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-500/20 shadow-lg">
          <div className="flex">
            {[
              { key: 'daily', label: 'Daily', Icon: Calendar },
              { key: 'weekly', label: 'Weekly', Icon: Calendar },
              { key: 'alltime', label: 'All Time', Icon: Trophy }
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTimeFrame(key as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  timeFrame === key
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-400/40 shadow-lg shadow-purple-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cosmetics Shop Button */}
        <button
          onClick={() => setShowCosmetics(!showCosmetics)}
          className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center justify-center">
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-semibold">Cosmetics Shop</span>
            <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
          </div>
        </button>
      </div>

      {/* Cosmetics Shop */}
      {showCosmetics && (
        <div className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Premium Cosmetics
          </h3>
          
          <div className="space-y-6">
            {/* Frames */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                Profile Frames
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {COSMETICS.frames.slice(1).map(frame => {
                  const isOwned = userOwnedCosmetics.includes(frame.id);
                  return (
                    <div key={frame.id} className={`bg-gradient-to-br ${frame.gradient} backdrop-blur-lg rounded-xl p-4 border ${frame.border} shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}>
                      <div className="text-white font-semibold text-sm">{frame.name}</div>
                      <div className="text-yellow-400 text-xs mt-2">${(frame.price / 100).toFixed(2)}</div>
                      <button
                        onClick={() => !isOwned && handlePurchaseCosmetic(frame.id, 'frame', frame.price, frame.name)}
                        disabled={purchasingId === frame.id || isOwned}
                        className="mt-2 w-full bg-yellow-500/30 hover:bg-yellow-500/50 disabled:opacity-50 text-yellow-300 text-xs py-1 rounded transition-colors"
                      >
                        {purchasingId === frame.id ? 'Processing...' : isOwned ? 'Owned' : 'Buy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                Profile Badges
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {COSMETICS.badges.slice(1).map(badge => {
                  const IconComponent = badge.icon!;
                  const isOwned = userOwnedCosmetics.includes(badge.id);
                  return (
                    <div key={badge.id} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-600/30 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="flex items-center mb-2">
                        <IconComponent className={`w-4 h-4 mr-2 ${badge.color}`} />
                        <div className="text-white font-semibold text-sm">{badge.name}</div>
                      </div>
                      <div className="text-yellow-400 text-xs">${(badge.price / 100).toFixed(2)}</div>
                      <button
                        onClick={() => !isOwned && handlePurchaseCosmetic(badge.id, 'badge', badge.price, badge.name)}
                        disabled={purchasingId === badge.id || isOwned}
                        className="mt-2 w-full bg-blue-500/30 hover:bg-blue-500/50 disabled:opacity-50 text-blue-300 text-xs py-1 rounded transition-colors"
                      >
                        {purchasingId === badge.id ? 'Processing...' : isOwned ? 'Owned' : 'Buy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Titles */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                Profile Titles
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {COSMETICS.titles.slice(1).map(title => {
                  const isOwned = userOwnedCosmetics.includes(title.id);
                  return (
                    <div key={title.id} className="bg-gradient-to-r from-purple-700/30 to-pink-700/30 backdrop-blur-lg rounded-xl p-4 border border-purple-600/30 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div className="text-purple-300 font-semibold">"{title.text}"</div>
                        <div className="text-yellow-400 text-sm">${(title.price / 100).toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => !isOwned && handlePurchaseCosmetic(title.id, 'title', title.price, title.name)}
                        disabled={purchasingId === title.id || isOwned}
                        className="mt-2 w-full bg-purple-500/30 hover:bg-purple-500/50 disabled:opacity-50 text-purple-300 text-xs py-1 rounded transition-colors"
                      >
                        {purchasingId === title.id ? 'Processing...' : isOwned ? 'Owned' : 'Buy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Leaderboard entries */}
      <div className="space-y-4">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-12 border border-slate-500/20 shadow-xl">
              <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-6" />
              <p className="text-slate-400 text-lg mb-2">No leaderboard data available yet</p>
              <p className="text-slate-500">
                Enable leaderboard visibility in your profile to participate
              </p>
            </div>
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.userId === currentUserId;
            const cosmetics = getUserCosmetics(entry.userId);
            const frameStyle = getFrameStyle(cosmetics.frame);
            const badge = getBadgeComponent(cosmetics.badge);
            const title = getTitleText(cosmetics.title);

            return (
              <div
                key={entry.userId}
                className={`relative overflow-hidden rounded-3xl transition-all duration-500 transform hover:scale-[1.02] ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-emerald-600/20 border-2 border-emerald-400/40 shadow-2xl shadow-emerald-500/20'
                    : rank <= 3
                    ? `bg-gradient-to-br ${frameStyle.gradient} border-2 ${frameStyle.border} shadow-2xl`
                    : `bg-gradient-to-br ${frameStyle.gradient} border ${frameStyle.border} shadow-lg hover:shadow-xl`
                }`}
              >
                {/* Animated background for top 3 */}
                {rank <= 3 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                )}

                {/* Current user indicator */}
                {isCurrentUser && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 shadow-lg">
                    YOU
                  </div>
                )}

                <div className="relative p-6">
                  <div className="flex items-center gap-6">
                    {/* Rank with enhanced styling */}
                    <div className="flex items-center justify-center w-16 h-16 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
                      {getRankIcon(rank)}
                    </div>

                    {/* User info with cosmetics */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {badge}
                        <div className="font-bold text-white text-lg">
                          {entry.nickname || `User ${entry.userId.slice(0, 8)}`}
                        </div>
                      </div>
                      {title && (
                        <div className="text-purple-300 text-sm font-medium mb-1 italic">
                          "{title}"
                        </div>
                      )}
                      <div className="text-slate-400 text-sm">
                        {entry.sessionCount} sessions completed
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="font-bold text-white text-xl mb-1">
                        {sortBy === 'earnings' && CalculationUtils.formatCurrency(entry.totalEarnings)}
                        {sortBy === 'time' && CalculationUtils.formatDuration(entry.totalTime)}
                        {sortBy === 'sessions' && entry.sessionCount}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {sortBy === 'earnings' && `${CalculationUtils.formatDuration(entry.totalTime)} total`}
                        {sortBy === 'time' && `${CalculationUtils.formatCurrency(entry.totalEarnings)} earned`}
                        {sortBy === 'sessions' && `${CalculationUtils.formatCurrency(entry.totalEarnings)} earned`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
