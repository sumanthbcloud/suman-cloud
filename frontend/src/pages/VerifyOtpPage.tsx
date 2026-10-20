import React, { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { SumanLogo } from '../components/common/SumanLogo';
import { authService } from '../services/authService';

interface VerifyOtpPageProps {
  initialEmail: string;
  onVerifySuccess: () => void;
  onNavigateToLogin: () => void;
}

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({
  initialEmail,
  onVerifySuccess,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.verify({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setIsVerified(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <SumanLogo size="lg" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Verify your email
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter the 6-digit code sent via Amazon SES to your inbox
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          {isVerified ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Email verified successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your account is now active. You can sign in to your SUMAN cloud storage.
                </p>
              </div>
              <button
                type="button"
                onClick={onVerifySuccess}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                Proceed to sign in
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="mb-5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  A verification code valid for 10 minutes was sent to{' '}
                  <strong className="font-semibold">{email || 'your email'}</strong>.
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="verify-email"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    6-digit verification code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-lg font-bold bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-300 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify code'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Already verified?</span>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Back to Sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
