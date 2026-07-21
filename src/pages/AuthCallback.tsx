import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { setToken, loadUser } = useAuthStore();

  useEffect(() => {
    // Extrair token da URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      setToken(token);
      loadUser().finally(() => {
        setLocation('/dashboard');
      });
    } else {
      setLocation('/login');
    }
  }, [setToken, loadUser, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4" />
        <p className="text-zinc-600">Autenticando...</p>
      </div>
    </div>
  );
}
