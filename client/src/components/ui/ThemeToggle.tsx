interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

/** Bouton d'activation / désactivation du mode sombre. */
export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {isDark ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  );
}
