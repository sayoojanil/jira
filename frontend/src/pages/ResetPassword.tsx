import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { message, Alert } from 'antd';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password');

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setServerError(null);
      await API.put(`/auth/resetpassword/${token}`, { password: data.password });
      setSuccess(true);
      message.success('Password reset successfully.');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Token is invalid or has expired.';
      setServerError(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-tr from-sky-100 via-white to-sky-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        <GlassCard className="relative overflow-hidden border border-white/50 shadow-2xl shadow-sky-200/50">
          <div className="absolute -top-16 -left-16 h-32 w-32 bg-sky-300/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 h-32 w-32 bg-indigo-300/30 rounded-full blur-2xl"></div>

          <div className="relative">
            {!success ? (
              <>
                <div className="flex flex-col items-center mb-8">
                  <div className="h-14 w-14 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-sky-200 mb-3">
                    FP
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
                  <p className="text-sm text-slate-500 text-center mt-1">
                    Please choose a strong new password to secure your account.
                  </p>
                </div>

                {serverError && (
                  <div className="mb-6">
                    <Alert message={serverError} type="error" showIcon closable />
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-sky-100/80 bg-white/50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        {...register('confirmPassword', {
                          required: 'Confirm your password',
                          validate: (value) => value === watchPassword || 'Passwords do not match',
                        })}
                        placeholder="Retype password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-100/80 bg-white/50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                  <CheckCircle size={36} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Password Reset Completed</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Your new password is now active.
                </p>
                <Link
                  to="/login"
                  className="mt-8 py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span>Go to Login</span>
                </Link>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ResetPassword;
