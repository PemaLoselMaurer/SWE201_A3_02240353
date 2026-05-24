import apiClient from './config';
import { Expense } from '@/utils/types';

export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const res = await apiClient.get<Expense[]>('/expenses');
    return res.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const res = await apiClient.get<Expense>(`/expenses/${id}`);
    return res.data;
  },

  create: async (data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const res = await apiClient.post<Expense>('/expenses', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return res.data;
  },

  update: async (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense> => {
    const res = await apiClient.patch<Expense>(`/expenses/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },
};
