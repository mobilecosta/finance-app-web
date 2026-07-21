import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI, type DashboardMetrics } from '../services/api';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Loader } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMetrics('month');
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
        <Loader className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-zinc-500">Nenhum dado disponível</div>;
  }

  const COLORS = ['#000000', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Dashboard</h1>
        <p className="text-zinc-500">Visão geral de suas finanças</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-sm mb-1">Saldo Total</p>
              <p className="text-2xl font-bold text-zinc-900">
                R$ {metrics.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-zinc-900" />
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-sm mb-1">Receitas</p>
              <p className="text-2xl font-bold text-zinc-900">
                R$ {metrics.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-zinc-900" />
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-sm mb-1">Despesas</p>
              <p className="text-2xl font-bold text-zinc-900">
                R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-zinc-900" />
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-sm mb-1">Transações</p>
              <p className="text-2xl font-bold text-zinc-900">{metrics.transactionCount}</p>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-zinc-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Receitas vs Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#111827' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#000000" name="Receitas" />
              <Bar dataKey="expense" fill="#71717a" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Distribuição por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, payload }: any) => `${name}: ${payload.percentage}%`}
                outerRadius={80}
                fill="#000000"
                dataKey="amount"
              >
                {metrics.categoryDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#111827' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Transações Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-sm">Descrição</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-sm">Categoria</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-sm">Data</th>
                <th className="text-right py-3 px-4 text-zinc-500 font-medium text-sm">Valor</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-4 text-zinc-900">{transaction.description || 'Sem descrição'}</td>
                  <td className="py-3 px-4 text-zinc-600">{transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
                  <td className="py-3 px-4 text-zinc-500 text-sm">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium text-zinc-900`}>
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
