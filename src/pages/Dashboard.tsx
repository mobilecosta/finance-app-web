import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI, type DashboardMetrics } from '../services/api';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Loader } from 'lucide-react';

type Period = 'month' | 'quarter' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'month', label: 'Mês' },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year', label: 'Ano' },
];

const COLORS = ['#ffffff', '#a1a1aa', '#52525b', '#3f3f46', '#27272a', '#78716c'];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-zinc-800/95 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl backdrop-blur-sm max-w-[220px]">
      <p className="text-zinc-400 mb-1 truncate">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardAPI.getMetrics(period);
      setMetrics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader className="w-10 h-10 text-zinc-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-red-400 text-xs font-bold">!</span>
        </div>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 gap-3">
        <Wallet className="w-16 h-16 text-zinc-700" />
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-scale-in">
      {/* Header */}
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral de suas finanças</p>
        </div>
        <div className="page-actions">
          <div className="flex gap-1 bg-zinc-800/50 rounded-xl p-1 w-full sm:w-auto">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-0 ${
                  period === key
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white active:bg-zinc-700/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards — 2 colunas no celular */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-zinc-500 text-[11px] sm:text-xs mb-1 uppercase tracking-wider font-medium">Saldo Total</p>
              <p className="text-base sm:text-2xl font-bold text-white truncate">
                R$ {metrics.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 rounded-xl hidden xs:flex sm:flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-zinc-100" />
            </div>
          </div>
        </div>

        <div className="card hover:border-emerald-700/50 transition-all duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-zinc-500 text-[11px] sm:text-xs mb-1 uppercase tracking-wider font-medium">Receitas</p>
              <p className="text-base sm:text-2xl font-bold text-emerald-400 truncate">
                R$ {metrics.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-xl hidden xs:flex sm:flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="card hover:border-red-700/50 transition-all duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-zinc-500 text-[11px] sm:text-xs mb-1 uppercase tracking-wider font-medium">Despesas</p>
              <p className="text-base sm:text-2xl font-bold text-red-400 truncate">
                R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-xl hidden xs:flex sm:flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className="card hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-zinc-500 text-[11px] sm:text-xs mb-1 uppercase tracking-wider font-medium">Transações</p>
              <p className="text-base sm:text-2xl font-bold text-white">{metrics.transactionCount}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 rounded-xl hidden xs:flex sm:flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-zinc-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Receitas vs Despesas</h2>
          <div className="h-[260px] sm:h-[300px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyData} margin={{ left: -12, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.5} />
                <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis stroke="#52525b" tick={{ fontSize: 11 }} width={56} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#27272a', fillOpacity: 0.3 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                <Bar dataKey="income" fill="#34d399" name="Receitas" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" fill="#f87171" name="Despesas" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Distribuição por Categoria</h2>
          <div className="h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={85}
                  fill="#ffffff"
                  dataKey="amount"
                  nameKey="name"
                >
                  {metrics.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} layout="horizontal" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legenda acessível no mobile (labels dentro do donut estouram) */}
          <ul className="mt-2 space-y-1.5 sm:hidden">
            {metrics.categoryDistribution.slice(0, 5).map((c: any, i: number) => (
              <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate flex-1">{c.name}</span>
                <span className="font-medium text-zinc-200">{c.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Transactions — tabela no desktop, cards no celular */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">Transações Recentes</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Descrição</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Categoria</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Data</th>
                <th className="text-right py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-500 text-sm">Nenhuma transação recente</td>
                </tr>
              ) : (
                metrics.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 text-zinc-100 text-sm">{transaction.description || 'Sem descrição'}</td>
                    <td className="py-3 px-4 text-zinc-400 text-sm">
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-sm">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium text-sm ${
                      transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="sm:hidden space-y-2">
          {metrics.recentTransactions.length === 0 ? (
            <li className="text-center py-8 text-zinc-500 text-sm">Nenhuma transação recente</li>
          ) : (
            metrics.recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center gap-3 p-3 bg-zinc-800/40 border border-zinc-800/60 rounded-xl"
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-red-400" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-zinc-100 truncate">
                    {transaction.description || 'Sem descrição'}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </span>
                </span>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
