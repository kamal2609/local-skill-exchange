import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Mail, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ resetToken?: string; resetUrl?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (res.data?.success) {
        setSuccessInfo(res.data.data || {});
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Could not process request. Please check email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              Local Skill Exchange
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Reset Your Password</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your registered email address to receive password reset instructions
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Reset Link Generated!</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    For local testing and presentation, your reset link is ready:
                  </div>
                </div>
              </div>

              {successInfo.resetToken && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Reset Token (Valid for 10 minutes)</span>
                  </div>
                  <p className="font-mono text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 break-all select-all">
                    {successInfo.resetToken}
                  </p>
                  <Link
                    to={`/reset-password?token=${successInfo.resetToken}`}
                    className="w-full mt-3 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs text-center block hover:bg-emerald-700 transition-colors"
                  >
                    Proceed to Set New Password →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-sm hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-emerald-700">
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
