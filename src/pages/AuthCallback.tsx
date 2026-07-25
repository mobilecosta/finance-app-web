import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import { Loader } from 'lucide-react';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { setToken, loadUser } = useAuthStore();

  useEffect(() => {
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-4" />
        <p className="text-zinc-500">Autenticando...</p>
      </div>
    </div>
  );
}
