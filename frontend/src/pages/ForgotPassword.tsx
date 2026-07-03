import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { message, Alert } from 'antd';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setLoading(true);
      setServerError(null);
      await API.post('/auth/forgotpassword', { email: data.email });
      setSuccess(true);
      message.success('Password reset link sent to your email.');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to send reset link. Please check the email.';
      setServerError(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-tr from-sky-100 via-white to-sky-200">
      <div className="w-full max-w-md">
        <GlassCard className="relative overflow-hidden border border-white/50 shadow-2xl shadow-sky-200/50">
          <div className="absolute -top-16 -left-16 h-32 w-32 bg-sky-300/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 h-32 w-32 bg-indigo-300/30 rounded-full blur-2xl"></div>

          <div className="relative">
            {/* Back button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-600 transition mb-6"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>

            {!success ? (
              <>
                <div className="flex flex-col items-center mb-8">
                  <div className="h-14 w-14 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-sky-200 mb-3">
                    FP
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Forgot Password?</h2>
                  <p className="text-sm text-slate-500 text-center mt-1">
                    Enter your email address and we'll send you a secure link to reset your password.
                  </p>
                </div>

                {serverError && (
                  <div className="mb-6">
                    <Alert message={serverError} type="error" showIcon closable />
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-100/80 bg-white/50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                  <CheckCircle size={36} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Check Your Email</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  We've sent a password reset link to your registered email. If it doesn't arrive in a few minutes, check your spam folder or mailtrap logs.
                </p>
                <Link
                  to="/login"
                  className="mt-8 py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
                >
                  Return to Login
                </Link>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
