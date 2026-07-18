import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">Gerencie suas preferências</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input opacity-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ID do Usuário</label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="input opacity-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Membro desde</label>
            <input
              type="text"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : ''}
              disabled
              className="input opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Preferências</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Tema Escuro</p>
              <p className="text-sm text-slate-400">Usar tema escuro por padrão</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              disabled
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <p className="text-white font-medium">Notificações</p>
              <p className="text-sm text-slate-400">Receber alertas de transações</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              disabled
              className="w-5 h-5 rounded"
            />
          </div>
        </div>
      </div>

      {/* About Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Sobre</h2>
        <div className="space-y-3 text-slate-400 text-sm">
          <p>
            <strong className="text-white">Finance Pro Web</strong> é um dashboard de gestão financeira
            desenvolvido com React, TypeScript e Tailwind CSS.
          </p>
          <p>
            <strong className="text-white">Versão:</strong> 1.0.0
          </p>
          <p>
            <strong className="text-white">Desenvolvido por:</strong> mobilecosta
          </p>
          <p>
            <strong className="text-white">Repositório:</strong>{' '}
            <a
              href="https://github.com/mobilecosta/finance-app-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              github.com/mobilecosta/finance-app-web
            </a>
          </p>
        </div>
      </div>

      {/* Help Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Ajuda</h2>
        <div className="space-y-3">
          <a
            href="#"
            className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-white"
          >
            📖 Documentação
          </a>
          <a
            href="#"
            className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-white"
          >
            💬 Suporte
          </a>
          <a
            href="#"
            className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-white"
          >
            🐛 Reportar Bug
          </a>
        </div>
      </div>
    </div>
  );
}
