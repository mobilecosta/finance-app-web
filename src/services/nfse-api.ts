const ACBR_AUTH_URL = 'https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token';
const ACBR_HOM_URL = 'https://hom.acbr.api.br';
const ACBR_PROD_URL = 'https://prod.acbr.api.br';

export interface NfseCredentials {
  clientId: string;
  clientSecret: string;
}

export interface NfseListagemItem {
  id: string;
  created_at: string;
  status: string;
  numero: string;
  codigo_verificacao: string;
  link_url: string;
  data_emissao: string;
  ambiente: string;
  referencia: string;
  DPS?: { serie: string; nDPS: string };
}

export interface NfseDetalhe {
  id: string;
  created_at: string;
  status: string;
  numero: string;
  codigo_verificacao: string;
  link_url: string;
  data_emissao: string;
  ambiente: string;
  referencia: string;
  DPS?: { serie: string; nDPS: string };
  declaracao_prestacao_servico?: Record<string, unknown>;
  cancelamento?: Record<string, unknown>;
}

export interface NfseEmitirPayload {
  provedor?: string;
  ambiente: 'homologacao' | 'producao';
  referencia?: string;
  infDPS: {
    prest: { CNPJ?: string; CPF?: string };
    toma: { CNPJ?: string; CPF?: string; xNome: string; end?: { xLgr?: string; nro?: string; xBairro?: string; endNac?: { cMun: string; CEP?: string; xCidade?: string; UF?: string } } };
    serv?: { xDiscServico: string; cServTribMun?: string; vAliquota?: number; vBC?: number; vISS?: number; vServicos: number };
    dCompet?: string;
  };
}

function getStoredCredentials(): NfseCredentials | null {
  try {
    const raw = localStorage.getItem('acbr_credentials');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const creds = getStoredCredentials();
  if (!creds) throw new Error('Credenciais ACBr API não configuradas');

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    scope: 'empresa nfse',
  }).toString();

  const res = await fetch(ACBR_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha na autenticação ACBr: ${text}`);
  }

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}

async function request<T>(path: string, options?: { method?: string; body?: unknown; query?: Record<string, string>; environment?: string }): Promise<T> {
  const token = await getAccessToken();
  const baseUrl = options?.environment === 'producao' ? ACBR_PROD_URL : ACBR_HOM_URL;
  let url = `${baseUrl}${path}`;
  if (options?.query) {
    url += '?' + new URLSearchParams(options.query).toString();
  }

  const res = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try { const json = JSON.parse(text); msg = json.message || json.error || text; } catch { }
    throw new Error(msg);
  }

  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as unknown as Promise<T>;
}

export const nfseAPI = {
  saveCredentials: (creds: NfseCredentials) => {
    localStorage.setItem('acbr_credentials', JSON.stringify(creds));
    cachedToken = null;
  },

  getCredentials: (): NfseCredentials | null => getStoredCredentials(),

  clearCredentials: () => {
    localStorage.removeItem('acbr_credentials');
    cachedToken = null;
  },

  getToken: () => getAccessToken(),

  listar: (cpfCnpj: string, ambiente = 'homologacao', top = 10, skip = 0) =>
    request<{ '@count'?: number; data: NfseListagemItem[] }>('/nfse', {
      query: { cpf_cnpj: cpfCnpj, ambiente, $top: String(top), $skip: String(skip) },
      environment: ambiente,
    }),

  consultar: (id: string, ambiente = 'homologacao') =>
    request<NfseDetalhe>(`/nfse/${id}`, { environment: ambiente }),

  emitir: (payload: NfseEmitirPayload) =>
    request<{ id: string; status: string; numero: string; data_emissao: string }>('/nfse/dps', {
      method: 'POST',
      body: payload,
      environment: payload.ambiente,
    }),

  cancelar: (id: string, ambiente = 'homologacao', motivo?: string) =>
    request<{ id: string; status: string }>(`/nfse/${id}/cancelamento`, {
      method: 'POST',
      body: { motivo: motivo || 'Cancelamento solicitado pelo emitente' },
      environment: ambiente,
    }),

  consultarCancelamento: (id: string, ambiente = 'homologacao') =>
    request<Record<string, unknown>>(`/nfse/${id}/cancelamento`, { environment: ambiente }),

  sincronizar: (id: string, ambiente = 'homologacao') =>
    request<Record<string, unknown>>(`/nfse/${id}/sincronizar`, { method: 'POST', environment: ambiente }),

  cidadesAtendidas: () =>
    request<{ '@count'?: number; data: Array<{ codigo_ibge: string; cidade: string; uf: string }> }>('/nfse/cidades'),

  metadados: (codigoIbge: string) =>
    request<Record<string, unknown>>(`/nfse/cidades/${codigoIbge}`),
};

// ============ EMPRESAS ============

export interface EmpresaEndereco {
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  codigo_municipio: string;
  cidade: string;
  uf: string;
  codigo_pais?: string;
  pais?: string;
  cep: string;
}

export interface Empresa {
  cpf_cnpj: string;
  created_at?: string;
  updated_at?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  nome_razao_social: string;
  nome_fantasia?: string;
  fone?: string;
  email: string;
  endereco: EmpresaEndereco;
}

export interface EmpresaCertificado {
  id: string;
  created_at: string;
  serial_number: string;
  issuer_name: string;
  not_valid_before: string;
  not_valid_after: string;
  thumbprint: string;
  subject_name: string;
  cpf_cnpj: string;
  nome_razao_social: string;
}

export interface EmpresaConfigNfse {
  regTrib: {
    opSimpNac?: number;
    regApTribSN?: number;
    regEspTrib?: number;
  };
  rps: {
    lote: number;
    serie: string;
    numero: number;
  };
  prefeitura?: {
    login?: string;
    senha?: string;
    token?: string;
  };
  incentivo_fiscal?: boolean;
  ambiente: 'homologacao' | 'producao';
}

export const empresaAPI = {
  listar: (params?: { cpf_cnpj?: string; nome_razao_social?: string; top?: number; skip?: number }) =>
    request<{ '@count'?: number; data: Empresa[] }>('/empresas', {
      query: {
        ...(params?.cpf_cnpj && { cpf_cnpj: params.cpf_cnpj }),
        ...(params?.nome_razao_social && { nome_razao_social: params.nome_razao_social }),
        $top: String(params?.top ?? 10),
        $skip: String(params?.skip ?? 0),
      },
    }),

  consultar: (cpfCnpj: string) =>
    request<Empresa>(`/empresas/${cpfCnpj}`),

  cadastrar: (data: Empresa) =>
    request<Empresa>('/empresas', { method: 'POST', body: data }),

  alterar: (cpfCnpj: string, data: Empresa) =>
    request<Empresa>(`/empresas/${cpfCnpj}`, { method: 'PUT', body: data }),

  deletar: (cpfCnpj: string) =>
    request<void>(`/empresas/${cpfCnpj}`, { method: 'DELETE' }),

  // Certificados
  listarCertificados: (params?: { expires_in?: number; include_expired?: boolean }) =>
    request<{ '@count'?: number; data: EmpresaCertificado[] }>('/empresas/certificados', {
      query: {
        ...(params?.expires_in && { expires_in: String(params.expires_in) }),
        include_expired: String(params?.include_expired ?? true),
      },
    }),

  consultarCertificado: (cpfCnpj: string) =>
    request<EmpresaCertificado>(`/empresas/${cpfCnpj}/certificado`),

  cadastrarCertificado: (cpfCnpj: string, certificado: string, password: string) =>
    request<EmpresaCertificado>(`/empresas/${cpfCnpj}/certificado`, {
      method: 'PUT',
      body: { certificado, password },
    }),

  deletarCertificado: (cpfCnpj: string) =>
    request<void>(`/empresas/${cpfCnpj}/certificado`, { method: 'DELETE' }),

  // NFS-e Config
  consultarConfigNfse: (cpfCnpj: string) =>
    request<EmpresaConfigNfse>(`/empresas/${cpfCnpj}/nfse`),

  alterarConfigNfse: (cpfCnpj: string, data: EmpresaConfigNfse) =>
    request<EmpresaConfigNfse>(`/empresas/${cpfCnpj}/nfse`, { method: 'PUT', body: data }),
};
