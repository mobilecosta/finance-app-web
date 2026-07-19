# Finance Pro Web 💰

Um dashboard web moderno e responsivo desenvolvido com **React**, **TypeScript** e **Tailwind CSS** para gerenciar finanças pessoais. O aplicativo consome todas as APIs do backend Express do Finance Pro Mobile.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.1-purple.svg)

## 🎯 Visão Geral

**Finance Pro Web** é um dashboard completo de gestão financeira que permite aos usuários:

- 📊 Visualizar métricas e gráficos de receitas e despesas
- 💳 Gerenciar múltiplas contas bancárias
- 📝 Registrar e controlar transações
- 🏷️ Organizar transações por categorias
- 🔐 Autenticação segura com email/senha
- 📱 Interface responsiva e intuitiva
- 🎨 Tema escuro premium

## 🚀 Stack Tecnológico

### Frontend
- **React 19** — Biblioteca JavaScript para UI
- **TypeScript 5.9** — Tipagem estática
- **Vite 8.1** — Build tool rápido
- **React Router 7** — Roteamento de páginas
- **Tailwind CSS 4** — Estilização com utility-first CSS
- **Zustand** — Gerenciamento de estado
- **Axios** — Cliente HTTP
- **Recharts** — Gráficos e visualizações
- **Lucide React** — Ícones SVG

## 📋 Requisitos

- **Node.js** 18+ e **pnpm** 9+
- **Backend Express** rodando (Finance Pro Mobile)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

## 🛠️ Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/mobilecosta/finance-app-web.git
cd finance-app-web
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Layout.tsx              # Layout principal com sidebar
│   └── ProtectedRoute.tsx      # Componente para rotas protegidas
├── pages/
│   ├── Login.tsx               # Página de autenticação
│   ├── Dashboard.tsx           # Dashboard com gráficos
│   ├── Transactions.tsx        # CRUD de transações
│   ├── Accounts.tsx            # CRUD de contas
│   ├── Categories.tsx          # CRUD de categorias
│   └── Settings.tsx            # Página de configurações
├── services/
│   └── api.ts                  # Cliente de API com Axios
├── store/
│   └── authStore.ts            # Store de autenticação (Zustand)
├── App.tsx                     # Componente raiz com rotas
├── main.tsx                    # Entrada da aplicação
└── index.css                   # Estilos globais
```

## 🎨 Design & Tema

Tema escuro premium com paleta de cores finance:

| Cor | Valor | Uso |
|-----|-------|-----|
| Primary | #3b82f6 | Botões, ações principais |
| Background | #0f172a | Fundo de telas |
| Surface | #1e293b | Cards, superfícies |
| Foreground | #f1f5f9 | Texto principal |
| Success | #10b981 | Receitas, saldo positivo |
| Error | #ef4444 | Despesas, saldo negativo |

## 📱 Telas Principais

### Login
- Autenticação com email/senha
- Cadastro de novos usuários
- Validação de formulário

### Dashboard
- Cards de métricas (saldo, receitas, despesas, transações)
- Gráfico de receitas vs despesas
- Distribuição por categoria
- Lista de transações recentes

### Transações
- Lista completa de transações
- Modal de CRUD
- Filtros por tipo (receita/despesa)
- Confirmação de exclusão

### Contas
- Grid de contas com saldo
- Modal de CRUD
- Cor e ícone personalizados

### Categorias
- Grid de categorias
- Modal de CRUD
- Tipo (receita/despesa/ambos)

### Configurações
- Informações do perfil
- Preferências do aplicativo
- Links de ajuda

## 🔌 Consumo de APIs

O projeto consome todas as APIs do backend Express do Finance Pro Mobile.

## 🚀 Build & Deploy

### Build para Produção

```bash
pnpm build
```

### Deploy no Vercel

```bash
vercel
```

## 📝 Licença

MIT License

## 👨‍💻 Autor

**mobilecosta** — Desenvolvedor Full Stack


**Desenvolvido com ❤️ usando React + TypeScript**
