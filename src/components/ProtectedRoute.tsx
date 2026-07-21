import { useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user, loadUser } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  if (!token) {
    setLocation('/login');
    return null;
  }

  return <>{children}</>;
}
