import { useEffect, useState } from 'react';
import { Loader, AlertCircle, CheckCircle, Plus, Trash2, Edit2, X, Search, FileText, Building2 } from 'lucide-react';
import { empresaAPI, type Empresa, type EmpresaConfigNfse } from '../services/nfse-api';

type Tab = 'lista' | 'cadastrar' | 'config';

function EmpresaCard({ empresa, onEdit, onDelete, onConfig }: {
  empresa: Empresa;
  onEdit: (e: Empresa) => void;
  onDelete: (c: string) => void;
  onConfig: (c: string) => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{empresa.nome_razao_social}</h3>
          <p className="text-xs text-slate-400 font-mono">{empresa.cpf_cnpj}</p>
          {empresa.nome_fantasia && <p className="text-xs text-slate-500">{empresa.nome_fantasia}</p>}
          <p className="text-xs text-slate-500">{empresa.email}</p>
          <p className="text-xs text-slate-500">
            {empresa.endereco.cidade}/{empresa.endereco.uf}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onConfig(empresa.cpf_cnpj)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Configurar NFS-e">
            <FileText className="w-4 h-4 text-blue-400" />
          </button>
          <button onClick={() => onEdit(empresa)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Editar">
            <Edit2 className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={() => onDelete(empresa.cpf_cnpj)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Excluir">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyForm: Empresa = {
  cpf_cnpj: '',
  nome_razao_social: '',
  nome_fantasia: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  fone: '',
  email: '',
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    codigo_municipio: '',
    cidade: '',
    uf: '',
    cep: '',
    codigo_pais: '1058',
    pais: 'Brasil',
  },
};

const emptyConfigNfse: EmpresaConfigNfse = {
  regTrib: { opSimpNac: 1, regApTribSN: 0, regEspTrib: 0 },
  rps: { lote: 1, serie: 'S', numero: 1 },
  incentivo_fiscal: false,
  ambiente: 'homologacao',
};

export default function Empresas() {
  const [activeTab, setActiveTab] = useState<Tab>('lista');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filterCnpj, setFilterCnpj] = useState('');

  const [form, setForm] = useState<Empresa>(emptyForm);
  const [editMode, setEditMode] = useState(false);

  const [configCnpj, setConfigCnpj] = useState('');
  const [config, setConfig] = useState<EmpresaConfigNfse>(emptyConfigNfse);
  const [configLoaded, setConfigLoaded] = useState(false);

  function clearMessages() { setError(''); setSuccess(''); }

  async function loadEmpresas() {
    setLoading(true); clearMessages();
    try {
      const res = await empresaAPI.listar(filterCnpj ? { cpf_cnpj: filterCnpj } : undefined);
      setEmpresas(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao listar empresas');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadEmpresas(); }, []);

  async function handleCadastrar() {
    if (!form.cpf_cnpj || !form.nome_razao_social || !form.email) {
      setError('CPF/CNPJ, Razão Social e Email são obrigatórios'); return;
    }
    setLoading(true); clearMessages();
    try {
      if (editMode) {
        await empresaAPI.alterar(form.cpf_cnpj, form);
        setSuccess('Empresa alterada com sucesso');
      } else {
        await empresaAPI.cadastrar(form);
        setSuccess('Empresa cadastrada com sucesso');
      }
      setForm(emptyForm);
      setEditMode(false);
      setActiveTab('lista');
      loadEmpresas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar empresa');
    } finally { setLoading(false); }
  }

  async function handleDeletar(cpfCnpj: string) {
    if (!confirm(`Deletar empresa ${cpfCnpj}?`)) return;
    setLoading(true); clearMessages();
    try {
      await empresaAPI.deletar(cpfCnpj);
      setSuccess('Empresa deletada');
      loadEmpresas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao deletar');
    } finally { setLoading(false); }
  }

  function handleEdit(empresa: Empresa) {
    setForm(empresa);
    setEditMode(true);
    setActiveTab('cadastrar');
  }

  async function handleLoadConfig(cpfCnpj: string) {
    setLoading(true); clearMessages(); setConfigCnpj(cpfCnpj);
    try {
      const res = await empresaAPI.consultarConfigNfse(cpfCnpj);
      setConfig(res);
      setConfigLoaded(true);
      setActiveTab('config');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar configuração');
    } finally { setLoading(false); }
  }

  async function handleSaveConfig() {
    if (!configCnpj) return;
    setLoading(true); clearMessages();
    try {
      await empresaAPI.alterarConfigNfse(configCnpj, config);
      setSuccess('Configuração NFS-e salva');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar configuração');
    } finally { setLoading(false); }
  }

  function openNewForm() {
    setForm(emptyForm);
    setEditMode(false);
    setActiveTab('cadastrar');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Empresas</h1>
          <p className="text-slate-400">Gerencie empresas e configurações na ACBr API</p>
        </div>
        {activeTab === 'lista' && (
          <button className="btn-primary flex items-center gap-2" onClick={openNewForm}>
            <Plus className="w-4 h-4" /> Nova Empresa
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['lista', 'cadastrar', 'config'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); clearMessages(); if (tab !== 'config') setConfigLoaded(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab === 'lista' ? 'Lista' : tab === 'cadastrar' ? (editMode ? 'Editar' : 'Cadastrar') : 'Config NFS-e'}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-blue-400" /></div>
      )}

      {!loading && activeTab === 'lista' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className="input max-w-xs font-mono text-sm"
              placeholder="Filtrar por CPF/CNPJ"
              value={filterCnpj}
              onChange={e => setFilterCnpj(e.target.value)}
            />
            <button className="btn-primary" onClick={loadEmpresas}>
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {empresas.map(emp => (
              <EmpresaCard key={emp.cpf_cnpj} empresa={emp} onEdit={handleEdit} onDelete={handleDeletar} onConfig={handleLoadConfig} />
            ))}
            {empresas.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhuma empresa encontrada</p>}
          </div>
        </div>
      )}

      {!loading && activeTab === 'cadastrar' && (
        <div className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold text-white">{editMode ? 'Editar Empresa' : 'Cadastrar Empresa'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">CPF/CNPJ *</label>
              <input className="input font-mono text-sm" placeholder="00000000000000" value={form.cpf_cnpj} onChange={e => setForm(f => ({ ...f, cpf_cnpj: e.target.value }))} disabled={editMode} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Razão Social *</label>
              <input className="input text-sm" placeholder="Razão social" value={form.nome_razao_social} onChange={e => setForm(f => ({ ...f, nome_razao_social: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome Fantasia</label>
              <input className="input text-sm" placeholder="Nome fantasia" value={form.nome_fantasia ?? ''} onChange={e => setForm(f => ({ ...f, nome_fantasia: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
              <input className="input text-sm" type="email" placeholder="email@empresa.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Inscrição Municipal</label>
              <input className="input font-mono text-sm" placeholder="Inscrição municipal" value={form.inscricao_municipal ?? ''} onChange={e => setForm(f => ({ ...f, inscricao_municipal: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Inscrição Estadual</label>
              <input className="input font-mono text-sm" placeholder="Inscrição estadual" value={form.inscricao_estadual ?? ''} onChange={e => setForm(f => ({ ...f, inscricao_estadual: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
              <input className="input text-sm" placeholder="(11) 99999-9999" value={form.fone ?? ''} onChange={e => setForm(f => ({ ...f, fone: e.target.value }))} />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider pt-2">Endereço</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Logradouro</label>
              <input className="input text-sm" placeholder="Rua, Av..." value={form.endereco.logradouro} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, logradouro: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Número</label>
              <input className="input text-sm" placeholder="123" value={form.endereco.numero ?? ''} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, numero: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Complemento</label>
              <input className="input text-sm" placeholder="Sala 1" value={form.endereco.complemento ?? ''} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, complemento: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bairro</label>
              <input className="input text-sm" placeholder="Centro" value={form.endereco.bairro} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, bairro: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">CEP</label>
              <input className="input font-mono text-sm" placeholder="01001000" value={form.endereco.cep} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, cep: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Código Município (IBGE)</label>
              <input className="input font-mono text-sm" placeholder="3550308" value={form.endereco.codigo_municipio} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, codigo_municipio: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
              <input className="input text-sm" placeholder="São Paulo" value={form.endereco.cidade} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, cidade: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">UF</label>
              <input className="input font-mono text-sm" placeholder="SP" maxLength={2} value={form.endereco.uf} onChange={e => setForm(f => ({ ...f, endereco: { ...f.endereco, uf: e.target.value.toUpperCase() } }))} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-primary" onClick={handleCadastrar}>
              {editMode ? 'Salvar alterações' : 'Cadastrar empresa'}
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab('lista')}>Cancelar</button>
          </div>
        </div>
      )}

      {!loading && activeTab === 'config' && configCnpj && (
        <div className="card max-w-lg space-y-4">
          <h2 className="text-lg font-semibold text-white">Configuração NFS-e</h2>
          <p className="text-sm text-slate-400 font-mono">{configCnpj}</p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ambiente</label>
            <div className="flex gap-2">
              {(['homologacao', 'producao'] as const).map(a => (
                <button key={a} onClick={() => setConfig(c => ({ ...c, ambiente: a }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${config.ambiente === a ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >{a === 'homologacao' ? 'Homologação' : 'Produção'}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Lote RPS</label>
              <input className="input text-sm" type="number" value={config.rps.lote} onChange={e => setConfig(c => ({ ...c, rps: { ...c.rps, lote: parseInt(e.target.value) || 0 } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Série RPS</label>
              <input className="input text-sm" value={config.rps.serie} onChange={e => setConfig(c => ({ ...c, rps: { ...c.rps, serie: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Número RPS</label>
              <input className="input text-sm" type="number" value={config.rps.numero} onChange={e => setConfig(c => ({ ...c, rps: { ...c.rps, numero: parseInt(e.target.value) || 0 } }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Regime Tributário</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Simples Nacional</label>
                <select className="input text-sm" value={config.regTrib.opSimpNac ?? 1} onChange={e => setConfig(c => ({ ...c, regTrib: { ...c.regTrib, opSimpNac: parseInt(e.target.value) } }))}>
                  <option value={1}>Sim</option>
                  <option value={2}>Não</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Regime Apuração</label>
                <input className="input text-sm" type="number" value={config.regTrib.regApTribSN ?? 0} onChange={e => setConfig(c => ({ ...c, regTrib: { ...c.regTrib, regApTribSN: parseInt(e.target.value) || 0 } }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Regime Especial</label>
                <input className="input text-sm" type="number" value={config.regTrib.regEspTrib ?? 0} onChange={e => setConfig(c => ({ ...c, regTrib: { ...c.regTrib, regEspTrib: parseInt(e.target.value) || 0 } }))} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Incentivo Fiscal</label>
            <div className="flex gap-2">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setConfig(c => ({ ...c, incentivo_fiscal: v }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${config.incentivo_fiscal === v ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >{v ? 'Sim' : 'Não'}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-primary" onClick={handleSaveConfig}>Salvar configuração</button>
            <button className="btn-secondary" onClick={() => setActiveTab('lista')}>Voltar</button>
          </div>
        </div>
      )}
    </div>
  );
}
