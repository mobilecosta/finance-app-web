import { useAuthStore } from '../store/authStore';
import { User, Settings2, Info, HelpCircle, ExternalLink } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Configurações</h1>
        <p className="text-zinc-500">Gerencie suas preferências</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-100" />
          </div>
          <h2 className="text-lg font-semibold text-white">Perfil</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">ID do Usuário</label>
            <input type="text" value={user?.id || ''} disabled className="input opacity-60 cursor-not-allowed font-mono text-xs" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Membro desde</label>
            <input type="text" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : ''} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-zinc-100" />
          </div>
          <h2 className="text-lg font-semibold text-white">Preferências</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-zinc-100 font-medium text-sm">Tema Escuro</p>
              <p className="text-xs text-zinc-500">Usar tema escuro por padrão</p>
            </div>
            <div className="w-10 h-6 bg-zinc-700 rounded-full relative cursor-not-allowed opacity-60">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-zinc-100 font-medium text-sm">Notificações</p>
              <p className="text-xs text-zinc-500">Receber alertas de transações</p>
            </div>
            <div className="w-10 h-6 bg-zinc-700 rounded-full relative cursor-not-allowed opacity-60">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* About Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-zinc-100" />
          </div>
          <h2 className="text-lg font-semibold text-white">Sobre</h2>
        </div>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            <strong className="text-zinc-100">Finance Pro Web</strong> é um dashboard de gestão financeira
            desenvolvido com React, TypeScript e Tailwind CSS.
          </p>
          <p><strong className="text-zinc-100">Versão:</strong> 1.0.0</p>
          <p><strong className="text-zinc-100">Desenvolvido por:</strong> mobilecosta</p>
          <p>
            <strong className="text-zinc-100">Repositório:</strong>{' '}
            <a href="https://github.com/mobilecosta/finance-app-web" target="_blank" rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
              github.com/mobilecosta/finance-app-web
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Help Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-zinc-100" />
          </div>
          <h2 className="text-lg font-semibold text-white">Ajuda</h2>
        </div>
        <div className="space-y-2">
          {['Documentação', 'Suporte', 'Reportar Bug'].map((item) => (
            <a key={item} href="#" className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-300 hover:text-white text-sm group">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors" />
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
