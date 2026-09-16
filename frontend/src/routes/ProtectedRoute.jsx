import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { roleMatches } from '@/context/AuthContext';
import { Loading } from '@/components/common';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!token) {
    logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !roleMatches(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}