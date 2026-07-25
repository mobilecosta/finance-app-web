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

  // Buscar testes ao carregar
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
      const res = await api.post('/tests/run-all');
      if (res.data?.success) {
        setRunMessage(res.data.message || 'Testes executados com sucesso');
      } else {
        setRunError(res.data?.error || 'Erro ao executar testes');
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
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Zap className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'passed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'running':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Testes</h1>
          <p className="text-gray-400 mt-1">Gerenciador de testes unitários e integração</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors font-medium"
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">Total de Testes</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalTests}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">Passou</p>
            <p className="text-2xl font-bold text-green-500 mt-2">{stats.passed}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">Falhou</p>
            <p className="text-2xl font-bold text-red-500 mt-2">{stats.failed}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">Taxa de Sucesso</p>
            <p className="text-2xl font-bold text-blue-500 mt-2">{stats.passRate}%</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">Cobertura</p>
            <p className="text-2xl font-bold text-purple-500 mt-2">{stats.coverage.lines}%</p>
          </div>
        </div>
      )}

      {/* Tests Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Resultados dos Testes</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-zinc-400">Carregando testes...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-400">Nenhum teste encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Duração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-zinc-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className={getStatusBadge(test.status)}>
                          {test.status === 'passed' ? 'Passou' : test.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{test.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-400 text-sm">{test.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 text-sm">{test.duration}ms</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewReport(test.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-50 transition-colors text-sm"
          >
            Anterior
          </button>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Página</span>
            <input
              type="number"
              min={1}
              value={page}
              onChange={e => { const v = parseInt(e.target.value); if (v >= 1) setPage(v); }}
              className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-white focus:outline-none focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNext}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-50 transition-colors text-sm"
          >
            Próxima
          </button>
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Cobertura de Código</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Linhas</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.coverage.lines}%` }}
                ></div>
              </div>
              <p className="text-white font-medium mt-2">{stats.coverage.lines}%</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">Branches</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.coverage.branches}%` }}
                ></div>
              </div>
              <p className="text-white font-medium mt-2">{stats.coverage.branches}%</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">Funções</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${stats.coverage.functions}%` }}
                ></div>
              </div>
              <p className="text-white font-medium mt-2">{stats.coverage.functions}%</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">Statements</p>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${stats.coverage.statements}%` }}
                ></div>
              </div>
              <p className="text-white font-medium mt-2">{stats.coverage.statements}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
