import { useAuthStore } from '../store/authStore';
import { User, Settings2, Info, HelpCircle, ExternalLink, Mail, Calendar, Hash } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl animate-scale-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Configurações</h1>
        <p className="text-zinc-500">Gerencie suas preferências</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-100" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Perfil</h2>
            <p className="text-sm text-zinc-500">Informações da sua conta</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Mail className="w-4 h-4 text-zinc-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Email</p>
              <p className="text-sm text-zinc-100 truncate">{user?.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Hash className="w-4 h-4 text-zinc-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">ID do Usuário</p>
              <p className="text-sm text-zinc-100 font-mono truncate">{user?.id || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Membro desde</p>
              <p className="text-sm text-zinc-100">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-zinc-100" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Preferências</h2>
            <p className="text-sm text-zinc-500">Personalize sua experiência</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
            <div>
              <p className="text-zinc-100 font-medium text-sm">Tema Escuro</p>
              <p className="text-xs text-zinc-500 mt-0.5">Usar tema escuro por padrão</p>
            </div>
            <div className="w-11 h-6 bg-zinc-700 rounded-full relative cursor-not-allowed opacity-60">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
            <div>
              <p className="text-zinc-100 font-medium text-sm">Notificações</p>
              <p className="text-xs text-zinc-500 mt-0.5">Receber alertas de transações</p>
            </div>
            <div className="w-11 h-6 bg-zinc-700 rounded-full relative cursor-not-allowed opacity-60">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* About Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-zinc-100" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Sobre</h2>
            <p className="text-sm text-zinc-500">Informações do aplicativo</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p><strong className="text-zinc-100">Finance Pro Web</strong> é um dashboard de gestão financeira desenvolvido com React, TypeScript e Tailwind CSS.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <p className="text-xs text-zinc-500 mb-0.5">Versão</p>
              <p className="text-zinc-100 font-medium">1.0.0</p>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <p className="text-xs text-zinc-500 mb-0.5">Desenvolvido por</p>
              <p className="text-zinc-100 font-medium">mobilecosta</p>
            </div>
          </div>
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Repositório</p>
            <a href="https://github.com/mobilecosta/finance-app-web" target="_blank" rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 text-sm">
              github.com/mobilecosta/finance-app-web
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Help Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-zinc-100" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Ajuda</h2>
            <p className="text-sm text-zinc-500">Recursos de suporte</p>
          </div>
        </div>
        <div className="space-y-2">
          {['Documentação', 'Suporte', 'Reportar Bug'].map((item) => (
            <a key={item} href="#" className="flex items-center gap-3 p-3 bg-zinc-800/30 hover:bg-zinc-800/60 rounded-xl transition-colors text-zinc-300 hover:text-white text-sm group">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-blue-400 transition-colors" />
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
