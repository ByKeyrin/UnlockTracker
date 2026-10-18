import { useState } from 'react';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { CatalogueScreen } from './features/catalogue/CatalogueScreen';
import { FiltersScreen } from './features/filters/FiltersScreen';
import { ShareScreen } from './features/share/ShareScreen';
import { TrackingScreen } from './features/tracking/TrackingScreen';
import { useDarkMode } from './hooks/useDarkMode';
import type { Onglet } from './types';

const ONGLETS: { id: Onglet; label: string }[] = [
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'suivi', label: 'Suivi' },
  { id: 'filtres', label: 'Filtres' },
  { id: 'partage', label: 'Partage' },
];

export default function App() {
  const [ongletActif, setOngletActif] = useState<Onglet>('catalogue');
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-bold sm:text-2xl">🎲 UnlockTracker</h1>
          <ThemeToggle isDark={isDark} onToggle={toggle} />
        </div>

        {/* Navigation (onglets) */}
        <nav className="mx-auto max-w-3xl px-4">
          <ul className="flex gap-1 overflow-x-auto">
            {ONGLETS.map((onglet) => {
              const actif = onglet.id === ongletActif;
              return (
                <li key={onglet.id}>
                  <button
                    type="button"
                    onClick={() => setOngletActif(onglet.id)}
                    aria-current={actif ? 'page' : undefined}
                    className={
                      actif
                        ? 'rounded-t-lg border-b-2 border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400'
                        : 'rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }
                  >
                    {onglet.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Contenu */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {ongletActif === 'catalogue' && <CatalogueScreen />}
        {ongletActif === 'suivi' && <TrackingScreen />}
        {ongletActif === 'filtres' && <FiltersScreen />}
        {ongletActif === 'partage' && <ShareScreen />}
      </main>
    </div>
  );
}
