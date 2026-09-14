import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'agrolink-theme';

function resolveInitial() {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.classList.contains('dark')) return true;
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function useTheme() {
  const [dark, setDark] = useState(resolveInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);

  return { dark, toggle };
}