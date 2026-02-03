import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-500/30 rounded-full animate-spin border-t-indigo-500" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 bg-indigo-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);
