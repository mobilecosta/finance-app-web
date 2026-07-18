import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transações', icon: TrendingUp },
    { path: '/accounts', label: 'Contas', icon: CreditCard },
    { path: '/categories', label: 'Categorias', icon: Tag },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = async () => {
    await signout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-white">Finance</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-400" />
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
                location.pathname === path
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          {sidebarOpen && (
            <div className="px-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Usuário</p>
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
