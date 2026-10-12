import { useState } from 'react';
import {
  Database, Download, Upload, KeyRound, Table2, AlertTriangle,
  CheckCircle2, FileJson, FlaskConical, Loader2, Wallet,
} from 'lucide-react';
import {
  DEFAULT_TABS, DEFAULT_SPREADSHEET_ID, DEFAULT_MAPPING,
  type ColumnMapping, type TabPreview,
  fetchTabViaApi, parseCsv, readFileAsText, normalizeTab,
  fetchTabViaBackend,
  guessMapping, buildMigrationPayload, downloadJson,
} from '../services/sheetMigration';

const SAMPLE: Record<string, string> = {
  '01/2026': `Data;Descrição;Valor;Tipo;Categoria;Status
05/01/2026;Salário mensal;8500,00;Receita;Salário;completed
10/01/2026;Aluguel apartamento;-2200,00;Despesa;Moradia;completed
15/01/2026;Supermercado;-842,35;Despesa;Alimentação;completed`,
  '02/2026': `Data;Descrição;Valor;Tipo;Categoria;Status
05/02/2026;Salário mensal;8500,00;Receita;Salário;completed
08/02/2026;Conta de luz;-187,90;Despesa;Moradia;completed
98/13/2026;Linha com data inválida;100,00;Receita;Outros;completed`,
};

type Mode = 'api' | 'csv' | 'backend';

function parseTabsList(text: string): string[] {
  return text.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
}

function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Migracoes() {
  const [subMenu] = useState<'financeiro'>('financeiro');
  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SPREADSHEET_ID);
  const [apiKey, setApiKey] = useState('');
  const [tabsText, setTabsText] = useState(DEFAULT_TABS.join(', '));
  const [mode, setMode] = useState<Mode>('api');
  const [files, setFiles] = useState<Record<string, File>>({});
  const [mapping, setMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);
  const [mappingEdited, setMappingEdited] = useState(false);
  const [previews, setPreviews] = useState<TabPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sampleMode, setSampleMode] = useState(false);

  const tabs = parseTabsList(tabsText);

  const setMap = (field: keyof ColumnMapping, value: string) => {
    setMapping((m) => ({ ...m, [field]: value }));
    setMappingEdited(true);
  };

  const loadSample = () => {
    setSampleMode(true);
    setMode('csv');
    setError('');
    const out: TabPreview[] = Object.entries(SAMPLE).map(([tab, csv]) => {
      const matrix = parseCsv(csv);
      return normalizeTab(tab, matrix, mapping.typeMode === 'signal' && !mappingEdited
        ? { ...mapping, ...Object.fromEntries(Object.entries(guessMapping(matrix[0] ?? [])).filter(([, v]) => v)) }
        : mapping);
    });
    setPreviews(out);
  };

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    setSampleMode(false);
    try {
      const list = tabs;
      if (list.length === 0) throw new Error('Informe ao menos uma aba (ex.: 01/2026).');
      if (mode === 'api' && !apiKey.trim()) {
        throw new Error('Informe a API key do Google (ou troque para modo CSV).');
      }

      let activeMapping = mapping;
      const out: TabPreview[] = [];
      for (const tab of list) {
        try {
          if (mode === 'backend') {
            out.push(await fetchTabViaBackend(tab, spreadsheetId.trim(), activeMapping));
            continue;
          }
          let matrix: string[][];
          if (mode === 'api') {
            matrix = await fetchTabViaApi(spreadsheetId.trim(), tab, apiKey.trim());
          } else {
            const file = files[tab];
            if (!file) {
              out.push({
                tab, headers: [], totalRows: 0, validRows: 0,
                totalIncome: 0, totalExpense: 0, rows: [], issues: [],
                error: 'Nenhum CSV enviado para esta aba.',
              });
              continue;
            }
            matrix = parseCsv(await readFileAsText(file));
          }
          if (!mappingEdited && out.length === 0 && matrix.length > 0) {
            const guessed = guessMapping(matrix[0]);
            const merged: ColumnMapping = { ...activeMapping };
            (Object.keys(guessed) as Array<keyof ColumnMapping>).forEach((k) => {
              if (k !== 'typeMode' && !merged[k] && guessed[k]) merged[k] = guessed[k] as string;
            });
            activeMapping = merged;
            setMapping(merged);
          }
          out.push(normalizeTab(tab, matrix, activeMapping));
        } catch (e) {
          out.push({
            tab, headers: [], totalRows: 0, validRows: 0,
            totalIncome: 0, totalExpense: 0, rows: [], issues: [],
            error: e instanceof Error ? e.message : 'Falha ao ler a aba.',
          });
        }
      }
      setPreviews(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar prévia.');
    } finally {
      setLoading(false);
    }
  };

  const totals = previews.reduce(
    (acc, p) => ({
      tabs: acc.tabs + 1,
      rows: acc.rows + p.totalRows,
      valid: acc.valid + p.validRows,
      income: acc.income + p.totalIncome,
      expense: acc.expense + p.totalExpense,
      issues: acc.issues + p.issues.length,
    }),
    { tabs: 0, rows: 0, valid: 0, income: 0, expense: 0, issues: 0 },
  );

  const exportAll = () => {
    downloadJson('migracao-financeiro.json', {
      spreadsheetId,
      exportedAt: new Date().toISOString(),
      tabs: previews.map((p) => ({ tab: p.tab, totalRows: p.totalRows, validRows: p.validRows })),
      items: buildMigrationPayload(previews),
    });
  };

  const inputCls =
    'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/40';
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Migrações</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Prévia dos dados migrados a partir da planilha do Google para a rotina de transações.
        </p>
      </div>

      {/* Submenu */}
      <div className="flex gap-2 border-b border-zinc-800/80 pb-3">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            subMenu === 'financeiro' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Financeiro
        </button>
      </div>

      {/* Configuração */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 rounded-2xl sm:rounded-xl p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Origem dos dados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Spreadsheet ID</label>
            <input className={inputCls} value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Abas (separadas por vírgula)</label>
            <input className={inputCls} value={tabsText} onChange={(e) => setTabsText(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMode('api')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium min-h-[44px] sm:min-h-0 ${mode === 'api' ? 'bg-white text-black' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}
            >
              <KeyRound className="w-4 h-4" /> <span className="hidden xs:inline sm:inline">API do Google</span><span className="xs:hidden sm:hidden">API</span>
            </button>
            <button
              onClick={() => setMode('csv')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium min-h-[44px] sm:min-h-0 ${mode === 'csv' ? 'bg-white text-black' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}
            >
              <Upload className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => setMode('backend')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium min-h-[44px] sm:min-h-0 ${mode === 'backend' ? 'bg-white text-black' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}
              title="Lê a planilha direto do Google via finance-backend (sem API key)"
            >
              <Database className="w-4 h-4" /> <span className="hidden xs:inline sm:inline">Migração direta</span><span className="xs:hidden sm:hidden">Direta</span>
            </button>
          </div>
          {mode === 'api' && (
            <input
              className={inputCls + ' max-w-md'}
              type="password"
              placeholder="API key do Google Cloud (Sheets API v4)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
        </div>
        {mode === 'csv' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <label key={tab} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300">
                <span className="font-medium text-white w-20">{tab}</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFiles((prev) => ({ ...prev, [tab]: f }));
                  }}
                />
                {files[tab] && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </label>
            ))}
          </div>
        )}

        <h2 className="text-sm font-semibold text-white uppercase tracking-widest pt-2">Mapeamento de colunas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mode === 'backend' ? (
            <p className="text-xs text-zinc-500 sm:col-span-2 lg:col-span-3">
              Na migração direta a detecção de colunas é automática no servidor
              (DIA + VLR DESPESA/RECEITA + competência da aba). Abaixo, só o modo
              de interpretação do tipo é enviado.
            </p>
          ) : (
            [
              ['date', 'Data'],
              ['description', 'Descrição'],
              ['amount', 'Valor'],
              ['type', 'Tipo'],
              ['category', 'Categoria'],
              ['status', 'Status'],
            ] as Array<[keyof ColumnMapping, string]>
          ).map(([field, label]) => (
            <div key={field}>
              <label className={labelCls}>{label} (cabeçalho)</label>
              <input
                className={inputCls}
                placeholder="Ex.: Data"
                value={mapping[field] as string}
                onChange={(e) => setMap(field, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={labelCls}>Interpretação do tipo</label>
            <select
              className={inputCls}
              value={mapping.typeMode}
              onChange={(e) => setMap('typeMode', e.target.value)}
            >
              <option value="signal">Sinal do valor (+ receita / − despesa)</option>
              <option value="column">Coluna Tipo</option>
              <option value="fixed-income">Tudo receita</option>
              <option value="fixed-expense">Tudo despesa</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-1">
          <button
            onClick={loadPreview}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 min-h-[44px] sm:min-h-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table2 className="w-4 h-4" />}
            Carregar prévia
          </button>
          <button
            onClick={loadSample}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-xl text-sm font-medium hover:text-white min-h-[44px] sm:min-h-0"
          >
            <FlaskConical className="w-4 h-4" /> Usar exemplo
          </button>
          {previews.length > 0 && (
            <button
              onClick={exportAll}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-xl text-sm font-medium hover:text-white min-h-[44px] sm:min-h-0"
            >
              <FileJson className="w-4 h-4" /> Exportar JSON
            </button>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4" /> {error}
          </p>
        )}
      </div>

      {/* Resumo */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
          {[
            ['Abas', String(totals.tabs)],
            ['Linhas', String(totals.rows)],
            ['Válidas', String(totals.valid)],
            ['Receitas', fmtBRL(totals.income)],
            ['Despesas', fmtBRL(totals.expense)],
          ].map(([label, value]) => (
            <div key={label} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Prévia por aba */}
      {previews.map((p) => (
        <div key={p.tab} className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 rounded-2xl sm:rounded-xl p-4 sm:p-5 space-y-3 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:justify-between sm:gap-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-400" /> Aba {p.tab}
            </h3>
            <span className="text-xs text-zinc-500">
              {p.validRows}/{p.totalRows} válidas · {fmtBRL(p.totalIncome)} / {fmtBRL(p.totalExpense)}
              {p.error && <span className="text-red-400"> · {p.error}</span>}
              {sampleMode && <span className="text-amber-400"> · exemplo</span>}
            </span>
          </div>
          {p.issues.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300 space-y-1 max-h-32 overflow-auto">
              {p.issues.slice(0, 20).map((iss, i) => (
                <p key={i}>Linha {iss.rowIndex} · {iss.field}: {iss.message}</p>
              ))}
              {p.issues.length > 20 && <p>…e mais {p.issues.length - 20} (total {p.issues.length}).</p>}
            </div>
          )}
          <div className="overflow-auto rounded-lg border border-zinc-800/60 max-h-96 -mx-1 px-1">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="sticky top-0 bg-zinc-950">
                <tr className="text-left text-xs text-zinc-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {p.rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-zinc-800/60 text-zinc-200">
                    <td className="px-3 py-1.5 text-zinc-500">{r.rowIndex}</td>
                    <td className="px-3 py-1.5">{r.date || '—'}</td>
                    <td className="px-3 py-1.5 max-w-64 truncate" title={r.description}>{r.description || '—'}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-2 py-0.5 rounded text-xs ${r.type === 'income' ? 'bg-emerald-500/15 text-emerald-300' : r.type === 'expense' ? 'bg-red-500/15 text-red-300' : 'bg-zinc-700/40 text-zinc-400'}`}>
                        {r.type || '?'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">{r.amount === null ? '—' : fmtBRL(r.amount)}</td>
                    <td className="px-3 py-1.5">{r.category || '—'}</td>
                    <td className="px-3 py-1.5">{r.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {p.rows.length > 50 && (
              <p className="text-xs text-zinc-500 px-3 py-2">…e mais {p.rows.length - 50} linhas (use Exportar JSON para tudo).</p>
            )}
            {p.rows.length === 0 && !p.error && (
              <p className="text-sm text-zinc-500 px-3 py-4 flex items-center gap-2">
                <Download className="w-4 h-4" /> Nenhuma linha nesta aba.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
