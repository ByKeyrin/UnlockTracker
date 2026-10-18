import { useMemo, useState } from 'react';
import { useFilters } from '../../hooks/useFilters';
import type { FiltresAvances } from '../../hooks/useFilters';
import { useGames } from '../../hooks/useGames';
import { GameCard } from '../catalogue/GameCard';
import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';

/**
 * Compte les filtres actifs (hors recherche) pour afficher un badge sur le
 * bouton d'ouverture du panneau mobile.
 *
 * @param filters - État courant des filtres
 * @returns Le nombre de groupes de filtres actifs
 */
function compterFiltresActifs(filters: FiltresAvances): number {
  let compte = 0;
  if (filters.series.length > 0) compte += 1;
  if (filters.difficultes.length > 0) compte += 1;
  if (filters.statuts.length > 0) compte += 1;
  if (filters.dureeMax !== null) compte += 1;
  return compte;
}

/**
 * Écran de filtrage avancé et de recherche : assemble la barre de recherche
 * (avec suggestions et historique) et le panneau de filtres (série, difficulté,
 * statut, durée), et affiche les résultats avec leur compteur.
 *
 * @example
 * <FiltersScreen />
 */
export function FiltersScreen() {
  const { allGames } = useGames();
  const {
    filters,
    toggleSerie,
    toggleDifficulte,
    toggleStatut,
    setDureeMax,
    setRecherche,
    resetFilters,
    filteredGames,
    resultCount,
  } = useFilters(allGames);
  const [panneauOuvert, setPanneauOuvert] = useState(false);

  // Séries disponibles dans la collection, triées numériquement.
  const series = useMemo(() => {
    const uniques = [...new Set(allGames.map((game) => game.serie))];
    return uniques.sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  }, [allGames]);

  const filtresActifs = compterFiltresActifs(filters);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Filtres</h2>

        <SearchBar
          value={filters.recherche}
          onChange={setRecherche}
          games={allGames}
        />

        {/* Bouton d'ouverture du panneau (mobile) */}
        <button
          type="button"
          onClick={() => setPanneauOuvert(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ⚙️ Filtres avancés
          {filtresActifs > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
              {filtresActifs}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel
          filters={filters}
          series={series}
          onToggleSerie={toggleSerie}
          onToggleDifficulte={toggleDifficulte}
          onToggleStatut={toggleStatut}
          onDureeMaxChange={setDureeMax}
          onReset={resetFilters}
          isOpen={panneauOuvert}
          onClose={() => setPanneauOuvert(false)}
        />

        {/* Résultats filtrés */}
        <div className="flex flex-col gap-4">
          <p
            aria-live="polite"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {resultCount} résultat{resultCount > 1 ? 's' : ''}
          </p>

          {filteredGames.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Aucun jeu ne correspond aux filtres sélectionnés.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredGames.map((game) => (
                <li key={game.id}>
                  <GameCard game={game} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default FiltersScreen;
