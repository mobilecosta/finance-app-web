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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Finance Pro</h1>
          <p className="text-zinc-500">Gerencie suas finanças com facilidade</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
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
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Cadastro
            </button>
          </div>

          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
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
              <label className="block text-sm font-medium text-zinc-700 mb-2">
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
              <label className="block text-sm font-medium text-zinc-700 mb-2">
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
              className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isSignup ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
            <p className="text-xs text-zinc-500 mb-2">Demo:</p>
            <p className="text-xs text-zinc-700">Email: demo@example.com</p>
            <p className="text-xs text-zinc-700">Senha: demo123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
