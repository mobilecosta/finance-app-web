import { useEffect, useState } from 'react';
import { accountsAPI, type Account } from '../services/api';
import { Plus, Trash2, Edit2, Loader, AlertCircle, X } from 'lucide-react';

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', type: 'checking', balance: '', color: '#3b82f6', icon: 'wallet.pass',
  });

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    try { setLoading(true); setError(''); const response = await accountsAPI.list(); setAccounts(response.data); }
    catch (err: any) { setError(err.response?.data?.message || 'Erro ao carregar contas'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await accountsAPI.update(editingId, { name: formData.name, type: formData.type, balance: parseFloat(formData.balance), color: formData.color, icon: formData.icon });
      else await accountsAPI.create({ name: formData.name, type: formData.type, balance: parseFloat(formData.balance), color: formData.color, icon: formData.icon });
      setShowModal(false); setEditingId(null);
      setFormData({ name: '', type: 'checking', balance: '', color: '#3b82f6', icon: 'wallet.pass' });
      loadAccounts();
    } catch (err: any) { setError(err.response?.data?.message || 'Erro ao salvar conta'); }
  };

  const handleDelete = async (id: number) => {
    try { await accountsAPI.delete(id); setDeleteConfirm(null); loadAccounts(); }
    catch (err: any) { setError(err.response?.data?.message || 'Erro ao deletar conta'); setDeleteConfirm(null); }
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setFormData({ name: account.name, type: account.type, balance: account.balance.toString(), color: account.color, icon: account.icon });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Contas</h1>
          <p className="text-zinc-500">Gerencie suas contas bancárias</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ name: '', type: 'checking', balance: '', color: '#3b82f6', icon: 'wallet.pass' }); setShowModal(true); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Conta
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Editar Conta' : 'Nova Conta'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nome</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Conta Corrente" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input">
                  <option value="checking">Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="credit">Crédito</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Saldo Inicial</label>
                <input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} placeholder="0.00" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Cor</label>
                <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="input" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary">{editingId ? 'Atualizar' : 'Criar'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-2">Confirmar exclusão</h2>
            <p className="text-sm text-zinc-400 mb-6">Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm">Excluir</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="card border-l-4" style={{ borderLeftColor: account.color }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{account.name}</h3>
                <p className="text-sm text-zinc-500 capitalize">{account.type}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(account)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-400">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(account.id)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">
                R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">{new Date(account.createdAt).toLocaleDateString('pt-BR')}</span>
                <span className={`badge ${account.isActive ? 'badge-success' : 'badge-error'}`}>
                  {account.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500 text-sm">Nenhuma conta encontrada</div>
        )}
      </div>
    </div>
  );
}
