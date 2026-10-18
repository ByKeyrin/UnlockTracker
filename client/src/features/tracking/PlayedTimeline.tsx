import { useMemo } from 'react';
import type { UnlockGame } from '../../types';
import { STATUT_ICONS, formatDate } from './trackingUtils';

/**
 * Props du composant {@link PlayedTimeline}.
 */
export interface PlayedTimelineProps {
  /** Collection complète des jeux dont on extrait la chronologie. */
  games: UnlockGame[];
}

/**
 * Affiche la chronologie des jeux terminés, triés du plus récent au plus
 * ancien selon leur date de fin de partie, avec l'icône de statut.
 *
 * @param props - Props du composant
 * @example
 * <PlayedTimeline games={allGames} />
 */
export function PlayedTimeline({ games }: PlayedTimelineProps) {
  const timeline = useMemo(() => {
    return games
      .filter((game) => game.statut === 'termine')
      .sort((a, b) => {
        // Les jeux sans date de fin sont classés en dernier.
        const dateA = a.dateFin ?? '';
        const dateB = b.dateFin ?? '';
        return dateB.localeCompare(dateA) || a.nom.localeCompare(b.nom, 'fr');
      });
  }, [games]);

  return (
    <section
      aria-label="Chronologie des jeux joués"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-xl font-semibold">Chronologie des parties</h2>

      {timeline.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucune partie terminée pour le moment. Lancez un jeu depuis le
          catalogue pour le voir apparaître ici !
        </p>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l-2 border-slate-200 pl-6 dark:border-slate-700">
          {timeline.map((game) => (
            <li key={game.id} className="relative">
              {/* Pastille de statut sur la ligne de temps */}
              <span
                aria-hidden="true"
                className="absolute -left-[1.95rem] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {STATUT_ICONS[game.statut]}
              </span>

              <article className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {game.nom}
                  </h3>
                  <span
                    aria-label={`Statut : ${game.statut === 'termine' ? 'Terminé' : game.statut}`}
                    className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
                  >
                    Terminé
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Série {game.serie} · n°{game.numero} · {game.theme} · Joué le{' '}
                  <time dateTime={game.dateFin}>{formatDate(game.dateFin)}</time>
                </p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default PlayedTimeline;
