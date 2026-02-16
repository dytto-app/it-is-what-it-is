import React from 'react';

// Base skeleton primitives
export const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`} />
);

export const SkeletonText: React.FC<{ width?: string; className?: string }> = ({ 
  width = 'w-full', 
  className = '' 
}) => (
  <div className={`animate-pulse bg-slate-700/50 h-4 rounded ${width} ${className}`} />
);

export const SkeletonCircle: React.FC<{ size?: string; className?: string }> = ({ 
  size = 'w-10 h-10', 
  className = '' 
}) => (
  <div className={`animate-pulse bg-slate-700/50 rounded-full ${size} ${className}`} />
);

// Header skeleton (common across all pages)
const SkeletonHeader: React.FC<{ color: string }> = ({ color }) => (
  <div className="text-center relative">
    <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-3xl blur-xl opacity-50`} />
    <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
      <div className="flex justify-center mb-6">
        <SkeletonCircle size="w-20 h-20" className="rounded-3xl" />
      </div>
      <SkeletonText width="w-48" className="mx-auto h-8 mb-3" />
      <div className="flex items-center justify-center mt-4 space-x-2">
        <SkeletonCircle size="w-4 h-4" />
        <SkeletonText width="w-20" className="h-3" />
        <SkeletonCircle size="w-4 h-4" />
      </div>
    </div>
  </div>
);

// Analytics Skeleton
export const AnalyticsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <SkeletonHeader color="from-blue-500/10 via-indigo-500/10 to-purple-500/10" />

    {/* Summary cards */}
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-500/20 shadow-xl"
        >
          <div className="flex items-center mb-4">
            <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
            <SkeletonText width="w-16" />
          </div>
          <SkeletonText width="w-24" className="h-7" />
        </div>
      ))}
    </div>

    {/* Charts */}
    {[1, 2].map((i) => (
      <div 
        key={i}
        className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl"
      >
        <div className="flex items-center mb-6">
          <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
          <SkeletonText width="w-40" className="h-6" />
        </div>
        <div className="h-80 bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
          <div className="flex items-end justify-around h-full pb-8">
            {[40, 65, 45, 80, 55, 70, 50].map((h, idx) => (
              <SkeletonPulse 
                key={idx} 
                className="w-8 rounded-t-md" 
                style={{ height: `${h}%` } as React.CSSProperties} 
              />
            ))}
          </div>
        </div>
      </div>
    ))}

    {/* Insights */}
    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
      <SkeletonText width="w-32" className="h-6 mb-6" />
      <div className="grid grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <SkeletonText width="w-32" />
              <SkeletonText width="w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Session History Skeleton
export const SessionHistorySkeleton: React.FC = () => (
  <div className="space-y-6">
    <SkeletonHeader color="from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />

    {/* Summary cards */}
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-500/20 shadow-xl"
        >
          <div className="flex items-center mb-4">
            <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
            <SkeletonText width="w-16" />
          </div>
          <SkeletonText width="w-20" className="h-7" />
        </div>
      ))}
    </div>

    {/* Insights */}
    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
      <SkeletonText width="w-24" className="h-6 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <SkeletonText width="w-20" />
              <SkeletonText width="w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Filter controls */}
    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
      <div className="flex items-center mb-6">
        <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
        <SkeletonText width="w-32" className="h-6" />
      </div>
      <div className="space-y-4">
        <SkeletonPulse className="h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>

    {/* Export buttons */}
    <div className="grid grid-cols-2 gap-3">
      <SkeletonPulse className="h-14 rounded-2xl" />
      <SkeletonPulse className="h-14 rounded-2xl" />
    </div>

    {/* Recent sessions */}
    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
      <div className="flex items-center mb-6">
        <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
        <SkeletonText width="w-36" className="h-6" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="bg-gradient-to-br from-black/40 to-black/30 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-600/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SkeletonCircle size="w-8 h-8" className="rounded-xl" />
                <SkeletonText width="w-16" className="h-3" />
              </div>
            </div>
            <SkeletonText width="w-24" className="h-6 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <SkeletonText width="w-16" className="h-3" />
                  <SkeletonText width="w-12" className="h-3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Achievements Skeleton
export const AchievementsSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header with progress bar */}
    <div className="text-center relative">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 rounded-3xl blur-xl opacity-50" />
      <div className="relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
        <div className="flex justify-center mb-6">
          <SkeletonCircle size="w-20 h-20" className="rounded-3xl" />
        </div>
        <SkeletonText width="w-48" className="mx-auto h-8 mb-6" />
        
        {/* Progress bar */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <SkeletonText width="w-28" />
            <SkeletonText width="w-12" />
          </div>
          <SkeletonPulse className="h-3 w-full rounded-full" />
          <SkeletonText width="w-20" className="mx-auto h-3 mt-2" />
        </div>
      </div>
    </div>

    {/* Category navigation */}
    <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-500/20 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center p-3 rounded-xl">
            <SkeletonCircle size="w-5 h-5" className="mb-2" />
            <SkeletonText width="w-8" className="h-3" />
          </div>
        ))}
      </div>
    </div>

    {/* Achievement cards */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-3xl p-6 border border-slate-600/30 bg-gradient-to-br from-black/60 to-black/40 shadow-lg"
        >
          <div className="flex items-start gap-6">
            <SkeletonCircle size="w-16 h-16" className="rounded-2xl flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <SkeletonText width="w-36" className="h-5" />
                <SkeletonPulse className="h-5 w-16 rounded-full" />
              </div>
              <SkeletonText width="w-full" className="h-3 mb-1" />
              <SkeletonText width="w-3/4" className="h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Leaderboard Skeleton
export const LeaderboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <SkeletonHeader color="from-purple-500/10 via-blue-500/10 to-indigo-500/10" />

    {/* Controls */}
    <div className="space-y-4">
      {/* Sort by */}
      <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-500/20 shadow-lg">
        <div className="flex">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center justify-center px-4 py-3">
              <SkeletonCircle size="w-4 h-4" className="mr-2" />
              <SkeletonText width="w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Time frame */}
      <div className="bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-2 border border-slate-500/20 shadow-lg">
        <div className="flex">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center justify-center px-4 py-3">
              <SkeletonCircle size="w-4 h-4" className="mr-2" />
              <SkeletonText width="w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Cosmetics button */}
      <SkeletonPulse className="h-14 w-full rounded-2xl" />
    </div>

    {/* Leaderboard entries */}
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-3xl transition-all ${
            i <= 3 
              ? 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-2 border-slate-500/30 shadow-2xl' 
              : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-600/30 shadow-lg'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Rank */}
              <SkeletonCircle size="w-16 h-16" className="rounded-2xl flex-shrink-0" />
              
              {/* User info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <SkeletonCircle size="w-5 h-5" />
                  <SkeletonText width="w-32" className="h-5" />
                </div>
                <SkeletonText width="w-24" className="h-3" />
              </div>

              {/* Stats */}
              <div className="text-right">
                <SkeletonText width="w-20" className="h-6 mb-1 ml-auto" />
                <SkeletonText width="w-28" className="h-3 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6">
    <SkeletonHeader color="from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

    {/* Profile card */}
    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl">
      <div className="flex items-center mb-6">
        <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
        <SkeletonText width="w-32" className="h-6" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonText width="w-20" className="h-3 mb-2" />
            <SkeletonPulse className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>

    {/* Settings sections */}
    {[1, 2].map((section) => (
      <div 
        key={section}
        className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-500/20 shadow-2xl"
      >
        <div className="flex items-center mb-6">
          <SkeletonCircle size="w-10 h-10" className="mr-3 rounded-xl" />
          <SkeletonText width="w-28" className="h-6" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-slate-600/30">
              <div>
                <SkeletonText width="w-24" className="h-4 mb-1" />
                <SkeletonText width="w-40" className="h-3" />
              </div>
              <SkeletonPulse className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Action buttons */}
    <div className="space-y-3">
      <SkeletonPulse className="h-14 w-full rounded-2xl" />
      <SkeletonPulse className="h-14 w-full rounded-2xl" />
    </div>
  </div>
);
