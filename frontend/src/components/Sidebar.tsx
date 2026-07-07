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
    <aside className="glass-panel hidden w-72 shrink-0 flex-col gap-6 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.2)] md:flex md:min-h-[calc(100vh-96px)]">
      <div className="flex flex-col items-center gap-2 border-b border-sky-100/40 pb-6">
        <div className="mt-2 text-center">
          <div className="font-semibold text-slate-800">{user?.name}</div>
          <div className="mt-1 text-xs font-medium capitalize text-sky-600">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">
          Main Menu
        </div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-sky-700 text-white shadow-lg shadow-sky-200/70'
                  : 'text-slate-600 hover:bg-white/70 hover:text-sky-600'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sky-100/40 pt-4 text-center">
        <div className="text-[10px] text-slate-400">Freelance Management v1.0</div>
        <div className="mt-1 text-[9px] font-semibold text-sky-600">Elevated workspace</div>
      </div>
    </aside>
  );
};

export default Sidebar;
