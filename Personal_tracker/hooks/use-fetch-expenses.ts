import { useEffect, useCallback } from 'react';
import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';

/**
 * Loads expenses and categories on mount; exposes a retry function.
 */
export function useFetchExpenses() {
  const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const error = useExpenseStore((s) => s.error);

  const load = useCallback(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  useEffect(() => {
    load();
  }, [load]);

  return { isLoading, error, retry: load };
}
