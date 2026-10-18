import { useMemo, useState } from 'react';
import type { FiltreStatut } from '../../hooks/useGames';
import type { UnlockGame } from '../../types';
import { STATUT_ICONS, STATUT_LABELS, formatDate } from './trackingUtils';

/** Boutons de filtre par statut affichés au-dessus de l'historique. */
const FILTRES: { id: FiltreStatut; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'non_joue', label: 'Non joués' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'termine', label: 'Terminés' },
];

/** Classes Tailwind du badge selon le statut. */
const STATUT_CLASSES: Record<UnlockGame['statut'], string> = {
  non_joue: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  en_cours: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  termine: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

/**
 * Props du composant {@link GameHistory}.
 */
export interface GameHistoryProps {
  /** Collection complète des jeux à afficher dans l'historique. */
  games: UnlockGame[];
  /** Callback déclenché pour réinitialiser un jeu en « non joué ». */
  onReset: (gameId: string) => void;
}

/**
 * Affiche l'historique complet des jeux avec filtrage par statut et un bouton
 * « Réinitialiser » qui remet chaque jeu au statut « non joué ».
 *
 * @param props - Props du composant
 * @example
 * <GameHistory games={allGames} onReset={handleReset} />
 */
export function GameHistory({ games, onReset }: GameHistoryProps) {
  const [filtre, setFiltre] = useState<FiltreStatut>('tous');

  const visibleGames = useMemo(() => {
    return games
      .filter((game) => filtre === 'tous' || game.statut === filtre)
      .sort((a, b) =>
        a.serie.localeCompare(b.serie, 'fr', { numeric: true }) ||
        a.numero - b.numero,
      );
  }, [games, filtre]);

  return (
    <section
      aria-label="Historique des jeux"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-xl font-semibold">Historique</h2>

      {/* Filtres par statut */}
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Statut
        </legend>
        {FILTRES.map((filtreOption) => {
          const isActive = filtre === filtreOption.id;
          return (
            <button
              key={filtreOption.id}
              type="button"
              onClick={() => setFiltre(filtreOption.id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white'
                  : 'rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }
            >
              {filtreOption.label}
            </button>
          );
        })}
      </fieldset>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        {visibleGames.length} jeu{visibleGames.length > 1 ? 'x' : ''} dans
        l'historique
      </p>

      {visibleGames.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucun jeu avec ce statut.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleGames.map((game) => {
            const isResettable = game.statut !== 'non_joue';
            return (
              <li
                key={game.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span aria-hidden="true" className="text-sm">
                    {STATUT_ICONS[game.statut]}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {game.nom}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Série {game.serie} · n°{game.numero}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_CLASSES[game.statut]}`}
                  >
                    {STATUT_LABELS[game.statut]}
                  </span>
                  {game.statut === 'termine' && (
                    <time
                      dateTime={game.dateFin}
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      Terminé le {formatDate(game.dateFin)}
                    </time>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!isResettable}
                  onClick={() => onReset(game.id)}
                  className="shrink-0 self-start rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-auto"
                >
                  Réinitialiser
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default GameHistory;
