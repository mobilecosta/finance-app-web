import { useEffect, useState } from 'react';
import { accountsAPI, type Account } from '../services/api';
import { Plus, Trash2, Edit2, Loader, AlertCircle } from 'lucide-react';

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    color: '#3b82f6',
    icon: 'wallet.pass',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.list();
      setAccounts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await accountsAPI.update(editingId, {
          name: formData.name,
          type: formData.type,
          balance: parseFloat(formData.balance),
          color: formData.color,
          icon: formData.icon,
        });
      } else {
        await accountsAPI.create({
          name: formData.name,
          type: formData.type,
          balance: parseFloat(formData.balance),
          color: formData.color,
          icon: formData.icon,
        });
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        name: '',
        type: 'checking',
        balance: '',
        color: '#3b82f6',
        icon: 'wallet.pass',
      });
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar conta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta conta?')) return;
    try {
      await accountsAPI.delete(id);
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar conta');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      color: account.color,
      icon: account.icon,
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
          <h1 className="text-3xl font-bold text-white mb-2">Contas</h1>
          <p className="text-slate-400">Gerencie suas contas bancárias</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              type: 'checking',
              balance: '',
              color: '#3b82f6',
              icon: 'wallet.pass',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Conta
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
              {editingId ? 'Editar Conta' : 'Nova Conta'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Conta Corrente"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="checking">Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="credit">Crédito</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Saldo Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
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

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="card border-l-4"
            style={{ borderLeftColor: account.color }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{account.name}</h3>
                <p className="text-sm text-slate-400 capitalize">{account.type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="p-1 hover:bg-blue-500/20 rounded transition-colors text-blue-400"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">
                R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <span className="text-xs text-slate-400">
                  {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  account.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {account.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
