import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import { AlertCircle, Loader, Wallet } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
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
      setLocation('/dashboard');
    } catch (err) {
      // Erro já está no store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white to-zinc-300 rounded-2xl mb-4 shadow-lg shadow-white/10">
            <Wallet className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Finance Pro</h1>
          <p className="text-zinc-400">Gerencie suas finanças com facilidade</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/20">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-zinc-800/50 rounded-lg p-1">
            <button
              onClick={() => { setIsSignup(false); setLocalError(''); clearError(); }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 text-sm ${
                !isSignup
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsSignup(true); setLocalError(''); clearError(); }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 text-sm ${
                isSignup
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cadastro
            </button>
          </div>

          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
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
              <label className="block text-sm font-medium text-zinc-300 mb-2">
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
              <label className="block text-sm font-medium text-zinc-300 mb-2">
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
              className="w-full py-2.5 px-4 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isSignup ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-medium">Acesso Demo</p>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-500">Email:</span> demo@example.com
            </p>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-500">Senha:</span> demo123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
