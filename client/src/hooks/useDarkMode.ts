import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'unlocktracker-theme';

/**
 * Gère le mode sombre de l'application.
 * - Ajoute/retire la classe `dark` sur <html> (utilisée par Tailwind)
 * - Mémorise le choix dans localStorage
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((v) => !v), []);

  return { isDark, toggle };
}
