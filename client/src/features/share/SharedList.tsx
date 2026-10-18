import { useMemo } from 'react';
import type { UnlockGame } from '../../types';

/**
 * Props du composant {@link SharedList}.
 */
export interface SharedListProps {
  /** Collection complète des jeux suivis. */
  games: UnlockGame[];
}

/**
 * Affiche la liste simple des jeux joués (statut `termine`) de la collection.
 *
 * @param props - Props du composant
 * @example
 * <SharedList games={games} />
 */
export function SharedList({ games }: SharedListProps) {
  const joues = useMemo(
    () =>
      games
        .filter((game) => game.statut === 'termine')
        .sort(
          (a, b) =>
            (b.dateFin ?? '').localeCompare(a.dateFin ?? '') ||
            a.nom.localeCompare(b.nom, 'fr'),
        ),
    [games],
  );

  return (
    <section
      aria-label="Jeux joués"
      data-testid="shared-list"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Liste des jeux joués
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {joues.length} jeu{joues.length > 1 ? 'x' : ''} terminé
          {joues.length > 1 ? 's' : ''} sur {games.length}.
        </p>
      </div>

      {joues.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Aucun jeu terminé pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {joues.map((game) => (
            <li
              key={game.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {game.nom}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Série {game.serie} · {game.theme}
                </span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
                ✅ {game.dateFin ? `Terminé le ${game.dateFin}` : 'Terminé'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SharedList;
