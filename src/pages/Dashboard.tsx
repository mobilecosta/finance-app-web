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

const COLORS = ['#ffffff', '#a1a1aa', '#52525b', '#3f3f46', '#27272a', '#18181b'];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
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
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 text-zinc-400 animate-spin" />
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
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
        <Wallet className="w-12 h-12 text-zinc-700" />
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-zinc-500">Visão geral de suas finanças</p>
        </div>
        <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                period === key
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Saldo Total</p>
              <p className="text-2xl font-bold text-white">
                R$ {metrics.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-zinc-100" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Receitas</p>
              <p className="text-2xl font-bold text-emerald-400">
                R$ {metrics.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Despesas</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Transações</p>
              <p className="text-2xl font-bold text-white">{metrics.transactionCount}</p>
            </div>
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-zinc-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Receitas vs Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }}
              />
              <Bar dataKey="income" fill="#34d399" name="Receitas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f87171" name="Despesas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Distribuição por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, payload }: any) => `${name}: ${payload.percentage}%`}
                outerRadius={80}
                fill="#ffffff"
                dataKey="amount"
              >
                {metrics.categoryDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Transações Recentes</h2>
        <div className="overflow-x-auto">
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
              {metrics.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
