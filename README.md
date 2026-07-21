# Finance Pro Web

Um dashboard web moderno e responsivo desenvolvido com **React**, **TypeScript** e **Tailwind CSS** para gerenciar finanças pessoais.

![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.1-purple.svg)

## Funcionalidades

- Autenticação com email/senha (cadastro e login)
- Dashboard com métricas, gráficos e transações recentes
- CRUD de transações financeiras
- CRUD de contas bancárias
- CRUD de categorias
- Interface responsiva com tema escuro

## Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **React Router 7** (roteamento)
- **Tailwind CSS 4** (estilização)
- **Zustand** (estado global)
- **Axios** (HTTP client)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

## Requisitos

- Node.js 18+ e pnpm 9+

## Instalação

```bash
git clone https://github.com/mobilecosta/finance-app-web.git
cd finance-app-web
pnpm install
```

### Configurar variáveis de ambiente

Crie um arquivo `.env`:

```env
VITE_API_URL=https://finance-backend-mobile.vercel.app/api
```

### Iniciar em desenvolvimento

```bash
pnpm dev
```

Acessar em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── components/
│   ├── Layout.tsx              # Layout com sidebar
│   └── ProtectedRoute.tsx      # Rotas protegidas
├── pages/
│   ├── Login.tsx               # Login/Cadastro
│   ├── AuthCallback.tsx        # Callback de email confirmation
│   ├── Dashboard.tsx           # Dashboard com gráficos
│   ├── Transactions.tsx        # CRUD de transações
│   ├── Accounts.tsx            # CRUD de contas
│   ├── Categories.tsx          # CRUD de categorias
│   └── Settings.tsx            # Configurações
├── services/
│   └── api.ts                  # Cliente Axios + endpoints
├── store/
│   └── authStore.ts            # Estado de autenticação (Zustand)
├── App.tsx                     # Rotas
├── main.tsx                    # Entry point
└── index.css                   # Estilos globais
```

## APIs Consumidas

O frontend consome a API do **Finance Backend** (`finance-backend-mobile.vercel.app`):

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/signup` | Cadastro |
| POST | `/api/auth/signin` | Login |
| POST | `/api/auth/signout` | Logout |
| GET | `/api/auth/user` | Dados do usuário |

### Financeiro (requer token)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/finance/dashboard/metrics` | Métricas do dashboard |
| GET | `/api/finance/transactions` | Listar transações |
| POST | `/api/finance/transactions` | Criar transação |
| PUT | `/api/finance/transactions/:id` | Atualizar transação |
| DELETE | `/api/finance/transactions/:id` | Remover transação |
| GET | `/api/finance/accounts` | Listar contas |
| POST | `/api/finance/accounts` | Criar conta |
| PUT | `/api/finance/accounts/:id` | Atualizar conta |
| DELETE | `/api/finance/accounts/:id` | Remover conta |
| GET | `/api/finance/categories` | Listar categorias |
| POST | `/api/finance/categories` | Criar categoria |
| PUT | `/api/finance/categories/:id` | Atualizar categoria |
| DELETE | `/api/finance/categories/:id` | Remover categoria |

## NFS-e e Empresas (ACBr API)

O módulo **NFS-e** e **Empresas** consome a [ACBr API](https://acbr.api.br/) para emissão de Nota Fiscal de Serviços Eletrônica e gestão de empresas/prestadores.

### Arquitetura

As requisições são roteadas através do **Finance Backend** para evitar problemas de CORS:

```
Frontend (React)
    ↓ axios /api/acbr/*
Backend (Express)
    ↓ fetch
ACBr API (hom.acbr.api.br | prod.acbr.api.br)
```

### Endpoints ACBr (proxy via backend)

#### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/acbr/auth` | Autentica na ACBr API e retorna access_token |

Body: `{ client_id, client_secret }`

#### Empresas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/acbr/empresas` | Listar empresas |
| POST | `/api/acbr/empresas` | Cadastrar empresa |
| GET | `/api/acbr/empresas/{cpf_cnpj}` | Consultar empresa |
| PUT | `/api/acbr/empresas/{cpf_cnpj}` | Alterar empresa |
| DELETE | `/api/acbr/empresas/{cpf_cnpj}` | Deletar empresa |
| GET | `/api/acbr/empresas/{cpf_cnpj}/certificado` | Consultar certificado |
| PUT | `/api/acbr/empresas/{cpf_cnpj}/certificado` | Cadastrar certificado |
| DELETE | `/api/acbr/empresas/{cpf_cnpj}/certificado` | Deletar certificado |
| GET | `/api/acbr/empresas/{cpf_cnpj}/nfse` | Consultar config NFS-e |
| PUT | `/api/acbr/empresas/{cpf_cnpj}/nfse` | Alterar config NFS-e |

#### NFS-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/acbr/nfse` | Listar NFS-e |
| GET | `/api/acbr/nfse/{id}` | Consultar NFS-e |
| POST | `/api/acbr/nfse/dps` | Emitir NFS-e |
| POST | `/api/acbr/nfse/{id}/cancelamento` | Cancelar NFS-e |
| GET | `/api/acbr/nfse/{id}/cancelamento` | Consultar cancelamento |
| POST | `/api/acbr/nfse/{id}/sincronizar` | Sincronizar com prefeitura |
| GET | `/api/acbr/nfse/cidades` | Listar cidades atendidas |
| GET | `/api/acbr/nfse/cidades/{codigo_ibge}` | Metadados da cidade |

> Parâmetro `ambiente=homologacao|producao` disponível em todos os endpoints.

### Credenciais

Configure no `.env` ou pela interface em **NFS-e > Credenciais**:

```env
VITE_ACBR_CLIENT_ID=seu-client-id
VITE_ACBR_CLIENT_SECRET=seu-client-secret
```

### Documentação oficial ACBr

- [https://dev.acbr.api.br/docs/nfse](https://dev.acbr.api.br/docs/nfse)
- [https://dev.acbr.api.br/docs/empresas](https://dev.acbr.api.br/docs/empresas)
- [https://dev.acbr.api.br/docs/autenticacao](https://dev.acbr.api.br/docs/autenticacao)

## Build & Deploy

```bash
pnpm build      # Build produção
vercel          # Deploy no Vercel
```

---

Desenvolvido por [mobilecosta](https://github.com/mobilecosta)
