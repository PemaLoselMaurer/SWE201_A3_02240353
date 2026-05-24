import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/utils/types';
import { authApi } from '@/api/auth';

const AUTH_KEY = 'auth_user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  rehydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  hydrated: false,

  rehydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) set({ user: JSON.parse(stored) });
    } catch {
      // Ignore storage errors on startup
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.login(email, password);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed. Please try again.', isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.register(name, email, password);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed. Please try again.', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
