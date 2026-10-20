import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'suman_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (_) {
    // fallback
  }
  return 'light';
}

let activeTheme: Theme = getInitialTheme();
const listeners = new Set<(t: Theme) => void>();

function applyTheme(t: Theme) {
  activeTheme = t;
  if (typeof document !== 'undefined') {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch (_) {
    // ignore
  }
  listeners.forEach((fn) => fn(t));
}

// Ensure theme is applied on initial module load
if (typeof document !== 'undefined') {
  if (activeTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(activeTheme);

  useEffect(() => {
    const handler = (newTheme: Theme) => setTheme(newTheme);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(THEME_KEY);
        if (!saved) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (_) {
        // ignore
      }
    };
    mediaQuery.addEventListener?.('change', handleMediaChange);
    return () => mediaQuery.removeEventListener?.('change', handleMediaChange);
  }, []);

  const toggleTheme = () => {
    applyTheme(activeTheme === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}
