import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { resolvePostAuthPath } from '../utils/authRedirect';
import { LandingPage } from './LandingPage';

export function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  return <Navigate to={resolvePostAuthPath(user)} replace />;
}
