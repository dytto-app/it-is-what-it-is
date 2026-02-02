import React from 'react';
import { Timer, DollarSign, Trophy, Award, Sparkles, ArrowRight, BarChart3, Users, Clock, TrendingUp, Shield, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: (mode: 'signup' | 'login') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-black/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              backlog
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onGetStarted('login')}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => onGetStarted('signup')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-3xl border-2 border-indigo-400/40 mb-8 shadow-2xl shadow-indigo-500/20">
            <Timer className="w-10 h-10 text-indigo-400" />
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              backlog
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Track your work breaks.
            <br />
            <span className="text-indigo-400 font-semibold">See exactly how much you earn.</span>
          </p>

          <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
            The app that calculates your earnings while you're on the clock — and off the seat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onGetStarted('signup')}
              className="group flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onGetStarted('login')}
              className="text-slate-400 hover:text-white font-medium px-6 py-4 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all"
            >
              Sign In
            </button>
          </div>

          <p className="text-slate-600 text-sm mt-4">Free to use · No credit card needed</p>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '100%', label: 'Free' },
              { value: '30s', label: 'Setup' },
              { value: '🚽', label: 'Powered' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-slate-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Three steps to knowing your true break-time ROI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Enter Your Salary',
                desc: 'Tell us what you make — hourly, weekly, monthly, or yearly. We calculate your per-second rate.',
                icon: DollarSign,
                gradient: 'from-green-500/20 to-emerald-500/20',
                border: 'border-green-400/30',
                iconColor: 'text-green-400',
              },
              {
                step: '2',
                title: 'Start a Session',
                desc: 'Hit the timer when you take a break. We track every second.',
                icon: Timer,
                gradient: 'from-indigo-500/20 to-blue-500/20',
                border: 'border-indigo-400/30',
                iconColor: 'text-indigo-400',
              },
              {
                step: '3',
                title: 'Watch the Money',
                desc: 'See your earnings tick up in real-time. View analytics, climb the leaderboard, earn achievements.',
                icon: TrendingUp,
                gradient: 'from-purple-500/20 to-pink-500/20',
                border: 'border-purple-400/30',
                iconColor: 'text-purple-400',
              },
            ].map(({ step, title, desc, icon: Icon, gradient, border, iconColor }) => (
              <div
                key={step}
                className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl rounded-3xl p-8 border ${border} shadow-xl hover:scale-105 transition-transform duration-300`}
              >
                <div className="absolute -top-4 -left-2 w-10 h-10 bg-black border-2 border-slate-600 rounded-xl flex items-center justify-center font-bold text-slate-300 text-lg shadow-lg">
                  {step}
                </div>
                <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Everything you need for premium break tracking</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Timer, title: 'Live Session Timer', desc: 'Real-time earnings counter that ticks every second', color: 'text-blue-400' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Daily, weekly, monthly breakdowns of your breaks', color: 'text-green-400' },
              { icon: Trophy, title: 'Global Leaderboard', desc: 'Compete with other trackers anonymously', color: 'text-yellow-400' },
              { icon: Award, title: 'Achievements', desc: 'Unlock badges for milestones and streaks', color: 'text-purple-400' },
              { icon: Sparkles, title: 'Cosmetics Shop', desc: 'Customize your profile with frames, badges, and titles', color: 'text-pink-400' },
              { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours. No tracking beyond what you choose.', color: 'text-emerald-400' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-500/20 shadow-lg hover:border-slate-400/30 transition-all duration-300"
              >
                <Icon className={`w-8 h-8 ${color} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-12 border border-indigo-500/20 shadow-2xl text-center">
            <h2 className="text-3xl font-bold mb-8">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Join the Movement
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Users, value: 'Growing', label: 'Community of Trackers' },
                { icon: Clock, value: '∞', label: 'Hours Tracked' },
                { icon: DollarSign, value: '$$$', label: 'Earned on Break' },
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="text-center">
                  <Icon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{value}</div>
                  <div className="text-slate-400 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Ready to Track?
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            You're already spending the time. Might as well know what it's worth.
          </p>
          <button
            onClick={() => onGetStarted('signup')}
            className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              backlog
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://ayaanpupala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              built by dytto
            </a>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600 text-sm">
              © {new Date().getFullYear()} back-log.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
