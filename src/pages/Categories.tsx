import { useEffect, useState } from 'react';
import { categoriesAPI, type Category } from '../services/api';
import { Plus, Trash2, Edit2, Loader, AlertCircle, X } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', type: 'expense' as 'income' | 'expense' | 'both', color: '#3b82f6', icon: 'tag.fill',
  });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try { setLoading(true); setError(''); const response = await categoriesAPI.list(); setCategories(response.data.items); }
    catch (err: any) { setError(err.response?.data?.message || 'Erro ao carregar categorias'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await categoriesAPI.update(editingId, { name: formData.name, type: formData.type, color: formData.color, icon: formData.icon });
      else await categoriesAPI.create({ name: formData.name, type: formData.type, color: formData.color, icon: formData.icon });
      setShowModal(false); setEditingId(null);
      setFormData({ name: '', type: 'expense', color: '#3b82f6', icon: 'tag.fill' });
      loadCategories();
    } catch (err: any) { setError(err.response?.data?.message || 'Erro ao salvar categoria'); }
  };

  const handleDelete = async (id: number) => {
    try { await categoriesAPI.delete(id); setDeleteConfirm(null); loadCategories(); }
    catch (err: any) { setError(err.response?.data?.message || 'Erro ao deletar categoria'); setDeleteConfirm(null); }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, type: category.type as 'income' | 'expense' | 'both', color: category.color, icon: category.icon });
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
          <h1 className="text-3xl font-bold text-white mb-1">Categorias</h1>
          <p className="text-zinc-500">Organize suas transações por categorias</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ name: '', type: 'expense', color: '#3b82f6', icon: 'tag.fill' }); setShowModal(true); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Categoria
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
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nome</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Alimentação" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' | 'both' })} className="input">
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                  <option value="both">Ambos</option>
                </select>
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
            <p className="text-sm text-zinc-400 mb-6">Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm">Excluir</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="card border-l-4" style={{ borderLeftColor: category.color }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                <p className="text-sm text-zinc-500">
                  {category.type === 'income' ? 'Receita' : category.type === 'expense' ? 'Despesa' : 'Ambos'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(category)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-400">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(category.id)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <span className={`badge ${category.isActive ? 'badge-success' : 'badge-error'}`}>
                {category.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500 text-sm">Nenhuma categoria encontrada</div>
        )}
      </div>
    </div>
  );
}
