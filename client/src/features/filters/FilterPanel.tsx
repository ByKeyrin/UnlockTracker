import type { FiltreDifficulte, FiltreStatut, FiltresAvances } from '../../hooks/useFilters';
import { DUREES_FILTRE } from '../../hooks/useFilters';

/** Libellés affichés pour chaque statut de jeu. */
const STATUT_LABELS: Record<FiltreStatut, string> = {
  non_joue: 'Non joué',
  en_cours: 'En cours',
  termine: 'Terminé',
};

/** Difficultés proposées dans le filtre. */
const DIFFICULTES: FiltreDifficulte[] = [1, 2, 3];

/**
 * Props du composant {@link FilterPanel}.
 */
export interface FilterPanelProps {
  /** État courant des filtres. */
  filters: FiltresAvances;
  /** Séries disponibles dans la collection. */
  series: string[];
  /** Callback déclenché pour cocher/décocher une série. */
  onToggleSerie: (serie: string) => void;
  /** Callback déclenché pour cocher/décocher une difficulté. */
  onToggleDifficulte: (difficulte: FiltreDifficulte) => void;
  /** Callback déclenché pour cocher/décocher un statut. */
  onToggleStatut: (statut: FiltreStatut) => void;
  /** Callback déclenché au changement de durée maximale. */
  onDureeMaxChange: (duree: number | null) => void;
  /** Callback déclenché pour réinitialiser tous les filtres. */
  onReset: () => void;
  /** Ouverture du panneau en modal (mobile uniquement). */
  isOpen?: boolean;
  /** Callback déclenché pour fermer la modal mobile. */
  onClose?: () => void;
}

/**
 * Panneau de filtres avancés : série (cases à cocher), difficulté (1–3),
 * statut, durée maximale et bouton de réinitialisation.
 *
 * Responsive : panneau latéral permanent sur desktop (`lg:`), modal plein
 * écran sur mobile (contrôlée par `isOpen` / `onClose`).
 *
 * @param props - Props du composant
 * @example
 * <FilterPanel filters={filters} series={series} onToggleSerie={toggleSerie} … />
 */
export function FilterPanel({
  filters,
  series,
  onToggleSerie,
  onToggleDifficulte,
  onToggleStatut,
  onDureeMaxChange,
  onReset,
  isOpen = false,
  onClose,
}: FilterPanelProps) {
  return (
    <>
      {/* Panneau latéral (desktop) */}
      <aside className="hidden lg:block">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FilterFields
            filters={filters}
            series={series}
            onToggleSerie={onToggleSerie}
            onToggleDifficulte={onToggleDifficulte}
            onToggleStatut={onToggleStatut}
            onDureeMaxChange={onDureeMaxChange}
            onReset={onReset}
          />
        </div>
      </aside>

      {/* Modal (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtres avancés"
          onClick={onClose}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtres</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
            <FilterFields
              filters={filters}
              series={series}
              onToggleSerie={onToggleSerie}
              onToggleDifficulte={onToggleDifficulte}
              onToggleStatut={onToggleStatut}
              onDureeMaxChange={onDureeMaxChange}
              onReset={onReset}
            />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Contenu du panneau de filtres (partagé entre le panneau latéral desktop et
 * la modal mobile).
 *
 * @param props - Mêmes props que {@link FilterPanel}, sans `isOpen`/`onClose`
 */
function FilterFields({
  filters,
  series,
  onToggleSerie,
  onToggleDifficulte,
  onToggleStatut,
  onDureeMaxChange,
  onReset,
}: Omit<FilterPanelProps, 'isOpen' | 'onClose'>) {
  return (
    <div className="flex flex-col gap-5">
      {/* Filtre par série (cases à cocher multiples) */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Série
        </legend>
        <div className="flex flex-wrap gap-2">
          {series.map((serie) => (
            <label
              key={serie}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:has-[:checked]:border-indigo-400 dark:has-[:checked]:bg-indigo-900/30 dark:has-[:checked]:text-indigo-300"
            >
              <input
                type="checkbox"
                checked={filters.series.includes(serie)}
                onChange={() => onToggleSerie(serie)}
                className="h-4 w-4 accent-indigo-600"
              />
              Série {serie}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Filtre par difficulté (1–3, multi-sélection) */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Difficulté
        </legend>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTES.map((difficulte) => (
            <label
              key={difficulte}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:has-[:checked]:border-indigo-400 dark:has-[:checked]:bg-indigo-900/30 dark:has-[:checked]:text-indigo-300"
            >
              <input
                type="checkbox"
                checked={filters.difficultes.includes(difficulte)}
                onChange={() => onToggleDifficulte(difficulte)}
                className="h-4 w-4 accent-indigo-600"
              />
              <span aria-label={`Difficulté ${difficulte} sur 3`}>
                {'⭐'.repeat(difficulte)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Filtre par statut (multi-sélection) */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Statut
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUT_LABELS) as FiltreStatut[]).map((statut) => (
            <label
              key={statut}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:has-[:checked]:border-indigo-400 dark:has-[:checked]:bg-indigo-900/30 dark:has-[:checked]:text-indigo-300"
            >
              <input
                type="checkbox"
                checked={filters.statuts.includes(statut)}
                onChange={() => onToggleStatut(statut)}
                className="h-4 w-4 accent-indigo-600"
              />
              {STATUT_LABELS[statut]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Filtre par durée maximale */}
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Durée maximale
        <select
          value={filters.dureeMax ?? ''}
          onChange={(event) =>
            onDureeMaxChange(
              event.target.value === '' ? null : Number(event.target.value),
            )
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Toutes les durées</option>
          {DUREES_FILTRE.map((duree) => (
            <option key={duree} value={duree}>
              ≤ {duree} min
            </option>
          ))}
        </select>
      </label>

      {/* Bouton de réinitialisation */}
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}

export default FilterPanel;
