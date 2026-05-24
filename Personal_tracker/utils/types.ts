export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // ISO date string
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export type RootStackParamList = {
  '(tabs)': undefined;
  'auth/login': undefined;
  'auth/register': undefined;
  'expense/create': undefined;
  'expense/[id]': { id: string };
  'category/index': undefined;
};
