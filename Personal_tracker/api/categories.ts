import apiClient from './config';
import { Category } from '@/utils/types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  },

  getById: async (id: string): Promise<Category> => {
    const res = await apiClient.get<Category>(`/categories/${id}`);
    return res.data;
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const res = await apiClient.post<Category>('/categories', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> => {
    const res = await apiClient.patch<Category>(`/categories/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
