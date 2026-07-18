import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signin, signup, loading, error, clearError } = useAuthStore();
  
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Email e senha são obrigatórios');
      return;
    }

    if (isSignup && !fullName) {
      setLocalError('Nome é obrigatório');
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password, fullName);
      } else {
        await signin(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Erro já está no store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Finance Pro</h1>
          <p className="text-slate-400">Gerencie suas finanças com facilidade</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsSignup(false);
                setLocalError('');
                clearError();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isSignup
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsSignup(true);
                setLocalError('');
                clearError();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isSignup
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Cadastro
            </button>
          </div>

          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="input"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isSignup ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Demo:</p>
            <p className="text-xs text-slate-300">Email: demo@example.com</p>
            <p className="text-xs text-slate-300">Senha: demo123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
