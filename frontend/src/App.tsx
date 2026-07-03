import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RoleGuard from './components/RoleGuard';
import { useAppSelector } from './store';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import TeamDashboard from './pages/TeamDashboard';
import TeamMemberProfile from './pages/TeamMemberProfile';
import ProjectDetails from './pages/ProjectDetails';
import LatestLinks from './pages/LatestLinks';

// Shared Layout with Sidebar
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-sky-50 via-white to-sky-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route Redirector based on Authenticated Role
const DashboardRedirector: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'team_member':
      return <Navigate to="/team" replace />;
    default:
      return <Navigate to="/client" replace />;
  }
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/resetpassword/:token" element={<ResetPassword />} />

      {/* Secure Redemption Token route */}
      <Route
        path="/projects/share/:token"
        element={
          <RoleGuard allowedRoles={['client', 'team_member', 'admin']}>
            <ProjectDetails />
          </RoleGuard>
        }
      />

      {/* Protected Layout Routes */}
      <Route element={<AppLayout />}>
        {/* Landing Redirector */}
        <Route path="/" element={<DashboardRedirector />} />

        {/* Admin Section */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/links"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <LatestLinks />
            </RoleGuard>
          }
        />

        {/* Team Section */}
        <Route
          path="/team"
          element={
            <RoleGuard allowedRoles={['team_member']}>
              <TeamDashboard />
            </RoleGuard>
          }
        />

        {/* Client Section */}
        <Route
          path="/client"
          element={
            <RoleGuard allowedRoles={['client']}>
              <ClientDashboard />
            </RoleGuard>
          }
        />

        {/* Unified Project details workspace */}
        <Route
          path="/project/:id"
          element={
            <RoleGuard allowedRoles={['admin', 'client', 'team_member']}>
              <ProjectDetails />
            </RoleGuard>
          }
        />
        <Route
          path="/team-member/:id"
          element={
            <RoleGuard allowedRoles={['admin', 'client', 'team_member']}>
              <TeamMemberProfile />
            </RoleGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <RoleGuard allowedRoles={['team_member']}>
              <TeamMemberProfile />
            </RoleGuard>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
