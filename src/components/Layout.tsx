import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import {
  BarChart3, CreditCard, Settings, LogOut,
  Menu, X, Wallet, Tag, TrendingUp, FileText, Building2, TestTube,
  ArrowLeftRight, ChevronDown, LayoutGrid,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const BOTTOM_TABS = [
  { path: '/dashboard', label: 'Início', icon: BarChart3 },
  { path: '/transactions', label: 'Lançar', icon: TrendingUp },
  { path: '/accounts', label: 'Contas', icon: CreditCard },
  { path: '/nfse', label: 'NFS-e', icon: FileText },
] as const;

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, signout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Trava o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transações', icon: TrendingUp },
    { path: '/accounts', label: 'Contas', icon: CreditCard },
    { path: '/categories', label: 'Categorias', icon: Tag },
    { path: '/empresas', label: 'Empresas', icon: Building2 },
    { path: '/nfse', label: 'NFS-e', icon: FileText },
    { path: '/testes', label: 'Testes', icon: TestTube },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const migracaoItems = [
    { path: '/migracoes/financeiro', label: 'Financeiro' },
  ];

  const [migracoesOpen, setMigracoesOpen] = useState(location.startsWith('/migracoes'));
  const migracoesActive = location.startsWith('/migracoes');
  const isBottomTabActive = BOTTOM_TABS.some((t) => location === t.path);

  const handleLogout = async () => {
    await signout();
    setLocation('/login');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between safe-top">
        <Link to="/dashboard" className="flex items-center gap-3 min-h-[44px]">
          <div className="w-10 h-10 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center shadow-lg shadow-white/5 shrink-0">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          {sidebarOpen && <span className="font-bold text-white text-lg tracking-tight">Finance</span>}
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex p-2 hover:bg-zinc-800 rounded-lg transition-colors min-w-[40px] min-h-[40px] items-center justify-center"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? (
            <X className="w-4 h-4 text-zinc-500" />
          ) : (
            <Menu className="w-4 h-4 text-zinc-500" />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl transition-all duration-200 min-h-[48px] md:min-h-0 ${
              location === path
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:bg-zinc-800'
            }`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${location === path ? 'text-black' : ''}`} />
            {sidebarOpen && <span className="text-[15px] md:text-sm font-medium">{label}</span>}
          </Link>
        ))}

        {/* Grupo Migrações */}
        <button
          onClick={() => setMigracoesOpen(!migracoesOpen)}
          className={`w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl transition-all duration-200 min-h-[48px] md:min-h-0 ${
            migracoesActive
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:bg-zinc-800'
          }`}
        >
          <ArrowLeftRight className={`w-5 h-5 flex-shrink-0 ${migracoesActive ? 'text-black' : ''}`} />
          {sidebarOpen && (
            <>
              <span className="text-[15px] md:text-sm font-medium flex-1 text-left">Migrações</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${migracoesOpen ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        {migracoesOpen && sidebarOpen && (
          <div className="ml-8 space-y-0.5 border-l border-zinc-800 pl-2">
            {migracaoItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`block px-3 py-3 md:py-2 rounded-lg text-[15px] md:text-sm transition-all duration-200 min-h-[48px] md:min-h-0 flex items-center ${
                  location === path
                    ? 'text-white bg-zinc-800 font-medium'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2 safe-bottom">
        {sidebarOpen && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Usuário</p>
            <p className="text-sm font-medium text-zinc-200 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/15 rounded-xl transition-all duration-200 group min-h-[48px] md:min-h-0"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {sidebarOpen && <span className="text-[15px] md:text-sm font-medium">Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh bg-zinc-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-zinc-900/80 backdrop-blur-sm border-r border-zinc-800/80 transition-all duration-300 shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[85vw] max-w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileOpen}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 to-zinc-950 overscroll-contain">
        {/* Mobile header — fixo no topo */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 bg-zinc-950/85 backdrop-blur-xl safe-top">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-zinc-200" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 min-h-[44px]">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white">Finance</span>
          </Link>
          <div className="w-11" />
        </div>

        <div className="px-4 py-5 sm:p-6 md:p-8 has-bottom-nav">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom navigation — só no celular */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl safe-bottom"
        aria-label="Navegação principal"
      >
        <div className="grid grid-cols-5 px-1 pt-1">
          {BOTTOM_TABS.map(({ path, label, icon: Icon }) => {
            const active = location === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl min-h-[60px] justify-center transition-colors ${
                  active ? 'text-white' : 'text-zinc-500 active:text-zinc-200'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                    active ? 'bg-white text-black' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`text-[11px] font-medium ${active ? 'text-white' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileOpen(true)}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl min-h-[60px] justify-center transition-colors ${
              !isBottomTabActive ? 'text-white' : 'text-zinc-500'
            }`}
            aria-label="Abrir menu completo"
          >
            <span
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                !isBottomTabActive ? 'bg-zinc-800 text-white' : ''
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
