const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const INR_COMPACT_FORMATTER = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatPrice(value, { compact = false } = {}) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  if (compact) return `₹${INR_COMPACT_FORMATTER.format(value)}`;
  return INR_FORMATTER.format(value);
}

export function formatPricePerUnit(value, unit) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${formatPrice(value)} / ${unit ?? 'kg'}`;
}

export function formatPerKgRange(min, max, unit = 'kg') {
  if (min == null || max == null) return '—';
  return `${formatPrice(min)} – ${formatPrice(max)} / ${unit}`;
}