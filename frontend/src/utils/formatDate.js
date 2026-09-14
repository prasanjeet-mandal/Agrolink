export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  const defaults = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-IN', defaults).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;

  if (diffSec < MINUTE) return 'just now';
  if (diffSec < HOUR) return rtf.format(-Math.floor(diffSec / MINUTE), 'minute');
  if (diffSec < DAY) return rtf.format(-Math.floor(diffSec / HOUR), 'hour');
  if (diffSec < WEEK) return rtf.format(-Math.floor(diffSec / DAY), 'day');
  return formatDate(date);
}