import React, { useState } from 'react';
import { Play, Square, Trophy, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Start Your Break',
    description: "Tap 'Start Session' when you begin your break. The timer tracks how long you're away.",
    icon: Play,
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    title: 'See What You Earned',
    description: 'Stop the session when you return. Watch your earnings calculate in real-time based on your salary.',
    icon: Square,
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Unlock Achievements',
    description: 'Complete sessions to unlock achievements, climb the leaderboard, and earn cosmetic rewards.',
    icon: Trophy,
    gradient: 'from-purple-500 to-pink-500',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Close tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? 'w-8 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-16 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${step.gradient} mb-6 shadow-xl`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-4">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-slate-300 text-lg leading-relaxed max-w-xs mx-auto">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r ${step.gradient} hover:scale-105`}
            aria-label={currentStep === TUTORIAL_STEPS.length - 1 ? 'Get started' : 'Next step'}
          >
            <span>{currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
