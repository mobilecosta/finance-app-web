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
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-slate-400">Nenhum dado disponível</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Visão geral de suas finanças</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Saldo Total</p>
              <p className="text-2xl font-bold text-white">
                R$ {metrics.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Receitas</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {metrics.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {metrics.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Transações</p>
              <p className="text-2xl font-bold text-white">{metrics.transactionCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Receitas vs Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Receitas" />
              <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
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
                fill="#8884d8"
                dataKey="amount"
              >
                {metrics.categoryDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
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
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Descrição</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Categoria</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Data</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Valor</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 text-white">{transaction.description || 'Sem descrição'}</td>
                  <td className="py-3 px-4 text-slate-300">{transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
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
