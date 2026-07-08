import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'client' | 'team_member')[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    // Redirect to login page and keep source route to return after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Unauthorized access: redirect to dashboard depending on their role
    const fallbackPath =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'team_member'
        ? '/team'
        : '/client';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleGuard;
