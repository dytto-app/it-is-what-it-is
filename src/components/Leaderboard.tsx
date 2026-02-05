import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, Star, Zap, Flame, Diamond, Sparkles, Shield, DollarSign, Clock, BarChart3, Calendar, Check, Heart, Smile } from 'lucide-react';
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

// Cosmetic items — mix of free and paid
const COSMETICS = {
  frames: [
    { id: 'default', name: 'Default', price: 0, gradient: 'from-slate-500/20 to-slate-600/20', border: 'border-slate-500/30', free: true },
    { id: 'clean', name: 'Clean Look', price: 0, gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-400/30', free: true },
    { id: 'neon', name: 'Neon Green', price: 0, gradient: 'from-green-400/30 to-lime-500/30', border: 'border-green-400/50', free: true },
    { id: 'gold', name: 'Golden Aura', price: 99, gradient: 'from-yellow-400/30 to-amber-500/30', border: 'border-yellow-400/50', free: false },
    { id: 'diamond', name: 'Diamond Elite', price: 299, gradient: 'from-cyan-400/30 to-blue-500/30', border: 'border-cyan-400/50', free: false },
    { id: 'fire', name: 'Blazing Fire', price: 199, gradient: 'from-red-500/30 to-orange-500/30', border: 'border-red-400/50', free: false },
    { id: 'cosmic', name: 'Cosmic Energy', price: 699, gradient: 'from-purple-500/30 to-pink-500/30', border: 'border-purple-400/50', free: false },
  ],
  badges: [
    { id: 'none', name: 'None', price: 0, icon: null, color: '', free: true },
    { id: 'newbie', name: 'Newbie', price: 0, icon: Smile, color: 'text-green-400', free: true },
    { id: 'veteran', name: 'Veteran', price: 0, icon: Heart, color: 'text-pink-400', free: true },
    { id: 'star', name: 'Rising Star', price: 99, icon: Star, color: 'text-yellow-400', free: false },
    { id: 'lightning', name: 'Speed Demon', price: 149, icon: Zap, color: 'text-blue-400', free: false },
    { id: 'flame', name: 'On Fire', price: 199, icon: Flame, color: 'text-red-400', free: false },
    { id: 'diamond-badge', name: 'Diamond Pro', price: 299, icon: Diamond, color: 'text-cyan-400', free: false },
    { id: 'shield', name: 'Elite Guard', price: 349, icon: Shield, color: 'text-purple-400', free: false },
  ],
  titles: [
    { id: 'none', name: 'None', price: 0, text: '', free: true },
    { id: 'enthusiast', name: 'Bathroom Enthusiast', price: 0, text: 'Bathroom Enthusiast', free: true },
    { id: 'breaker', name: 'Break Taker', price: 0, text: 'Break Taker', free: true },
    { id: 'rookie', name: 'The Rookie', price: 49, text: 'The Rookie', free: false },
    { id: 'grinder', name: 'The Grinder', price: 99, text: 'The Grinder', free: false },
    { id: 'legend', name: 'Living Legend', price: 199, text: 'Living Legend', free: false },
    { id: 'master', name: 'Poop Master', price: 299, text: 'Poop Master', free: false },
    { id: 'emperor', name: 'Toilet Emperor', price: 499, text: 'Toilet Emperor', free: false },
  ]
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries: initialEntries, currentUserId }) => {
  const [sortBy, setSortBy] = useState<'earnings' | 'time' | 'sessions'>('earnings');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'alltime'>('weekly');
  const [showCosmetics, setShowCosmetics] = useState(false);
  const [activeShopTab, setActiveShopTab] = useState<'inventory' | 'shop'>('inventory');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [userOwnedCosmetics, setUserOwnedCosmetics] = useState<string[]>([]);
  const [equippedCosmetics, setEquippedCosmetics] = useState<{ frame: string; badge: string; title: string }>({ frame: 'default', badge: 'none', title: 'none' });
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  const [equipLoading, setEquipLoading] = useState(false);

  // Load user cosmetics on mount and handle payment success
  useEffect(() => {
    const loadUserCosmetics = async () => {
      try {
        const owned = await DatabaseUtils.getUserCosmetics(currentUserId);
        setUserOwnedCosmetics(owned);

        // Auto-claim free cosmetics the user doesn't own yet
        await autoClaimFreeCosmetics(currentUserId, owned);
      } catch (error) {
        console.error('Error loading owned cosmetics:', error);
      }

      try {
        const { data: equipped, error: equippedError } = await supabase
          .from('user_equipped_cosmetics')
          .select('frame_id, badge_id, title_id')
          .eq('user_id', currentUserId)
          .limit(1);

        if (equippedError) {
          console.error('Error loading equipped cosmetics:', equippedError);
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

    // Handle payment redirect
    const handlePaymentRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');

      if (paymentStatus === 'success') {
        setTimeout(async () => {
          try {
            const owned = await DatabaseUtils.getUserCosmetics(currentUserId);
            setUserOwnedCosmetics(owned);
          } catch (error) {
            console.error('Error reloading cosmetics:', error);
          }
        }, 2000);

        alert('Payment received! Your cosmetic will appear shortly.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'cancelled') {
        alert('Payment cancelled.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    loadUserCosmetics();
    handlePaymentRedirect();
  }, [currentUserId]);

  // Auto-claim free cosmetics
  const autoClaimFreeCosmetics = async (userId: string, currentlyOwned: string[]) => {
    const freeCosmetics = [
      ...COSMETICS.frames.filter(f => f.free && f.id !== 'default'),
      ...COSMETICS.badges.filter(b => b.free && b.id !== 'none'),
      ...COSMETICS.titles.filter(t => t.free && t.id !== 'none'),
    ];

    const unowned = freeCosmetics.filter(c => !currentlyOwned.includes(c.id));
    if (unowned.length === 0) return;

    try {
      const inserts = unowned.map(c => ({
        user_id: userId,
        cosmetic_id: c.id,
      }));

      const { error } = await supabase
        .from('user_cosmetics')
        .upsert(inserts, { onConflict: 'user_id,cosmetic_id' });

      if (error) {
        console.error('Error auto-claiming free cosmetics:', error);
        return;
      }

      // Reload owned cosmetics
      const owned = await DatabaseUtils.getUserCosmetics(userId);
      setUserOwnedCosmetics(owned);
    } catch (error) {
      console.error('Error auto-claiming free cosmetics:', error);
    }
  };

  // Fetch leaderboard data when timeFrame changes
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await DatabaseUtils.getLeaderboard(timeFrame);
        setEntries(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      }
    };

    loadLeaderboard();
  }, [timeFrame]);

  // Equip a cosmetic
  const handleEquip = async (type: 'frame' | 'badge' | 'title', id: string) => {
    setEquipLoading(true);
    try {
      const newEquipped = { ...equippedCosmetics };
      if (type === 'frame') newEquipped.frame = id;
      if (type === 'badge') newEquipped.badge = id;
      if (type === 'title') newEquipped.title = id;

      await DatabaseUtils.equipCosmetics(
        currentUserId,
        newEquipped.frame === 'default' ? null : newEquipped.frame,
        newEquipped.badge === 'none' ? null : newEquipped.badge,
        newEquipped.title === 'none' ? null : newEquipped.title,
      );

      setEquippedCosmetics(newEquipped);
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      alert('Failed to equip cosmetic. Please try again.');
    } finally {
      setEquipLoading(false);
    }
  };

  const handlePurchaseCosmetic = async (
    cosmeticId: string,
    cosmeticType: 'frame' | 'badge' | 'title',
    price: number,
    name: string
  ) => {
    // Free cosmetics — claim directly
    if (price === 0) {
      try {
        setPurchasingId(cosmeticId);
        const { error } = await supabase
          .from('user_cosmetics')
          .upsert({
            user_id: currentUserId,
            cosmetic_id: cosmeticId,
          }, { onConflict: 'user_id,cosmetic_id' });

        if (error) throw error;

        const owned = await DatabaseUtils.getUserCosmetics(currentUserId);
        setUserOwnedCosmetics(owned);
      } catch (error) {
        console.error('Error claiming free cosmetic:', error);
        alert('Failed to claim cosmetic.');
      } finally {
        setPurchasingId(null);
      }
      return;
    }

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
        throw new Error(data.error || 'Failed to create checkout session');
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
      case 'earnings': return b.totalEarnings - a.totalEarnings;
      case 'time': return b.totalTime - a.totalTime;
      case 'sessions': return b.sessionCount - a.sessionCount;
      default: return 0;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />;
      case 2: return <Medal className="w-6 h-6 text-slate-300 drop-shadow-lg" />;
      case 3: return <Award className="w-6 h-6 text-amber-600 drop-shadow-lg" />;
      default: return <span className="text-slate-400 font-bold text-lg">#{rank}</span>;
    }
  };

  const getUserCosmetics = (userId: string) => {
    if (userId === currentUserId) return equippedCosmetics;
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

  // --- Inventory Render ---
  const renderInventory = () => {
    const ownedFrames = COSMETICS.frames.filter(f => f.id === 'default' || userOwnedCosmetics.includes(f.id));
    const ownedBadges = COSMETICS.badges.filter(b => b.id === 'none' || userOwnedCosmetics.includes(b.id));
    const ownedTitles = COSMETICS.titles.filter(t => t.id === 'none' || userOwnedCosmetics.includes(t.id));

    return (
      <div className="space-y-6">
        {/* Preview Card */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-indigo-500/20">
          <p className="text-xs text-slate-400 mb-3 text-center font-medium uppercase tracking-wider">Preview</p>
          <div className={`bg-gradient-to-br ${getFrameStyle(equippedCosmetics.frame).gradient} rounded-2xl p-4 border-2 ${getFrameStyle(equippedCosmetics.frame).border} shadow-lg`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black/30 rounded-xl flex items-center justify-center border border-white/10">
                {getBadgeComponent(equippedCosmetics.badge) || <span className="text-slate-500 text-lg">👤</span>}
              </div>
              <div>
                <div className="text-white font-bold">Your Name</div>
                {getTitleText(equippedCosmetics.title) && (
                  <div className="text-purple-300 text-xs italic">"{getTitleText(equippedCosmetics.title)}"</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Frames */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
            Frames ({ownedFrames.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {ownedFrames.map(frame => {
              const isEquipped = equippedCosmetics.frame === frame.id;
              return (
                <button
                  key={frame.id}
                  onClick={() => !equipLoading && handleEquip('frame', frame.id)}
                  disabled={equipLoading}
                  className={`relative bg-gradient-to-br ${frame.gradient} backdrop-blur-lg rounded-xl p-3 border-2 transition-all duration-200 text-left ${
                    isEquipped
                      ? `${frame.border} ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/20`
                      : 'border-transparent hover:border-slate-500/30'
                  }`}
                >
                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="text-white font-medium text-sm">{frame.name}</div>
                  {frame.free && <div className="text-green-400 text-xs mt-1">FREE</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
            Badges ({ownedBadges.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {ownedBadges.map(badge => {
              const isEquipped = equippedCosmetics.badge === badge.id;
              const IconComponent = badge.icon;
              return (
                <button
                  key={badge.id}
                  onClick={() => !equipLoading && handleEquip('badge', badge.id)}
                  disabled={equipLoading}
                  className={`relative bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-lg rounded-xl p-3 border-2 transition-all duration-200 text-left ${
                    isEquipped
                      ? 'border-indigo-400/50 ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/20'
                      : 'border-transparent hover:border-slate-500/30'
                  }`}
                >
                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {IconComponent ? <IconComponent className={`w-4 h-4 ${badge.color}`} /> : <span className="text-slate-500 text-sm">—</span>}
                    <div className="text-white font-medium text-sm">{badge.name}</div>
                  </div>
                  {badge.free && badge.id !== 'none' && <div className="text-green-400 text-xs mt-1">FREE</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Titles */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
            Titles ({ownedTitles.length})
          </h4>
          <div className="space-y-2">
            {ownedTitles.map(title => {
              const isEquipped = equippedCosmetics.title === title.id;
              return (
                <button
                  key={title.id}
                  onClick={() => !equipLoading && handleEquip('title', title.id)}
                  disabled={equipLoading}
                  className={`relative w-full bg-gradient-to-r from-purple-700/20 to-pink-700/20 backdrop-blur-lg rounded-xl p-3 border-2 transition-all duration-200 text-left ${
                    isEquipped
                      ? 'border-indigo-400/50 ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/20'
                      : 'border-transparent hover:border-slate-500/30'
                  }`}
                >
                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="text-purple-300 font-medium text-sm">
                    {title.text ? `"${title.text}"` : 'None'}
                  </div>
                  {title.free && title.id !== 'none' && <div className="text-green-400 text-xs mt-1">FREE</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- Shop Render ---
  const renderShop = () => {
    const unownedFrames = COSMETICS.frames.filter(f => f.id !== 'default' && !userOwnedCosmetics.includes(f.id));
    const unownedBadges = COSMETICS.badges.filter(b => b.id !== 'none' && !userOwnedCosmetics.includes(b.id));
    const unownedTitles = COSMETICS.titles.filter(t => t.id !== 'none' && !userOwnedCosmetics.includes(t.id));

    const hasUnowned = unownedFrames.length > 0 || unownedBadges.length > 0 || unownedTitles.length > 0;

    if (!hasUnowned) {
      return (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">You own everything!</p>
          <p className="text-slate-500 text-sm mt-1">Check back later for new cosmetics</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Frames */}
        {unownedFrames.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
              Profile Frames
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {unownedFrames.map(frame => (
                <div key={frame.id} className={`bg-gradient-to-br ${frame.gradient} backdrop-blur-lg rounded-xl p-4 border ${frame.border} shadow-lg`}>
                  <div className="text-white font-semibold text-sm">{frame.name}</div>
                  <div className={`text-xs mt-2 ${frame.free ? 'text-green-400 font-bold' : 'text-yellow-400'}`}>
                    {frame.free ? 'FREE' : `$${(frame.price / 100).toFixed(2)}`}
                  </div>
                  <button
                    onClick={() => handlePurchaseCosmetic(frame.id, 'frame', frame.price, frame.name)}
                    disabled={purchasingId === frame.id}
                    className={`mt-2 w-full ${frame.free ? 'bg-green-500/30 hover:bg-green-500/50 text-green-300' : 'bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300'} disabled:opacity-50 text-xs py-1.5 rounded-lg transition-colors font-medium`}
                  >
                    {purchasingId === frame.id ? 'Processing...' : frame.free ? 'Claim' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {unownedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
              Profile Badges
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {unownedBadges.map(badge => {
                const IconComponent = badge.icon!;
                return (
                  <div key={badge.id} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-600/30 shadow-lg">
                    <div className="flex items-center mb-2">
                      {IconComponent && <IconComponent className={`w-4 h-4 mr-2 ${badge.color}`} />}
                      <div className="text-white font-semibold text-sm">{badge.name}</div>
                    </div>
                    <div className={`text-xs ${badge.free ? 'text-green-400 font-bold' : 'text-yellow-400'}`}>
                      {badge.free ? 'FREE' : `$${(badge.price / 100).toFixed(2)}`}
                    </div>
                    <button
                      onClick={() => handlePurchaseCosmetic(badge.id, 'badge', badge.price, badge.name)}
                      disabled={purchasingId === badge.id}
                      className={`mt-2 w-full ${badge.free ? 'bg-green-500/30 hover:bg-green-500/50 text-green-300' : 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-300'} disabled:opacity-50 text-xs py-1.5 rounded-lg transition-colors font-medium`}
                    >
                      {purchasingId === badge.id ? 'Processing...' : badge.free ? 'Claim' : 'Buy'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Titles */}
        {unownedTitles.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
              Profile Titles
            </h4>
            <div className="space-y-3">
              {unownedTitles.map(title => (
                <div key={title.id} className="bg-gradient-to-r from-purple-700/30 to-pink-700/30 backdrop-blur-lg rounded-xl p-4 border border-purple-600/30 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-purple-300 font-semibold">"{title.text}"</div>
                    <div className={`text-sm ${title.free ? 'text-green-400 font-bold' : 'text-yellow-400'}`}>
                      {title.free ? 'FREE' : `$${(title.price / 100).toFixed(2)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePurchaseCosmetic(title.id, 'title', title.price, title.name)}
                    disabled={purchasingId === title.id}
                    className={`mt-2 w-full ${title.free ? 'bg-green-500/30 hover:bg-green-500/50 text-green-300' : 'bg-purple-500/30 hover:bg-purple-500/50 text-purple-300'} disabled:opacity-50 text-xs py-1.5 rounded-lg transition-colors font-medium`}
                  >
                    {purchasingId === title.id ? 'Processing...' : title.free ? 'Claim' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/20 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400/30 to-amber-500/30 rounded-3xl border-2 border-yellow-400/50 mb-6 shadow-xl shadow-yellow-500/20">
            <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent mb-3">
            The Podium
          </h2>
        </div>
      </div>

      {/* Controls */}
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
                onClick={() => setSortBy(key as 'earnings' | 'time' | 'sessions')}
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
                onClick={() => setTimeFrame(key as 'daily' | 'weekly' | 'alltime')}
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

        {/* Cosmetics Button */}
        <button
          onClick={() => setShowCosmetics(!showCosmetics)}
          className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-400/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center justify-center">
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-semibold">{showCosmetics ? 'Hide Cosmetics' : 'Cosmetics'}</span>
            <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
          </div>
        </button>
      </div>

      {/* Cosmetics Panel — Inventory + Shop */}
      {showCosmetics && (
        <div className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-2xl">
          {/* Tab switcher */}
          <div className="flex mb-6 bg-black/40 rounded-xl p-1 border border-slate-600/20">
            <button
              onClick={() => setActiveShopTab('inventory')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeShopTab === 'inventory'
                  ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Cosmetics
            </button>
            <button
              onClick={() => setActiveShopTab('shop')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeShopTab === 'shop'
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Shop
            </button>
          </div>

          {activeShopTab === 'inventory' ? renderInventory() : renderShop()}
        </div>
      )}

      {/* Leaderboard entries */}
      <div className="space-y-4">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-12 border border-slate-500/20 shadow-xl">
              <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-6" />
              <p className="text-slate-400 text-lg mb-2">No leaderboard data available yet</p>
              <p className="text-slate-500">Enable leaderboard visibility in your profile to participate</p>
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
                {rank <= 3 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                )}

                {isCurrentUser && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 shadow-lg">
                    YOU
                  </div>
                )}

                <div className="relative p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
                      {getRankIcon(rank)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {badge}
                        <div className="font-bold text-white text-lg">
                          {entry.nickname || `User ${entry.userId.slice(0, 8)}`}
                        </div>
                      </div>
                      {title && (
                        <div className="text-purple-300 text-sm font-medium mb-1 italic">"{title}"</div>
                      )}
                      <div className="text-slate-400 text-sm">{entry.sessionCount} sessions completed</div>
                    </div>

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
