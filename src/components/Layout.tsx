import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import {
  BarChart3, CreditCard, Settings, LogOut,
  Menu, X, Wallet, Tag, TrendingUp, FileText, Building2, TestTube,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, signout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

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

  const handleLogout = async () => {
    await signout();
    setLocation('/login');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          {sidebarOpen && <span className="font-bold text-white text-lg tracking-tight">Finance</span>}
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:block p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-4 h-4 text-zinc-500" />
          ) : (
            <Menu className="w-4 h-4 text-zinc-500" />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              location === path
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${location === path ? 'text-black' : ''}`} />
            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        {sidebarOpen && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Usuário</p>
            <p className="text-sm font-medium text-zinc-200 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-zinc-900/80 backdrop-blur-sm border-r border-zinc-800/80 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 to-zinc-950">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800/50">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white">Finance</span>
          </div>
          <div className="w-9" />
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
