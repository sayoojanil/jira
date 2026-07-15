import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { authStart, authSuccess, authFailure } from '../store/authSlice';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, message } from 'antd';
import Password from 'antd/es/input/Password';

const Login: React.FC = () => {
  const { loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

function handleClick() {
  window.alert("Google auth coming soon!");
}



  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data: any) => {
    try {
      dispatch(authStart());
      const response = await API.post('/auth/login', {
        email: data.email,
        password: data.password,

        
      });

      const { token, ...user } = response.data;
      dispatch(authSuccess({ user, token }));
      message.success(`Successfully logged in Welcome back, ${user.name}!`);

      // Redirect depending on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'team_member') {
        navigate('/team');
      } else {
        navigate('/client');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(authFailure(errMsg));
      message.error(errMsg);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <GlassCard className="relative overflow-hidden rounded-[32px] border border-white/70 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
          <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 inline-flex rounded-full border border-sky-100/80 bg-sky-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700">
                TaskFlow
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-800">Welcome back!</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to manage your freelance projects with calm clarity.</p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="mb-6">
                <Alert message={error} type="error" showIcon closable />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email address */}
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
                    className="w-full rounded-2xl border border-sky-100/80 bg-white/70 py-3 pl-10 pr-4 text-sm text-slate-700 transition-all focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  {/* <Link
                    to="/forgotpassword"
                    className="text-xs font-semibold text-sky-600 hover:text-indigo-600 transition"
                  >
                    Forgot Password?
                  </Link> */}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-sky-100/80 bg-white/70 py-3 pl-10 pr-10 text-sm text-slate-700 transition-all focus:border-sky-500 focus:bg-white focus:outline-none"
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

              {/* Action Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0055FF] px-4 py-3 font-semibold text-white shadow-lg shadow-sky-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-sky-300 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
              </button>


 <button
  type="button"
  onClick={handleClick}
  className="flex w-full items-center justify-center gap-2 rounded-full border border-sky-100/80 bg-white/80 px-4 py-3 font-semibold text-slate-700 shadow-md shadow-sky-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sky-200 disabled:opacity-50"
disabled={loading}
>
 {/* sasasaa */}
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      <span>Continue with Google</span>
    
</button>
            </form>

            <div className="text-center mt-6 text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-sky-600 hover:text-indigo-700 transition">
                Create one
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
