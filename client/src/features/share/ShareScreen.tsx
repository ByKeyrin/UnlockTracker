import { useMemo } from 'react';
import { useGames } from '../../hooks/useGames';
import { SharedList } from './SharedList';

/**
 * Écran de partage : vue d'ensemble de la collection unique (aventures
 * jouées, en cours, progression) et liste simple des jeux terminés.
 *
 * @example
 * <ShareScreen />
 */
export function ShareScreen() {
  const { allGames } = useGames();

  // Vue d'ensemble de la collection partagée.
  const apercu = useMemo(() => {
    const total = allGames.length;
    const joues = allGames.filter((game) => game.statut === 'termine').length;
    const enCours = allGames.filter(
      (game) => game.statut === 'en_cours',
    ).length;
    return {
      total,
      joues,
      enCours,
      progression: total === 0 ? 0 : Math.round((joues / total) * 100),
    };
  }, [allGames]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Partage</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Notre collection Unlock! : suivez nos parties et retrouvez la liste
          des aventures terminées.
        </p>
      </section>

      {/* Vue d'ensemble de la collection */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Aventures
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.total}
          </p>
        </li>
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-green-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Jeux joués
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.joues}
          </p>
        </li>
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            En cours
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.enCours}
          </p>
        </li>
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Progression
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.progression} %
          </p>
        </li>
      </ul>

      <SharedList games={allGames} />
    </div>
  );
}

export default ShareScreen;
