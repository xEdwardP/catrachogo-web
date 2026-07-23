import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
import type { UserRole } from '../types/auth';
import { FullScreenLoader } from './FullScreenLoader';

interface ProtectedRouteProps {
  roles?: UserRole[];
  requirePhone?: boolean;
}

export function ProtectedRoute({ roles, requirePhone = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  if (requirePhone && !user.phone) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
