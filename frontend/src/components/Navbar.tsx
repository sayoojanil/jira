import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { LogOut, User as UserIcon, Bell, Moon, Sun, Laptop } from 'lucide-react';
import { Badge, Dropdown, MenuProps, message } from 'antd';

const Navbar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  function bellclick(){
    message.error("feature coming soon!")
  }

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?"))
      
    {
      dispatch(logout());
      message.success("Logout successful")
      navigate('/login');
    }
    
  };



  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
    <nav className="glass-panel sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b border-sky-100/50">
      {/* Brand logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        
        <div>
          <span className="font-bold text-lg !bg-sky-700 bg-clip-text text-transparent">
            FreelancePortal
          </span>
          <span className="hidden sm:inline-block ml-2 text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-full capitalize">
            {user?.role?.replace('_', ' ')} Panel
          </span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-4">
        {/* Theme toggler */}
        <button
          onClick={toggleTheme}
          className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-sky-50 rounded-xl border border-sky-100/30 transition-all duration-200"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications mock badge */}
        <Badge count={2} size="small" offset={[-2, 2]}>
          <button 
onClick={bellclick}          
          className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-sky-50 rounded-xl border border-sky-100/30 transition-all duration-200">
            <Bell size={20} />
          </button>
        </Badge>

        {/* Profile Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 hover:bg-sky-50 rounded-xl border border-sky-100/30 transition-all duration-200">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-sky-100 flex-shrink-0">
            {user?.profilePic ? (
              <img
                src={user.profilePic.startsWith('/uploads/') ? `http://localhost:5000${user.profilePic}` : user.profilePic}
                alt={user?.name || 'Profile'}
                className="h-full w-full object-cover block rounded-full"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sky-700 font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-700">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
