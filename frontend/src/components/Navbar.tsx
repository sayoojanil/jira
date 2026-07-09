import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { LogOut, User as UserIcon, Bell, Moon, Sun, Laptop } from 'lucide-react';
import { Badge, Dropdown, MenuProps, message } from 'antd';
import { getFileUrl } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function bellclick(){
    message.error("feature coming soon!")
  }

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?"))
      
    {
      dispatch(logout());
      message.success("Logout successful")
      navigate('/login');
    }
    
  };





  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className="px-4 py-2 border-b border-slate-100">
          <div className="font-semibold text-slate-800">{user?.name}</div>
          <div className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</div>
        </div>
      ),
    },
    ...(user?.role === 'team_member'
      ? [
          {
            key: '2',
            label: (
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition"
              >
                <UserIcon size={16} />
                <span>My Profile</span>
              </button>
            ),
          },
        ]
      : []),
    {
      key: '3',
      label: (
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        
      ),
    },
  ];

  return (
    <nav className="glass-panel sticky top-3 z-40 mx-3 mt-3 flex items-center justify-between rounded-[24px] border border-white/70 px-5 py-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.2)] sm:px-6">
      {/* Brand logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div>
          <span className="font-bold text-lg tracking-tight text-sky-700">
            TaskFlow
          </span>
          <span className="hidden sm:inline-block ml-2 rounded-full bg-sky-100/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700 capitalize">
            {user?.role?.replace('_', ' ')} Panel
          </span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100/60 bg-white/60 text-slate-500 transition-all duration-300 hover:bg-sky-50 hover:text-sky-600"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <Badge count={2} size="small" offset={[-2, 2]}>
          <button
            onClick={bellclick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100/60 bg-white/60 text-slate-500 transition-all duration-300 hover:bg-sky-50 hover:text-sky-600"
          >
            <Bell size={18} />
          </button>
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sky-100/60 bg-white/60 p-1.5 pr-3 transition-all duration-300 hover:bg-sky-50">
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-sky-100">
              {user?.profilePic ? (
                <img
                  src={getFileUrl(user.profilePic)}
                  alt={user?.name || 'Profile'}
                  className="block h-full w-full rounded-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-sky-700">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="hidden text-left md:block">
              <div className="text-xs font-semibold text-slate-700">{user?.name}</div>
              <div className="text-[10px] capitalize text-slate-400">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
