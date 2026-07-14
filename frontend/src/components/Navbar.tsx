import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { LogOut, User as UserIcon, Bell, Moon, Sun, AlertCircle, FileText, ArrowBigDown, ChevronDown } from 'lucide-react';
import { Badge, Dropdown, MenuProps, message } from 'antd';
import { getFileUrl } from '../utils/api';
import { getSocket } from '../utils/socket';
import { useTheme } from '../context/ThemeContext';

interface NotificationItem {
  id: string;
  type: 'bug' | 'file';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  bugId?: string;
  createdAt: string;
  isRead: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'taskflow-notifications';

const Navbar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored) as NotificationItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const currentProjectId = location.pathname.match(/^\/project\/([^/]+)/)?.[1] || null;

  useEffect(() => {
    const socket = getSocket();

    const pushNotification = (notification: NotificationItem) => {
      setNotifications((prev) => {
        const next = [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 20);
        return next;
      });
    };

    const handleNotification = (notification: NotificationItem) => {
      pushNotification(notification);
    };

    const handleNewBug = (bug: any) => {
      pushNotification({
        id: `bug-${bug._id || Date.now()}`,
        type: 'bug',
        title: 'New bug reported',
        message: bug.title ? `"${bug.title}" was reported` : 'A new bug was reported',
        projectId: bug.project || currentProjectId || undefined,
        bugId: bug._id,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    };

    const handleFileUploaded = (file: any) => {
      pushNotification({
        id: `file-${file._id || Date.now()}`,
        type: 'file',
        title: 'New file uploaded',
        message: file.name ? `"${file.name}" was uploaded` : 'A new file was uploaded',
        projectId: file.project || currentProjectId || undefined,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    };

    const handleBugUpdated = (updatedBug: any) => {
      if (updatedBug?.status === 'Fixed' || updatedBug?.status === 'Closed') {
        setNotifications((prev) => prev.filter((item) => item.bugId !== updatedBug._id));
      }
    };

    socket.on('newNotification', handleNotification);

    if (currentProjectId) {
      socket.emit('joinProject', currentProjectId);
      socket.on('newBug', handleNewBug);
      socket.on('fileUploaded', handleFileUploaded);
      socket.on('bugUpdated', handleBugUpdated);
    }

    return () => {
      socket.off('newNotification', handleNotification);
      if (currentProjectId) {
        socket.emit('leaveProject', currentProjectId);
        socket.off('newBug', handleNewBug);
        socket.off('fileUploaded', handleFileUploaded);
        socket.off('bugUpdated', handleBugUpdated);
      }
    };
  }, [currentProjectId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.projectId) {
      navigate(`/project/${item.projectId}`);
    }
  };

  const notificationMenuItems: MenuProps['items'] = notifications.length
    ? notifications.map((item) => ({
        key: item.id,
        label: (
          <button
            onClick={() => handleNotificationClick(item)}
            className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
          >
            <div className="mt-0.5 rounded-full bg-sky-100 p-1.5 text-sky-700">
              {item.type === 'bug' ? <AlertCircle size={15} /> : <FileText size={15} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800">{item.title}</div>
              <div className="text-xs text-slate-500">{item.message}</div>
              {item.projectName && (
                <div className="mt-1 text-[11px] font-medium text-sky-600">{item.projectName}</div>
              )}
            </div>
          </button>
        ),
      }))
    : [
        {
          key: 'empty',
          label: <div className="px-3 py-3 text-sm text-slate-500">No notifications yet.</div>,
        },
      ];

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
    <nav className="glass-panel sticky top-3 z-40 mx-3 mt-3 flex items-center justify-between rounded-full border border-white/70 px-5 py-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.2)] sm:px-6">
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-100/60 bg-white/60 text-black transition-all duration-300 hover:bg-sky-50 hover:text-sky-600"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <Badge count={unreadCount} size="small" offset={[-2, 2]} overflowCount={9}>
          <Dropdown
            menu={{ items: notificationMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            onOpenChange={(open) => {
              if (open) {
                setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
              }
            }}
          >
            <button
              className="flex h-10 w-10 items-center font-bold justify-center rounded-full border border-sky-100/60 bg-white/60 text-black transition-all duration-300 hover:bg-sky-50 hover:text-sky-600"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </Dropdown>
        </Badge>

       <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
  <div className="flex cursor-pointer items-center gap-3 p-1.5 pr-3 transition-all duration-300 hover:bg-sky-50">
    <div className="h-8 w-8 flex-shrink-0 overflow-hidden">
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

    <div className="hidden md:flex items-center gap-2">
      <div>
        <div className="text-xs font-semibold text-slate-700">
          {user?.name}
        </div>
        <div className="text-[10px] capitalize text-slate-400">
          {user?.role?.replace('_', ' ')}
        </div>
      </div>

      <ChevronDown size={14} className="text-black" />
    </div>
  </div>
</Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
