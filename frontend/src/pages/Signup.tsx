import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { authStart, authSuccess, authFailure } from '../store/authSlice';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Users } from 'lucide-react';
import { Alert, message, Select } from 'antd';

const Signup: React.FC = () => {
  const { loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'client' | 'team_member'>('client');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      dispatch(authStart());
      const response = await API.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        role,
      });

      const { token, ...user } = response.data;
      dispatch(authSuccess({ user, token }));
      message.success(`Welcome aboard, ${user.name}!`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'team_member') {
        navigate('/team');
      } else {
        navigate('/client');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(authFailure(errMsg));
      message.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-tr from-sky-100 via-white to-sky-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        <GlassCard className="relative overflow-hidden border border-white/50 shadow-2xl shadow-sky-200/50">
          <div className="absolute -top-16 -left-16 h-32 w-32 bg-sky-300/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 h-32 w-32 bg-indigo-300/30 rounded-full blur-2xl"></div>

          <div className="relative">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
             
              <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
              <p className="text-sm text-slate-500 mt-1">Get started with our portal dashboard</p>
            </div>

            {error && (
              <div className="mb-6">
                <Alert message={error} type="error" showIcon closable />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-100/80 bg-white/50 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
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

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  I am registering as a:
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'client'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-sky-100 bg-white/50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('team_member')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'team_member'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-sky-100 bg-white/50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    Team Member
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Password
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 !bg-sky-700 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-sky-600 hover:text-indigo-700 transition">
                Sign In
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Signup;
