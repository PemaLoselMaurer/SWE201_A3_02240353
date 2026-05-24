import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '@/utils/types';
import { expensesApi } from '@/api/expenses';

const FILTER_KEY = 'expense_filter';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  filter: { categoryId: string; dateFrom: string; dateTo: string };
  fetchExpenses: () => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setFilter: (filter: Partial<ExpenseState['filter']>) => Promise<void>;
  rehydrateFilter: () => Promise<void>;
  clearError: () => void;
  // Derived selector
  filteredExpenses: () => Expense[];
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  filter: { categoryId: '', dateFrom: '', dateTo: '' },

  rehydrateFilter: async () => {
    try {
      const stored = await AsyncStorage.getItem(FILTER_KEY);
      if (stored) set({ filter: JSON.parse(stored) });
    } catch {
      // Ignore
    }
  },

  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expensesApi.getAll();
      set({ expenses, isLoading: false });
    } catch (err: any) {
      const msg = err.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : err.response
        ? `Server error (${err.response.status}). Please try again.`
        : 'Network error. Check your connection.';
      set({ error: msg, isLoading: false });
    }
  },

  addExpense: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await expensesApi.create(data);
      set((s) => ({ expenses: [expense, ...s.expenses], isLoading: false }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create expense.', isLoading: false });
      throw err;
    }
  },

  updateExpense: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await expensesApi.update(id, data);
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? updated : e)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update expense.', isLoading: false });
      throw err;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await expensesApi.remove(id);
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id), isLoading: false }));
    } catch (err: any) {
      set({ error: 'Failed to delete expense.', isLoading: false });
      throw err;
    }
  },

  setFilter: async (filter) => {
    const next = { ...get().filter, ...filter };
    set({ filter: next });
    await AsyncStorage.setItem(FILTER_KEY, JSON.stringify(next));
  },

  clearError: () => set({ error: null }),

  filteredExpenses: () => {
    const { expenses, filter } = get();
    return expenses.filter((e) => {
      if (filter.categoryId && e.categoryId !== filter.categoryId) return false;
      if (filter.dateFrom && e.date < filter.dateFrom) return false;
      if (filter.dateTo && e.date > filter.dateTo) return false;
      return true;
    });
  },
}));
