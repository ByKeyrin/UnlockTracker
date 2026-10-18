import { useMemo, useState } from 'react';
import { useGames } from '../../hooks/useGames';
import { GameList } from './GameList';

/**
 * Dérive la liste des séries disponibles à partir de la collection.
 *
 * Les séries numériques sont triées dans l'ordre croissant, puis les séries
 * hors numériques (`HS`, `Short`) par ordre alphabétique.
 *
 * @param games - Collection complète des jeux
 * @returns Les séries uniques, triées
 */
function deriveSeries(games: { serie: string }[]): string[] {
  const uniques = [...new Set(games.map((game) => game.serie))];
  return uniques.sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    const isNumA = Number.isFinite(numA);
    const isNumB = Number.isFinite(numB);
    if (isNumA && isNumB) return numA - numB;
    if (isNumA) return -1;
    if (isNumB) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Écran du catalogue des jeux Unlock! : recherche par nom ou thème, filtre
 * par série et affichage de la grille des jeux.
 *
 * @example
 * <CatalogueScreen />
 */
export function CatalogueScreen() {
  const [recherche, setRecherche] = useState('');
  const [serie, setSerie] = useState<string | undefined>(undefined);
  const { games, allGames, markPlayed } = useGames({ serie });
  const series = useMemo(() => deriveSeries(allGames), [allGames]);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Catalogue</h2>

      {/* Barre de recherche */}
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Rechercher
        <input
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Nom ou thème…"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      {/* Filtres de série */}
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Série
        </legend>
        <button
          type="button"
          onClick={() => setSerie(undefined)}
          aria-pressed={serie === undefined}
          className={
            serie === undefined
              ? 'rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white'
              : 'rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          }
        >
          Toutes
        </button>
        {series.map((s) => {
          const isActive = serie === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSerie(isActive ? undefined : s)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white'
                  : 'rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }
            >
              Série {s}
            </button>
          );
        })}
      </fieldset>

      <GameList games={games} recherche={recherche} onMarkPlayed={markPlayed} />
    </section>
  );
}

export default CatalogueScreen;
