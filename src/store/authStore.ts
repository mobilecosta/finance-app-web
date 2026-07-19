import { create } from 'zustand';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  signout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  loading: false,
  error: null,

  signin: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signin(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ token, user, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      set({ error: message, loading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, fullName?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signup(email, password, fullName);
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ token, user, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      set({ error: message, loading: false });
      throw error;
    }
  },

  signout: async () => {
    set({ loading: true });
    try {
      await authAPI.signout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      set({ user: null, token: null, loading: false });
    }
  },

  loadUser: async () => {
    set({ loading: true });
    try {
      const response = await authAPI.getUser();
      set({ user: response.data, loading: false });
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      set({ user: null, token: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },
}));
