import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { getFileUrl } from '../utils/api';

import { LayoutDashboard, FolderOpen, Link as LinkIcon, Users, Settings, Bug, HelpCircle, BaggageClaim } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();


  function pricingClicked() {
 window.alert("Feature coming soon")
  }

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
          {
            to: '/',
            label: 'Settings',
            icon: <Settings size={18} />,
          },

            {
            to: '/permissions',
            label: 'Roles and permissions',
            icon: <BaggageClaim size={18} />,
          },
        ];
      case 'client':
        return [
          {
            to: '/client',
            label: 'Client Dashboard',
            icon: <LayoutDashboard size={18} />,
          },
            {
            to: '/',
            label: 'Settings',
            icon: <Settings size={18} />,
          },

            {
            to: '/permissions',
            label: 'Roles and permissions',
            icon: <BaggageClaim size={18} />,
          },
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinks();

  return (
    <aside className=" hidden w-72 shrink-0 flex-col gap-6 rounded-[28px] border border-white/70 p-5 shadow-lg md:flex md:min-h-[calc(100vh-96px)]">
      <div className="flex flex-col items-center gap-2 border-b border-sky-100/40 pb-6">
       <div className="mt-2 flex items-center gap-3">
  {/* Profile Photo */}
  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ">
    {user?.profilePic ? (
      <img
        src={getFileUrl(user.profilePic)}
        alt={user?.name || "Profile"}
        className="h-full w-full object-cover"
        draggable={false}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center font-bold text-sky-700">
        <img 
          src={user?.gender === 'Female' 
            ? 'https://img.magnific.com/free-vector/flat-style-woman-avatar_90220-2944.jpg?semt=ais_hybrid&w=740&q=80' 
            : 'https://st.depositphotos.com/2101611/3925/v/450/depositphotos_39258143-stock-illustration-businessman-avatar-profile-picture.jpg'} 
          className="h-full w-full object-cover" 
          alt="Default avatar" 
        />
      </div>
    )}
  </div>

  {/* Name & Role */}
  <div className="min-w-0">
    <div className="truncate font-semibold text-slate-800">
      {user?.name}
    </div>
    <div className="text-xs font-medium capitalize text-sky-600">
      {user?.role?.replace("_", " ")}
    </div>
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
              `flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-blue-500'
                  : 'text-slate-600 hover:bg-white/70 hover:text-sky-600'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))} 
      </nav>

     <div className="rounded-3xl bg-[#0000FF] text-gray-700 p-5 text-white shadow-xl">
  <div className="mb-3 flex items-center justify-between">
    <div className="rounded-xl bg-yellow p-2 backdrop-blur">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l2.6 5.27L20 9.27l-4 3.9.94 5.46L12 16.8l-4.94 1.83L8 13.17l-4-3.9 5.4-1L12 3z"
        />
      </svg>
    </div>

    <span className="rounded-full bg-[#FFDE21] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900">
      PRO
    </span>
  </div>

  <h3 className="text-lg font-bold text-white  ">
    Upgrade to Pro
  </h3>

  <p className="mt-2 text-sm leading-5  text-white">
   Unlock more features and powerfull tools
  </p>

  <button
    onClick={pricingClicked}
    className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-sky-700 transition-all duration-300 hover:scale-[1.02] hover:bg-sky-50 active:scale-95"
  >
    Upgrade Now
  </button>
</div>

      <div className="border-t border-sky-100/40 pt-4 text-center">
        <div className="text-[10px] text-slate-400">Freelance Management v1.0</div>
        <div className="mt-1 text-[9px] font-semibold text-sky-600">Elevated workspace</div>
      </div>
    </aside>
  );
};

export default Sidebar;
