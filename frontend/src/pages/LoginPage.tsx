import React, { useState } from 'react';
import { SumanLogo } from '../components/common/SumanLogo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { authService } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
  successMessage?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
  successMessage,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({ identifier: identifier.trim(), password });
      onLoginSuccess();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      const isClean = raw && !raw.includes('HTTP') && !raw.includes('status') && !raw.includes('Exception');
      setError(isClean ? raw : 'Invalid username/email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAFF] dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <SumanLogo size="lg" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Access your personal cloud storage
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#111318] py-8 px-6 shadow-sm border border-slate-200 dark:border-white/[0.08] rounded-2xl sm:px-8 transition-colors duration-200">
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                Username or email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email address"
                className="w-full bg-slate-50 dark:bg-[#181920] focus:bg-white dark:focus:bg-[#181920] border border-slate-200 dark:border-white/[0.12] focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-[#181920] focus:bg-white dark:focus:bg-[#181920] border border-slate-200 dark:border-white/[0.12] focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800/60 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Don't have an account?</span>
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
