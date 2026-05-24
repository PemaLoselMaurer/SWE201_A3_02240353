import apiClient from './config';
import { User } from '@/utils/types';

// Simulates auth against a /users endpoint (JSON Server)
export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await apiClient.get<User[]>(`/users?email=${encodeURIComponent(email)}`);
    const user = res.data[0];
    if (!user) throw new Error('No account found with that email.');
    // Simple password check — in production use hashed passwords
    if ((user as any).password !== password) throw new Error('Incorrect password.');
    return { id: user.id, email: user.email, name: user.name, token: `token-${user.id}` };
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    // Check duplicate email
    const check = await apiClient.get<User[]>(`/users?email=${encodeURIComponent(email)}`);
    if (check.data.length > 0) throw new Error('An account with this email already exists.');

    const res = await apiClient.post('/users', { name, email, password });
    const user = res.data;
    return { id: user.id, email: user.email, name: user.name, token: `token-${user.id}` };
  },
};
