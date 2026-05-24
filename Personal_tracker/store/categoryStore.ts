import { create } from 'zustand';
import { Category } from '@/utils/types';
import { categoriesApi } from '@/api/categories';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (data: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getAll();
      set({ categories, isLoading: false });
    } catch (err: any) {
      const msg = err.code === 'ECONNABORTED'
        ? 'Request timed out.'
        : err.response
        ? `Server error (${err.response.status}).`
        : 'Network error. Check your connection.';
      set({ error: msg, isLoading: false });
    }
  },

  addCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const cat = await categoriesApi.create(data);
      set((s) => ({ categories: [...s.categories, cat], isLoading: false }));
    } catch (err: any) {
      set({ error: 'Failed to create category.', isLoading: false });
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await categoriesApi.update(id, data);
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: 'Failed to update category.', isLoading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesApi.remove(id);
      set((s) => ({ categories: s.categories.filter((c) => c.id !== id), isLoading: false }));
    } catch (err: any) {
      set({ error: 'Failed to delete category.', isLoading: false });
      throw err;
    }
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  clearError: () => set({ error: null }),
}));
