import { useEffect, useState } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { nfseAPI, type NfseCredentials, type NfseListagemItem, type NfseDetalhe } from '../services/nfse-api';

type Tab = 'credenciais' | 'listar' | 'consultar' | 'emitir' | 'cancelar';

const TABS: { key: Tab; label: string }[] = [
  { key: 'credenciais', label: 'Credenciais' },
  { key: 'listar', label: 'Listar' },
  { key: 'consultar', label: 'Consultar' },
  { key: 'emitir', label: 'Emitir' },
  { key: 'cancelar', label: 'Cancelar' },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    processando: 'bg-yellow-500/20 text-yellow-400',
    autorizado: 'bg-green-500/20 text-green-400',
    cancelado: 'bg-red-500/20 text-red-400',
    rejeitado: 'bg-red-500/20 text-red-400',
    novo: 'bg-blue-500/20 text-blue-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? 'bg-slate-500/20 text-slate-400'}`}>
      {status}
    </span>
  );
}

type ViewState = 'idle' | 'loading' | 'error' | 'success';

export default function Nfse() {
  const [activeTab, setActiveTab] = useState<Tab>('credenciais');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Credentials
  const [creds, setCreds] = useState<NfseCredentials>({ clientId: '', clientSecret: '' });
  const [credsSaved, setCredsSaved] = useState(false);
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>('homologacao');

  // List
  const [listCpfCnpj, setListCpfCnpj] = useState('');
  const [listResult, setListResult] = useState<NfseListagemItem[]>([]);

  // Consult
  const [consultId, setConsultId] = useState('');
  const [consultResult, setConsultResult] = useState<NfseDetalhe | null>(null);

  // Emitir
  const [emitCnpjPrest, setEmitCnpjPrest] = useState('');
  const [emitCnpjTom, setEmitCnpjTom] = useState('');
  const [emitNomeTom, setEmitNomeTom] = useState('');
  const [emitDescServ, setEmitDescServ] = useState('');
  const [emitValor, setEmitValor] = useState('');
  const [emitResult, setEmitResult] = useState<{ id: string; status: string; numero: string } | null>(null);

  // Cancelar
  const [cancelId, setCancelId] = useState('');
  const [cancelResult, setCancelResult] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    const saved = nfseAPI.getCredentials();
    if (saved) {
      setCreds(saved);
      setCredsSaved(true);
    }
  }, []);

  function clearMessages() {
    setErrorMsg('');
    setSuccessMsg('');
    setViewState('idle');
  }

  async function handleSaveCreds() {
    if (!creds.clientId || !creds.clientSecret) {
      setErrorMsg('Preencha Client ID e Client Secret'); setViewState('error'); return;
    }
    nfseAPI.saveCredentials(creds);
    setCredsSaved(true);
    setSuccessMsg('Credenciais salvas');
    setViewState('success');
  }

  async function handleClearCreds() {
    nfseAPI.clearCredentials();
    setCreds({ clientId: '', clientSecret: '' });
    setCredsSaved(false);
    setSuccessMsg('Credenciais removidas');
    setViewState('success');
  }

  async function handleListar() {
    if (!listCpfCnpj) { setErrorMsg('Informe o CPF/CNPJ'); setViewState('error'); return; }
    clearMessages();
    setViewState('loading');
    try {
      const res = await nfseAPI.listar(listCpfCnpj, ambiente);
      setListResult(res.data ?? []);
      setViewState('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao listar');
      setViewState('error');
    }
  }

  async function handleConsultar() {
    if (!consultId) { setErrorMsg('Informe o ID da NFS-e'); setViewState('error'); return; }
    clearMessages();
    setViewState('loading');
    try {
      const res = await nfseAPI.consultar(consultId, ambiente);
      setConsultResult(res);
      setViewState('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao consultar');
      setViewState('error');
    }
  }

  async function handleEmitir() {
    if (!emitCnpjPrest || !emitCnpjTom || !emitNomeTom || !emitDescServ || !emitValor) {
      setErrorMsg('Preencha todos os campos obrigatórios'); setViewState('error'); return;
    }
    clearMessages();
    setViewState('loading');
    try {
      const res = await nfseAPI.emitir({
        provedor: 'padrao',
        ambiente,
        infDPS: {
          prest: { CNPJ: emitCnpjPrest },
          toma: { CNPJ: emitCnpjTom, xNome: emitNomeTom },
          serv: { xDiscServico: emitDescServ, vServicos: parseFloat(emitValor) },
          dCompet: new Date().toISOString().split('T')[0],
        },
      });
      setEmitResult(res);
      setSuccessMsg(`NFS-e emitida! Nº ${res.numero} (${res.status})`);
      setViewState('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao emitir');
      setViewState('error');
    }
  }

  async function handleCancelar() {
    if (!cancelId) { setErrorMsg('Informe o ID da NFS-e'); setViewState('error'); return; }
    clearMessages();
    setViewState('loading');
    try {
      const res = await nfseAPI.cancelar(cancelId, ambiente);
      setCancelResult(res);
      setSuccessMsg(`Cancelamento solicitado: ${res.status}`);
      setViewState('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao cancelar');
      setViewState('error');
    }
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'credenciais':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Obtenha suas credenciais no console da ACBr API.</p>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Client ID</label>
              <input
                className="input font-mono text-sm"
                placeholder="seu-client-id"
                value={creds.clientId}
                onChange={e => setCreds(c => ({ ...c, clientId: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Client Secret</label>
              <input
                className="input font-mono text-sm"
                type="password"
                placeholder="seu-client-secret"
                value={creds.clientSecret}
                onChange={e => setCreds(c => ({ ...c, clientSecret: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ambiente</label>
              <div className="flex gap-2">
                {(['homologacao', 'producao'] as const).map(a => (
                  <button
                    key={a}
                    onClick={() => setAmbiente(a)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ambiente === a
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {a === 'homologacao' ? 'Homologação' : 'Produção'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={handleSaveCreds}>Salvar credenciais</button>
              {credsSaved && <button className="btn-secondary text-red-400" onClick={handleClearCreds}>Remover</button>}
            </div>
            {credsSaved && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" /> Credenciais salvas
              </div>
            )}
          </div>
        );

      case 'listar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">CPF/CNPJ do prestador</label>
              <input
                className="input font-mono text-sm"
                placeholder="00000000000000"
                value={listCpfCnpj}
                onChange={e => setListCpfCnpj(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={handleListar} disabled={viewState === 'loading'}>
              {viewState === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : 'Listar'}
            </button>
            {listResult.length > 0 && (
              <div className="space-y-2">
                {listResult.map(item => (
                  <div key={item.id} className="card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">Nº {item.numero}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-400">ID: {item.id}</p>
                    {item.codigo_verificacao && <p className="text-xs text-slate-400">Código: {item.codigo_verificacao}</p>}
                    <p className="text-xs text-slate-400">Emissão: {item.data_emissao ? new Date(item.data_emissao).toLocaleString('pt-BR') : '—'}</p>
                  </div>
                ))}
              </div>
            )}
            {listResult.length === 0 && viewState === 'success' && (
              <p className="text-sm text-slate-400">Nenhuma NFS-e encontrada</p>
            )}
          </div>
        );

      case 'consultar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ID da NFS-e</label>
              <input
                className="input font-mono text-sm"
                placeholder="ID da nota"
                value={consultId}
                onChange={e => setConsultId(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={handleConsultar} disabled={viewState === 'loading'}>
              {viewState === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : 'Consultar'}
            </button>
            {consultResult && (
              <div className="card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Número</span>
                  <span className="text-sm font-medium text-white">{consultResult.numero}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <StatusBadge status={consultResult.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Código verificação</span>
                  <span className="text-sm font-mono text-white">{consultResult.codigo_verificacao}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Link</span>
                  <a href={consultResult.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate max-w-xs">{consultResult.link_url}</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Emissão</span>
                  <span className="text-sm text-white">{consultResult.data_emissao ? new Date(consultResult.data_emissao).toLocaleString('pt-BR') : '—'}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'emitir':
        return (
          <div className="space-y-4 max-w-lg">
            <p className="text-sm text-slate-400">Preencha os dados do prestador e tomador.</p>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Prestador</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ</label>
              <input className="input font-mono text-sm" placeholder="00000000000000" value={emitCnpjPrest} onChange={e => setEmitCnpjPrest(e.target.value)} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Tomador</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ/CPF</label>
              <input className="input font-mono text-sm" placeholder="00000000000000" value={emitCnpjTom} onChange={e => setEmitCnpjTom(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
              <input className="input text-sm" placeholder="Nome do tomador" value={emitNomeTom} onChange={e => setEmitNomeTom(e.target.value)} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Serviço</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
              <input className="input text-sm" placeholder="Descrição do serviço" value={emitDescServ} onChange={e => setEmitDescServ(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Valor (R$)</label>
              <input className="input font-mono text-sm" type="number" step="0.01" placeholder="100.00" value={emitValor} onChange={e => setEmitValor(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleEmitir} disabled={viewState === 'loading'}>
              {viewState === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : 'Emitir NFS-e'}
            </button>
            {emitResult && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" /> NFS-e emitida! Nº {emitResult.numero} ({emitResult.status})
              </div>
            )}
          </div>
        );

      case 'cancelar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ID da NFS-e</label>
              <input className="input font-mono text-sm" placeholder="ID da nota a cancelar" value={cancelId} onChange={e => setCancelId(e.target.value)} />
            </div>
            <button className="btn-secondary text-red-400 border-red-400/30" onClick={handleCancelar} disabled={viewState === 'loading'}>
              {viewState === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : 'Cancelar NFS-e'}
            </button>
            {cancelResult && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" /> Cancelamento: {cancelResult.status}
              </div>
            )}
          </div>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">NFS-e ACBr</h1>
        <p className="text-slate-400">Consumo da API ACBr para Nota Fiscal de Serviços Eletrônica</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); clearMessages(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Warning */}
      {!credsSaved && activeTab !== 'credenciais' && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Configure as credenciais da ACBr API na aba Credenciais primeiro.
        </div>
      )}

      {/* Error */}
      {viewState === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {viewState === 'success' && successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Loading */}
      {viewState === 'loading' && (
        <div className="flex items-center justify-center p-8">
          <Loader className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      )}

      {/* Content */}
      {viewState !== 'loading' && (
        <div className="card">
          {renderTabContent()}
        </div>
      )}
    </div>
  );
}
