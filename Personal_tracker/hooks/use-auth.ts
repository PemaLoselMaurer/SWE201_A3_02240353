import { useAuthStore } from '@/store/authStore';

/**
 * Exposes auth state and actions. Components use this instead of accessing the store directly.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return { user, isLoading, error, login, register, logout, clearError, isAuthenticated: !!user };
}
