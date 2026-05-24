export function validateExpense(data: {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.title.trim()) errors.title = 'Title is required';
  else if (data.title.trim().length < 2) errors.title = 'Title must be at least 2 characters';
  else if (data.title.trim().length > 100) errors.title = 'Title must be under 100 characters';

  const amt = parseFloat(data.amount);
  if (!data.amount) errors.amount = 'Amount is required';
  else if (isNaN(amt) || amt <= 0) errors.amount = 'Amount must be a positive number';
  else if (amt > 1000000) errors.amount = 'Amount too large';

  if (!data.categoryId) errors.categoryId = 'Category is required';
  if (!data.date) errors.date = 'Date is required';
  return errors;
}

export function validateAuth(data: { email: string; password: string; name?: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';

  if (!data.password) errors.password = 'Password is required';
  else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (data.name !== undefined && !data.name.trim()) errors.name = 'Name is required';
  return errors;
}
