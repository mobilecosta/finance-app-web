/* Utilidades para prévia de migração de planilhas (Google Sheets) -> transações.
 *modos de leitura:
 *  - API: Sheets API v4 (spreadsheets.values.get) com API key informada na UI.
 *  - CSV: upload de arquivos .csv exportados de cada aba (File > Download > CSV).
 *  - Backend (migração direta): GET /migration/sheet-preview do finance-backend,
 *    que lê a planilha direto do Google (modelo dashboard_totvs, sem API key).
 */

import api from './api';

export interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  type: string;
  category: string;
  status: string;
  typeMode: 'column' | 'signal' | 'fixed-income' | 'fixed-expense';
}

export interface NormalizedRow {
  rowIndex: number;
  date: string; // ISO yyyy-mm-dd ('' se inválida)
  description: string;
  type: 'income' | 'expense' | '';
  amount: number | null;
  category: string;
  status: string;
  raw: Record<string, string>;
}

export interface RowIssue {
  rowIndex: number;
  field: string;
  message: string;
  level?: string;
}

export interface TabPreview {
  tab: string;
  headers: string[];
  totalRows: number;
  validRows: number;
  totalIncome: number;
  totalExpense: number;
  rows: NormalizedRow[];
  issues: RowIssue[];
  error?: string;
}

export interface MigrationItem {
  tab: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  status: string;
}

export const DEFAULT_TABS: string[] = Array.from({ length: 11 }, (_, i) => {
  const mm = String(i + 1).padStart(2, '0');
  return `${mm}/2026`;
});

export const DEFAULT_SPREADSHEET_ID =
  '1bN0B4UOmIKykmFs7Rv2x2OWX9qzdYQ5EGQPXtY08WSc';

export const DEFAULT_MAPPING: ColumnMapping = {
  date: '',
  description: '',
  amount: '',
  type: '',
  category: '',
  status: '',
  typeMode: 'signal',
};

/* ---------------- normalização de texto ---------------- */

function norm(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function findHeader(headers: string[], wanted: string): number {
  if (!wanted) return -1;
  const w = norm(wanted);
  return headers.findIndex((h) => norm(h) === w);
}

/** Preenche o mapeamento a partir dos cabeçalhos detectados (tentativa). */
export function guessMapping(headers: string[]): ColumnMapping {
  const pick = (cands: string[]): string => {
    for (const c of cands) {
      const i = headers.findIndex((h) => norm(h) === norm(c));
      if (i >= 0) return headers[i];
    }
    return '';
  };
  return {
    date: pick(['data', 'dt', 'vencimento', 'pagamento', 'competencia']),
    description: pick(['descricao', 'historico', 'detalhe', 'lancamento', 'nome']),
    amount: pick(['valor', 'total', 'amount', 'quantia']),
    type: pick(['tipo', 'operacao', 'receita/despesa', 'natureza']),
    category: pick(['categoria', 'grupo', 'classe']),
    status: pick(['status', 'situacao']),
    typeMode: 'signal',
  };
}

/* ---------------- leitura: Sheets API v4 ---------------- */

export async function fetchTabViaApi(
  spreadsheetId: string,
  tab: string,
  apiKey: string,
): Promise<string[][]> {
  const range = encodeURIComponent(`'${tab}'!A1:Z5000`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
    `/values/${range}?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Sheets API ${res.status}: ${body.slice(0, 200) || res.statusText}`);
  }
  const json = (await res.json()) as { values?: string[][] };
  return json.values ?? [];
}

/* ---------------- leitura: CSV ---------------- */

function detectDelimiter(firstLine: string): string {
  const semis = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semis >= commas ? ';' : ',';
}

function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delim && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function parseCsv(text: string): string[][] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const delim = detectDelimiter(lines[0]);
  return lines.map((l) => splitCsvLine(l, delim));
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Falha ao ler arquivo ${file.name}`));
    reader.readAsText(file, 'utf-8');
  });
}

/* ---------------- parsing de valores ---------------- */

export function parseAmount(raw: string): number | null {
  if (!raw) return null;
  let s = raw.trim().replace(/[R$\s]/g, '');
  const neg = /^\(.*\)$/.test(s) || s.startsWith('-');
  s = s.replace(/[()]/g, '').replace(/^-/, '');
  if (s.includes(',') && s.includes('.')) {
    // pt-BR: 1.234,56
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return neg ? -Math.abs(n) : n;
}

export function parseDateToISO(raw: string): string {
  if (!raw) return '';
  const s = raw.trim().slice(0, 10);
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return s;
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return '';
}

function typeFromText(raw: string): 'income' | 'expense' | '' {
  const t = norm(raw);
  if (!t) return '';
  if (/(receit|entrada|credito|recebido)/.test(t)) return 'income';
  if (/(despesa|saida|debito|pagamento|pago)/.test(t)) return 'expense';
  return '';
}

/* ---------------- normalização ---------------- */

export function normalizeTab(
  tab: string,
  matrix: string[][],
  mapping: ColumnMapping,
): TabPreview {
  if (matrix.length === 0) {
    return { tab, headers: [], totalRows: 0, validRows: 0, totalIncome: 0, totalExpense: 0, rows: [], issues: [] };
  }
  const headers = matrix[0].map((h) => (h || '').trim());
  const idx = {
    date: findHeader(headers, mapping.date),
    description: findHeader(headers, mapping.description),
    amount: findHeader(headers, mapping.amount),
    type: findHeader(headers, mapping.type),
    category: findHeader(headers, mapping.category),
    status: findHeader(headers, mapping.status),
  };
  const cell = (row: string[], i: number): string => (i >= 0 && i < row.length ? (row[i] || '').trim() : '');

  const rows: NormalizedRow[] = [];
  const issues: RowIssue[] = [];
  let totalIncome = 0;
  let totalExpense = 0;
  let validRows = 0;
  let dataRow = 0;

  for (let r = 1; r < matrix.length; r++) {
    const record = matrix[r];
    if (record.every((c) => !(c || '').trim())) continue;
    dataRow++;

    const raw: Record<string, string> = {};
    headers.forEach((h, i) => {
      raw[h || `col${i + 1}`] = (record[i] || '').trim();
    });

    const date = idx.date >= 0 ? parseDateToISO(cell(record, idx.date)) : '';
    const description = idx.description >= 0 ? cell(record, idx.description) : '';
    const amountRaw = idx.amount >= 0 ? cell(record, idx.amount) : '';
    const amount = parseAmount(amountRaw);

    let type: NormalizedRow['type'] = '';
    if (mapping.typeMode === 'fixed-income') type = 'income';
    else if (mapping.typeMode === 'fixed-expense') type = 'expense';
    else if (mapping.typeMode === 'signal' && amount !== null) type = amount < 0 ? 'expense' : 'income';
    else if (idx.type >= 0) type = typeFromText(cell(record, idx.type));

    const row: NormalizedRow = {
      rowIndex: dataRow,
      date,
      description,
      type,
      amount,
      category: idx.category >= 0 ? cell(record, idx.category) : '',
      status: idx.status >= 0 ? cell(record, idx.status) : '',
      raw,
    };
    rows.push(row);

    let ok = true;
    if (!date) {
      issues.push({ rowIndex: dataRow, field: 'date', message: 'Data ausente ou inválida' });
      ok = false;
    }
    if (amount === null) {
      issues.push({ rowIndex: dataRow, field: 'amount', message: `Valor inválido: "${amountRaw}"` });
      ok = false;
    }
    if (!type) {
      issues.push({ rowIndex: dataRow, field: 'type', message: 'Tipo não identificado' });
      ok = false;
    }
    if (ok && amount !== null) {
      validRows++;
      if (type === 'income') totalIncome += Math.abs(amount);
      else totalExpense += Math.abs(amount);
    }
  }

  return { tab, headers, totalRows: dataRow, validRows, totalIncome, totalExpense, rows, issues };
}

/* ---------------- leitura: backend (migração direta) ---------------- */

/** Chama GET /migration/sheet-preview do finance-backend (requer login). */
export async function fetchTabViaBackend(
  tab: string,
  spreadsheetId: string,
  mapping: ColumnMapping,
): Promise<TabPreview> {
  const params = new URLSearchParams({ tab });
  if (spreadsheetId.trim()) params.set('spreadsheetId', spreadsheetId.trim());
  params.set('typeMode', mapping.typeMode);
  const res = await api.get(`/migration/sheet-preview?${params.toString()}`);
  const d = res.data ?? {};
  const rows: NormalizedRow[] = Array.isArray(d.rows)
    ? d.rows.map((r: any, i: number) => ({
        rowIndex: r.rowIndex ?? i + 1,
        date: r.date ?? '',
        description: r.description ?? '',
        type: r.type ?? '',
        amount: typeof r.amount === 'number' ? r.amount : null,
        category: r.category ?? '',
        status: r.status ?? '',
        raw: {},
      }))
    : [];
  return {
    tab: d.tab ?? tab,
    headers: Array.isArray(d.headers) ? d.headers : [],
    totalRows: d.totalRows ?? rows.length,
    validRows: d.validRows ?? 0,
    totalIncome: d.totalIncome ?? 0,
    totalExpense: d.totalExpense ?? 0,
    rows,
    issues: Array.isArray(d.issues) ? d.issues : [],
  };
}

/* ---------------- exportação ---------------- */

export function buildMigrationPayload(previews: TabPreview[]): MigrationItem[] {
  const out: MigrationItem[] = [];
  for (const p of previews) {
    for (const r of p.rows) {
      if (!r.date || r.amount === null || !r.type) continue;
      out.push({
        tab: p.tab,
        date: r.date,
        description: r.description,
        type: r.type,
        amount: Math.abs(r.amount),
        category: r.category,
        status: r.status || 'completed',
      });
    }
  }
  return out;
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
