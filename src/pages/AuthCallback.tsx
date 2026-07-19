import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, loadUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setToken(token);
      loadUser().finally(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setToken, loadUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-400">Autenticando...</p>
      </div>
    </div>
  );
}
