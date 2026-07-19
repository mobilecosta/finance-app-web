import { useEffect, useState } from 'react';
import { transactionsAPI, type Transaction, type Category, type Account, accountsAPI, categoriesAPI } from '../services/api';
import { Plus, Trash2, Edit2, Loader, AlertCircle } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'completed' | 'pending' | 'cancelled',
    categoryId: '',
    accountId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txRes, catRes, accRes] = await Promise.all([
        transactionsAPI.list(),
        categoriesAPI.list(),
        accountsAPI.list(),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setAccounts(accRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await transactionsAPI.update(editingId, {
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          status: formData.status,
        });
      } else {
        await transactionsAPI.create({
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          status: formData.status,
          categoryId: parseInt(formData.categoryId),
          accountId: parseInt(formData.accountId),
        });
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        categoryId: '',
        accountId: '',
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar transação');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta transação?')) return;
    try {
      await transactionsAPI.delete(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar transação');
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setFormData({
      type: tx.type,
      amount: tx.amount.toString(),
      description: tx.description || '',
      date: tx.date,
      status: tx.status,
      categoryId: tx.categoryId.toString(),
      accountId: tx.accountId.toString(),
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transações</h1>
          <p className="text-slate-400">Gerencie suas transações financeiras</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: 'expense',
              amount: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
              status: 'completed',
              categoryId: '',
              accountId: '',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Editar Transação' : 'Nova Transação'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="input"
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da transação"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'completed' | 'pending' | 'cancelled' })}
                    className="input"
                  >
                    <option value="completed">Concluído</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Selecione...</option>
                    {categories.filter(c => c.type === formData.type || c.type === 'both').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Conta</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Selecione...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Descrição</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Tipo</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Categoria</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Data</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Valor</th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-3 px-4 text-white">{tx.description || '-'}</td>
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{categories.find(c => c.id === tx.categoryId)?.name || '-'}</td>
                <td className="py-3 px-4 text-slate-400 text-sm">
                  {new Date(tx.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status === 'completed' ? 'Concluído' : tx.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </span>
                </td>
                <td className={`py-3 px-4 text-right font-medium ${
                  tx.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
