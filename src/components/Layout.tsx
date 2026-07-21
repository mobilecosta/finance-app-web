import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '../store/authStore';
import {
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  Tag,
  TrendingUp,
  FileText,
  Building2,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, signout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transações', icon: TrendingUp },
    { path: '/accounts', label: 'Contas', icon: CreditCard },
    { path: '/categories', label: 'Categorias', icon: Tag },
    { path: '/empresas', label: 'Empresas', icon: Building2 },
    { path: '/nfse', label: 'NFS-e', icon: FileText },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = async () => {
    await signout();
    setLocation('/login');
  };

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-zinc-900">Finance</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-zinc-500" />
            ) : (
              <Menu className="w-5 h-5 text-zinc-500" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location === path
                  ? 'bg-black text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-zinc-200 space-y-3">
          {sidebarOpen && (
            <div className="px-2">
              <p className="text-xs text-zinc-400 uppercase tracking-wider">Usuário</p>
              <p className="text-sm font-medium text-zinc-900 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
