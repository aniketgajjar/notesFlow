import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="route-loading"><LoadingSpinner label="Restoring your session…" /></main>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
