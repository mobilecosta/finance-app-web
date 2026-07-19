import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finance-backend-liard.vercel.app/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Evitar redirecionamento se já estivermos na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTENTICAÇÃO ============

export const authAPI = {
  signup: (email: string, password: string, fullName?: string) =>
    api.post('/auth/signup', { email, password, fullName }),
  
  signin: (email: string, password: string) =>
    api.post('/auth/signin', { email, password }),
  
  signout: () =>
    api.post('/auth/signout'),
  
  getUser: () =>
    api.get('/auth/user'),
};

// ============ CONTAS ============

export interface Account {
  id: number;
  userId: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const accountsAPI = {
  list: () =>
    api.get<Account[]>('/finance/accounts'),
  
  get: (id: number) =>
    api.get<Account>(`/finance/accounts/${id}`),
  
  create: (data: Partial<Account>) =>
    api.post<Account>('/finance/accounts', data),
  
  update: (id: number, data: Partial<Account>) =>
    api.put<Account>(`/finance/accounts/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/finance/accounts/${id}`),
};

// ============ CATEGORIAS ============

export interface Category {
  id: number;
  userId: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const categoriesAPI = {
  list: () =>
    api.get<Category[]>('/finance/categories'),
  
  get: (id: number) =>
    api.get<Category>(`/finance/categories/${id}`),
  
  create: (data: Partial<Category>) =>
    api.post<Category>('/finance/categories', data),
  
  update: (id: number, data: Partial<Category>) =>
    api.put<Category>(`/finance/categories/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/finance/categories/${id}`),
};

// ============ TRANSAÇÕES ============

export interface Transaction {
  id: number;
  userId: string;
  accountId: number;
  categoryId: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: number;
  accountId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

export const transactionsAPI = {
  list: (filters?: TransactionFilters) =>
    api.get<Transaction[]>('/finance/transactions', { params: filters }),
  
  get: (id: number) =>
    api.get<Transaction>(`/finance/transactions/${id}`),
  
  create: (data: Partial<Transaction>) =>
    api.post<Transaction>('/finance/transactions', data),
  
  update: (id: number, data: Partial<Transaction>) =>
    api.put<Transaction>(`/finance/transactions/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/finance/transactions/${id}`),
};

// ============ DASHBOARD ============

export interface DashboardMetrics {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
}

export const dashboardAPI = {
  getMetrics: (period?: 'month' | 'quarter' | 'year') =>
    api.get<DashboardMetrics>('/finance/dashboard/metrics', { params: { period } }),
  
  getMonthlyData: () =>
    api.get('/finance/dashboard/monthly'),
  
  getCategoryDistribution: () =>
    api.get('/finance/dashboard/categories'),
};

export default api;
