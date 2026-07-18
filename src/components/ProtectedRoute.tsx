import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user, loadUser } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
