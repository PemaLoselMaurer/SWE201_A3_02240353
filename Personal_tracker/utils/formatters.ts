export function formatCurrency(amount: number): string {
  return `BTN ${amount.toFixed(2)}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateInput(isoString: string): string {
  return isoString.split('T')[0];
}
