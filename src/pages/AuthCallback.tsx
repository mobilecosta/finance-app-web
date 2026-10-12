import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import { Loader, Wallet } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl" />
      </div>
      <div className="text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-lg shadow-white/5">
          <Wallet className="w-8 h-8 text-black" />
        </div>
        <Loader className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Autenticando...</p>
      </div>
    </div>
  );
}
