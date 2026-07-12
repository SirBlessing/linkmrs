export function formatPrice(value, currency = '$') {
  const n = Number(value);
  if (Number.isNaN(n)) return `${currency}0.00`;
  return `${currency}${n.toFixed(2)}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export const STATUS_LABELS = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
