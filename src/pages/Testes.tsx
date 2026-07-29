import { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, Zap, AlertCircle, Eye, X } from 'lucide-react';
import api from '../services/api';

interface Test {
  id: number;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  duration: number;
  timestamp: string;
  error?: string;
}

interface TestStats {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
  averageDuration: number;
  passRate: number;
  failureRate: number;
  lastRun: string;
  coverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
}

export default function Testes() {
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [runMessage, setRunMessage] = useState('');
  const [runError, setRunError] = useState('');
  const [viewTarget, setViewTarget] = useState<{ id: number; name: string; html: string } | null>(null);

  useEffect(() => {
    fetchTests();
  }, [page]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tests?page=${page}&pageSize=${pageSize}`);
      const data = response.data;
      const items: any[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setHasNext(!Array.isArray(data) && data?.hasNext === true);
      setTests(items.map((t: any, i: number) => ({
        id: t.id ?? i,
        name: `Teste #${t.id} - ${t.date ?? new Date(t.createdAt).toLocaleDateString('pt-BR')}`,
        description: t.reportHtml
          ? `Relatório HTML disponível (${(t.reportHtml.length / 1024).toFixed(0)} KB)`
          : `Executado em ${t.date ?? new Date(t.createdAt).toLocaleDateString('pt-BR')} às ${t.time ?? ''}`,
        status: t.status ?? 'passed',
        duration: t.duration ?? 0,
        timestamp: t.createdAt ?? new Date().toISOString(),
      })));
      setStats({
        totalTests: items.length,
        passed: items.filter((t: any) => t.status === 'passed').length,
        failed: items.filter((t: any) => t.status === 'failed').length,
        skipped: items.filter((t: any) => t.status === 'pending' || t.status === 'skipped').length,
        totalDuration: items.reduce((s: number, t: any) => s + (t.duration ?? 0), 0),
        averageDuration: items.length ? Math.round(items.reduce((s: number, t: any) => s + (t.duration ?? 0), 0) / items.length) : 0,
        passRate: items.length ? Math.round((items.filter((t: any) => t.status === 'passed').length / items.length) * 100) : 0,
        failureRate: items.length ? Math.round((items.filter((t: any) => t.status === 'failed').length / items.length) * 100) : 0,
        lastRun: items.length ? items[0].timestamp : new Date().toISOString(),
        coverage: { lines: 0, branches: 0, functions: 0, statements: 0 },
      });
    } catch (error) {
      console.error('Erro ao buscar testes:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    try {
      setRunning(true); setRunMessage(''); setRunError('');
      const res = await api.post('/acbr-tests/run');
      const data = res.data;
      if (data?.success) {
        const s = data.summary;
        const suitesOk = s.suites.filter((su: any) => su.failed === 0).length;
        setRunMessage(`ACBr: ${s.passed}/${s.total} testes passaram (${suitesOk}/${s.suites.length} suítes) — ${s.durationMs}ms`);
        if (data.reportHtml) {
          setViewTarget({ id: 0, name: `ACBr Tests - ${new Date(data.timestamp).toLocaleString('pt-BR')}`, html: data.reportHtml });
        }
      } else {
        setRunError(data?.error || 'Erro ao executar testes ACBr');
      }
      await fetchTests();
    } catch (error: any) {
      setRunError(error.response?.data?.details || error.message);
    } finally {
      setRunning(false);
    }
  };

  const handleViewReport = async (testId: number) => {
    try {
      const res = await api.get(`/tests/${testId}`);
      const html = res.data?.reportHtml;
      if (html) {
        setViewTarget({ id: testId, name: res.data?.date ? `Teste #${testId} - ${res.data.date}` : `Teste #${testId}`, html });
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running': return <Zap className="w-5 h-5 text-amber-400 animate-pulse" />;
      default: return <Clock className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return 'badge-success';
      case 'failed': return 'badge-error';
      case 'running': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'passed': return 'Passou';
      case 'failed': return 'Falhou';
      case 'running': return 'Executando';
      default: return 'Pendente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Testes</h1>
          <p className="text-zinc-500">Gerenciador de testes unitários e integração</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={running}
          className="btn-primary flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {running ? 'Executando...' : 'Executar Todos'}
        </button>
      </div>

      {/* Run feedback */}
      {runMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{runMessage}
        </div>
      )}
      {runError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{runError}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalTests}</p>
          </div>
          <div className="card">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Passou</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.passed}</p>
          </div>
          <div className="card">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Falhou</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</p>
          </div>
          <div className="card">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Sucesso</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.passRate}%</p>
          </div>
          <div className="card">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-medium">Cobertura</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{stats.coverage.lines}%</p>
          </div>
        </div>
      )}

      {/* Tests Table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Resultados dos Testes</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Carregando testes...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Nenhum teste encontrado</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Nome</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Descrição</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Duração</th>
                <th className="text-right py-3 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className={`badge ${getStatusBadge(test.status)}`}>
                        {getStatusLabel(test.status)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-zinc-100 text-sm font-medium">{test.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-zinc-400 text-sm">{test.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-zinc-400 text-sm">{test.duration}ms</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleViewReport(test.id)}
                      className="btn-ghost inline-flex items-center gap-1 px-2 py-1 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-4">
          <p className="text-sm text-zinc-500">Página {page}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Anterior
            </button>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <input
                type="number"
                min={1}
                value={page}
                onChange={e => { const v = parseInt(e.target.value); if (v >= 1) setPage(v); }}
                className="w-14 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-white text-sm focus:outline-none focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* View Report Modal */}
      {viewTarget && (
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()} style={{animation: 'slideUp 0.2s ease-out'}}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">{viewTarget.name}</h2>
              <button onClick={() => setViewTarget(null)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white rounded-b-xl">
              <iframe
                srcDoc={viewTarget.html}
                title="Relatório de Testes"
                className="w-full h-full border-0"
                style={{ minHeight: '70vh' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Coverage Details */}
      {stats && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Cobertura de Código</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-medium">Linhas</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.coverage.lines}%` }} />
              </div>
              <p className="text-white font-medium mt-1 text-sm">{stats.coverage.lines}%</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-medium">Branches</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.coverage.branches}%` }} />
              </div>
              <p className="text-white font-medium mt-1 text-sm">{stats.coverage.branches}%</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-medium">Funções</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.coverage.functions}%` }} />
              </div>
              <p className="text-white font-medium mt-1 text-sm">{stats.coverage.functions}%</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wider font-medium">Statements</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.coverage.statements}%` }} />
              </div>
              <p className="text-white font-medium mt-1 text-sm">{stats.coverage.statements}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
