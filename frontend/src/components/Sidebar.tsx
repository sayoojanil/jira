import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { LayoutDashboard, FolderOpen, Link as LinkIcon, Users, Settings, Bug, HelpCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          {
            to: '/admin',
            label: 'Analytics Dashboard',
            icon: <LayoutDashboard size={18} />,
          },
          {
            to: '/admin/links',
            label: 'Latest Project Links',
            icon: <LinkIcon size={18} />,
          },
        ];
      case 'team_member':
        return [
          {
            to: '/team',
            label: 'Team Dashboard',
            icon: <LayoutDashboard size={18} />,
          },
          {
            to: '/profile',
            label: 'My Profile',
            icon: <Users size={18} />,
          },
        ];
      case 'client':
        return [
          {
            to: '/client',
            label: 'Client Dashboard',
            icon: <LayoutDashboard size={18} />,
          },
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinks();

  return (
    <aside className="w-64 glass-panel shrink-0 hidden md:flex flex-col gap-6 p-6 min-h-[calc(100vh-76px)] border-r border-sky-100/50">
      {/* User Section summary */}
      <div className="flex flex-col items-center gap-2 pb-6 border-b border-sky-100/30">
       
        <div className="text-center mt-2">
          <div className="font-semibold text-slate-800">{user?.name}</div>
          <div className="text-xs text-sky-500 font-medium capitalize mt-0.5">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Main navigation menu */}
      <nav className="flex-1 flex flex-col gap-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
          Main Menu
        </div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full !bg-sky-700 text-white text-sm font-medium transition-all duration-200 ${
                isActive
                  ? '!bg-sky-700 text-white shadow-md shadow-sky-200/50'
                  : 'text-slate-600 hover:bg-sky-50/70 hover:text-sky-600'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Workspace Footer details */}
      <div className="pt-4 border-t border-sky-100/30 text-center">
        <div className="text-[10px] text-slate-400">Freelance Management v1.0</div>
        <div className="text-[9px] text-sky-500 font-semibold mt-1">Light Blue Theme</div>
      </div>
    </aside>
  );
};

export default Sidebar;
