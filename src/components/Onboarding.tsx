import React, { useState } from 'react';
import { CheckCircle, Scale, Clock, Calendar, BarChart3, TrendingUp } from 'lucide-react';

interface OnboardingProps {
  onComplete: (salary: number, frequency: 'hourly' | 'weekly' | 'monthly' | 'annually', hourlyWage: number) => Promise<void>;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [salary, setSalary] = useState('');
  const [frequency, setFrequency] = useState<'hourly' | 'weekly' | 'monthly' | 'annually'>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateHourlyRate = (salaryAmount: number, freq: string): number => {
    switch (freq) {
      case 'hourly':
        return salaryAmount;
      case 'weekly':
        return salaryAmount / 40; // Assuming 40 hour work week
      case 'monthly':
        return salaryAmount / (40 * 4.33); // Average weeks per month
      case 'annually':
        return salaryAmount / (40 * 52); // 52 weeks per year
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!salary || parseFloat(salary) <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }

    setLoading(true);
    try {
      const salaryAmount = parseFloat(salary);
      const hourlyWage = calculateHourlyRate(salaryAmount, frequency);
      await onComplete(salaryAmount, frequency, hourlyWage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full border-2 border-purple-400/50 mb-6">
            <CheckCircle className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Welcome to backlog
          </h1>
          <p className="text-slate-400 text-lg">
            Let's calculate your break earnings
          </p>
        </div>

        {/* Honor System Notice */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Scale className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-blue-300 font-semibold text-lg mb-2">Honor System</h3>
              <p className="text-blue-200/80">
                backlog operates on the honor system. All break time tracking is self-reported. We trust you to track your breaks honestly. Integrity is the foundation of our community!
              </p>
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
          {/* Base Salary */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Base Salary
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., 50000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-8 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <p className="text-slate-400 text-xs mt-2">
              Enter your salary for the selected period
            </p>

            {salary && (
              <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-sm font-medium">
                  Hourly Rate: ${(calculateHourlyRate(parseFloat(salary), frequency) || 0).toFixed(2)}/hr
                </p>
                <p className="text-purple-200/70 text-xs mt-1">
                  Your break earnings will be calculated at this rate
                </p>
              </div>
            )}
          </div>

          {/* Salary Period */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Salary Period
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'hourly', label: 'Hourly Rate', Icon: Clock },
                { value: 'weekly', label: 'Weekly', Icon: Calendar },
                { value: 'monthly', label: 'Monthly', Icon: BarChart3 },
                { value: 'annually', label: 'Annual', Icon: TrendingUp }
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value as any)}
                  className={`py-3 px-4 rounded-lg border-2 transition-all duration-300 font-semibold flex items-center justify-center gap-2 ${
                    frequency === value
                      ? 'bg-purple-500/30 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-purple-500/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-3">
              Is your salary an hourly rate, weekly pay, monthly paycheck, or annual salary?
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/20"
          >
            {loading ? 'Calculating...' : 'Start Tracking'}
          </button>

          <p className="text-slate-400 text-xs text-center">
            You can update your salary anytime in your profile
          </p>
        </form>
      </div>
    </div>
  );
};
