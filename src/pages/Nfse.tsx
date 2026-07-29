import { useEffect, useState } from 'react';
import { Loader, AlertCircle, CheckCircle, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { nfseAPI, extractError, type NfseCredentials, type NfseListagemItem, type NfseDetalhe } from '../services/nfse-api';

type Tab = 'credenciais' | 'listar' | 'consultar' | 'emitir' | 'cancelar';

const TABS: { key: Tab; label: string }[] = [
  { key: 'credenciais', label: 'Credenciais' },
  { key: 'listar', label: 'Listar' },
  { key: 'consultar', label: 'Consultar' },
  { key: 'emitir', label: 'Emitir' },
  { key: 'cancelar', label: 'Cancelar' },
];

function StatusBadge({ status }: { status: string }) {
  const badgeClass: Record<string, string> = {
    processando: 'badge-warning',
    autorizado: 'badge-success',
    cancelado: 'badge-error',
    rejeitado: 'badge-error',
    novo: 'badge-info',
  };
  const label: Record<string, string> = {
    processando: 'Processando',
    autorizado: 'Autorizado',
    cancelado: 'Cancelado',
    rejeitado: 'Rejeitado',
    novo: 'Novo',
  };
  return <span className={`badge ${badgeClass[status] ?? 'badge-neutral'}`}>{label[status] ?? status}</span>;
}

type ViewState = 'idle' | 'loading' | 'error' | 'success';

export default function Nfse() {
  const [activeTab, setActiveTab] = useState<Tab>('credenciais');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [creds, setCreds] = useState<NfseCredentials>(() => {
    const saved = nfseAPI.getCredentials();
    if (saved) return saved;
    return {
      clientId: import.meta.env.VITE_ACBR_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_ACBR_CLIENT_SECRET || '',
    };
  });
  const [credsSaved, setCredsSaved] = useState(false);
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>('homologacao');

  const [listCnpj, setListCnpj] = useState('');
  const [listResult, setListResult] = useState<NfseListagemItem[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const listPageSize = 10;
  const [detailTarget, setDetailTarget] = useState<NfseDetalhe | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [consultId, setConsultId] = useState('');
  const [consultResult, setConsultResult] = useState<NfseDetalhe | null>(null);

  const [emitCnpjPrest, setEmitCnpjPrest] = useState('');
  const [emitCnpjTom, setEmitCnpjTom] = useState('');
  const [emitNomeTom, setEmitNomeTom] = useState('');
  const [emitDescServ, setEmitDescServ] = useState('');
  const [emitValor, setEmitValor] = useState('');
  const [emitResult, setEmitResult] = useState<{ id: string; status: string; numero: string } | null>(null);

  const [cancelId, setCancelId] = useState('');
  const [cancelResult, setCancelResult] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    const saved = nfseAPI.getCredentials();
    if (saved) { setCreds(saved); setCredsSaved(true); }
    else {
      const envClientId = import.meta.env.VITE_ACBR_CLIENT_ID;
      const envClientSecret = import.meta.env.VITE_ACBR_CLIENT_SECRET;
      if (envClientId && envClientSecret) {
        const envCreds = { clientId: envClientId, clientSecret: envClientSecret };
        nfseAPI.saveCredentials(envCreds);
        setCreds(envCreds);
        setCredsSaved(true);
      }
    }
  }, []);

  function clearMessages() { setErrorMsg(''); setSuccessMsg(''); setViewState('idle'); }

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

  async function fetchListPage(page: number) {
    setViewState('loading');
    try {
      const skip = (page - 1) * listPageSize;
      const res = await nfseAPI.listar(listCnpj, ambiente, listPageSize, skip);
      setListResult(res.data ?? []);
      setListTotal(res['@count'] ?? 0);
      setListPage(page);
      setViewState('success');
    } catch (e) { setErrorMsg(extractError(e)); setViewState('error'); }
  }

  async function handleListar() {
    if (!listCnpj) { setErrorMsg('Informe o CPF/CNPJ'); setViewState('error'); return; }
    clearMessages();
    await fetchListPage(1);
  }

  async function handleVerDetalhes(item: NfseListagemItem) {
    setDetailLoading(true);
    try {
      const res = await nfseAPI.consultar(item.id, ambiente);
      setDetailTarget(res);
    } catch (e) { setErrorMsg(extractError(e)); setViewState('error'); }
    finally { setDetailLoading(false); }
  }

  async function handleConsultar() {
    if (!consultId) { setErrorMsg('Informe o ID da NFS-e'); setViewState('error'); return; }
    clearMessages(); setViewState('loading');
    try {
      const res = await nfseAPI.consultar(consultId, ambiente);
      setConsultResult(res); setViewState('success');
    } catch (e) { setErrorMsg(extractError(e)); setViewState('error'); }
  }

  async function handleEmitir() {
    if (!emitCnpjPrest || !emitCnpjTom || !emitNomeTom || !emitDescServ || !emitValor) {
      setErrorMsg('Preencha todos os campos obrigatórios'); setViewState('error'); return;
    }
    clearMessages(); setViewState('loading');
    try {
      const res = await nfseAPI.emitir({
        provedor: 'padrao', ambiente,
        infDPS: {
          prest: { CNPJ: emitCnpjPrest },
          toma: { CNPJ: emitCnpjTom, xNome: emitNomeTom },
          serv: { xDiscServico: emitDescServ, vServicos: parseFloat(emitValor) },
          dCompet: new Date().toISOString().split('T')[0],
        },
      });
      setEmitResult(res);
      setSuccessMsg(`NFS-e emitida! N ${res.numero} (${res.status})`);
      setViewState('success');
    } catch (e) { setErrorMsg(extractError(e)); setViewState('error'); }
  }

  async function handleCancelar() {
    if (!cancelId) { setErrorMsg('Informe o ID da NFS-e'); setViewState('error'); return; }
    clearMessages(); setViewState('loading');
    try {
      const res = await nfseAPI.cancelar(cancelId, ambiente);
      setCancelResult(res);
      setSuccessMsg(`Cancelamento solicitado: ${res.status}`);
      setViewState('success');
    } catch (e) { setErrorMsg(extractError(e)); setViewState('error'); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">NFS-e ACBr</h1>
        <p className="text-zinc-500">Consumo da API ACBr para Nota Fiscal de Serviços Eletrônica</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); clearMessages(); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Warning */}
      {!credsSaved && activeTab !== 'credenciais' && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Configure as credenciais da ACBr API na aba Credenciais primeiro.
        </div>
      )}

      {/* Error */}
      {viewState === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{errorMsg}
        </div>
      )}

      {/* Success */}
      {viewState === 'success' && successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{successMsg}
        </div>
      )}

      {/* Loading */}
      {viewState === 'loading' && (
        <div className="flex items-center justify-center p-8">
          <Loader className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      )}

      {/* Content */}
      <div className="card" style={{ display: viewState === 'loading' ? 'none' : undefined }}>
          {activeTab === 'credenciais' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500">Obtenha suas credenciais no console da ACBr API.</p>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Client ID</label>
                <input className="input font-mono text-sm" placeholder="seu-client-id" value={creds.clientId} onChange={e => setCreds(c => ({ ...c, clientId: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Client Secret</label>
                <input className="input font-mono text-sm" type="password" placeholder="seu-client-secret" value={creds.clientSecret} onChange={e => setCreds(c => ({ ...c, clientSecret: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Ambiente</label>
                <div className="flex gap-2">
                  {(['homologacao', 'producao'] as const).map(a => (
                    <button key={a} onClick={() => setAmbiente(a)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        ambiente === a ? 'bg-white text-black shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >{a === 'homologacao' ? 'Homologação' : 'Produção'}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={handleSaveCreds}>Salvar credenciais</button>
                {credsSaved && <button className="btn-secondary text-red-400" onClick={handleClearCreds}>Remover</button>}
              </div>
              {credsSaved && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> Credenciais salvas
                </div>
              )}
            </div>
          )}

          {activeTab === 'listar' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">CPF/CNPJ do prestador</label>
                  <input className="input font-mono text-sm" placeholder="00000000000000" value={listCnpj} onChange={e => setListCnpj(e.target.value)} />
                </div>
              </div>
              <button className="btn-primary inline-flex items-center gap-2" onClick={handleListar} disabled={viewState === 'loading'}>
                {viewState === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
                Listar NFS-e
              </button>
              {listResult.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {listResult.map(item => (
                    <div key={item.id} className="card-hover">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-zinc-100">N {item.numero}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="space-y-1 text-xs text-zinc-500">
                        <p>ID: <span className="font-mono text-zinc-400">{item.id}</span></p>
                        {item.codigo_verificacao && <p>Código: <span className="font-mono text-zinc-400">{item.codigo_verificacao}</span></p>}
                        <p>Emissão: {item.data_emissao ? new Date(item.data_emissao).toLocaleString('pt-BR') : '-'}</p>
                      </div>
                      <button onClick={() => handleVerDetalhes(item)} disabled={detailLoading}
                        className="flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50">
                        <Eye className="w-3 h-3" /> Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {listResult.length === 0 && viewState === 'success' && (
                <p className="text-sm text-zinc-500">Nenhuma NFS-e encontrada</p>
              )}

              {/* Pagination */}
              {listResult.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-zinc-500">
                    {listTotal > 0
                      ? `Página ${listPage} (${(listPage - 1) * listPageSize + 1}-${Math.min(listPage * listPageSize, listTotal)} de ${listTotal})`
                      : `Página ${listPage}`}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => fetchListPage(listPage - 1)} disabled={listPage === 1 || viewState === 'loading'}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-800">
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <button onClick={() => fetchListPage(listPage + 1)} disabled={listPage * listPageSize >= (listTotal || Infinity) || viewState === 'loading'}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-800">
                      Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Detalhes Modal */}
              {detailTarget && (
                <div className="modal-overlay" onClick={() => setDetailTarget(null)}>
                  <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Detalhes NFS-e N {detailTarget.numero}</h2>
                      <button onClick={() => setDetailTarget(null)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">ID</span>
                        <span className="text-zinc-100 font-mono">{detailTarget.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Número</span>
                        <span className="text-zinc-100 font-medium">{detailTarget.numero}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Status</span>
                        <StatusBadge status={detailTarget.status} />
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Código verificação</span>
                        <span className="text-zinc-100 font-mono">{detailTarget.codigo_verificacao}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Ambiente</span>
                        <span className="text-zinc-100">{detailTarget.ambiente === 'producao' ? 'Produção' : 'Homologação'}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Referência</span>
                        <span className="text-zinc-100 font-mono">{detailTarget.referencia || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Data emissão</span>
                        <span className="text-zinc-100">{detailTarget.data_emissao ? new Date(detailTarget.data_emissao).toLocaleString('pt-BR') : '-'}</span>
                      </div>
                      {detailTarget.DPS && (
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                          <span className="text-zinc-500">DPS</span>
                          <span className="text-zinc-100 font-mono">Série {detailTarget.DPS.serie}, nDPS {detailTarget.DPS.nDPS}</span>
                        </div>
                      )}
                      {detailTarget.link_url && (
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                          <span className="text-zinc-500">Link</span>
                          <a href={detailTarget.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">{detailTarget.link_url}</a>
                        </div>
                      )}
                      {detailTarget.declaracao_prestacao_servico && (
                        <div className="border-b border-zinc-800 pb-2">
                          <span className="text-zinc-500 block mb-1">Declaração Prestação Serviço</span>
                          <pre className="text-xs text-zinc-300 bg-zinc-900/80 rounded p-2 overflow-auto max-h-40">
                            {JSON.stringify(detailTarget.declaracao_prestacao_servico, null, 2)}
                          </pre>
                        </div>
                      )}
                      {detailTarget.cancelamento && (
                        <div className="border-b border-zinc-800 pb-2">
                          <span className="text-zinc-500 block mb-1">Cancelamento</span>
                          <pre className="text-xs text-zinc-300 bg-zinc-900/80 rounded p-2 overflow-auto max-h-40">
                            {JSON.stringify(detailTarget.cancelamento, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'consultar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">ID da NFS-e</label>
                <input className="input font-mono text-sm" placeholder="ID da nota" value={consultId} onChange={e => setConsultId(e.target.value)} />
              </div>
              <button className="btn-primary inline-flex items-center gap-2" onClick={handleConsultar} disabled={viewState === 'loading'}>
                {viewState === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
                Consultar
              </button>
              {consultResult && (
                <div className="card bg-zinc-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Número</span>
                    <span className="text-sm font-medium text-zinc-100">{consultResult.numero}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Status</span>
                    <StatusBadge status={consultResult.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Código verificação</span>
                    <span className="text-sm font-mono text-zinc-100">{consultResult.codigo_verificacao}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Link</span>
                    <a href={consultResult.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate max-w-xs">{consultResult.link_url}</a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Emissão</span>
                    <span className="text-sm text-zinc-100">{consultResult.data_emissao ? new Date(consultResult.data_emissao).toLocaleString('pt-BR') : '-'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'emitir' && (
            <div className="space-y-4 max-w-lg">
              <p className="text-sm text-zinc-500">Preencha os dados do prestador e tomador.</p>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Prestador</h3>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">CNPJ</label>
                <input className="input font-mono text-sm" placeholder="00000000000000" value={emitCnpjPrest} onChange={e => setEmitCnpjPrest(e.target.value)} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Tomador</h3>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">CNPJ/CPF</label>
                <input className="input font-mono text-sm" placeholder="00000000000000" value={emitCnpjTom} onChange={e => setEmitCnpjTom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nome</label>
                <input className="input text-sm" placeholder="Nome do tomador" value={emitNomeTom} onChange={e => setEmitNomeTom(e.target.value)} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Serviço</h3>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição</label>
                <input className="input text-sm" placeholder="Descrição do serviço" value={emitDescServ} onChange={e => setEmitDescServ(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Valor (R$)</label>
                <input className="input font-mono text-sm" type="number" step="0.01" placeholder="100.00" value={emitValor} onChange={e => setEmitValor(e.target.value)} />
              </div>
              <button className="btn-primary inline-flex items-center gap-2" onClick={handleEmitir} disabled={viewState === 'loading'}>
                {viewState === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
                Emitir NFS-e
              </button>
              {emitResult && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> NFS-e emitida! N {emitResult.numero} ({emitResult.status})
                </div>
              )}
            </div>
          )}

          {activeTab === 'cancelar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">ID da NFS-e</label>
                <input className="input font-mono text-sm" placeholder="ID da nota a cancelar" value={cancelId} onChange={e => setCancelId(e.target.value)} />
              </div>
              <button className="btn-danger inline-flex items-center gap-2" onClick={handleCancelar} disabled={viewState === 'loading'}>
                {viewState === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
                Cancelar NFS-e
              </button>
              {cancelResult && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> Cancelamento: {cancelResult.status}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
