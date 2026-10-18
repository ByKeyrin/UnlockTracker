import { useMemo } from 'react';
import type { UnlockGame } from '../../types';

/**
 * Props du composant {@link StatsCards}.
 */
export interface StatsCardsProps {
  /** Collection complète des jeux à analyser. */
  games: UnlockGame[];
}

/** Carte de statistique affichée dans la grille. */
interface StatCard {
  /** Libellé de la statistique. */
  label: string;
  /** Valeur comptée. */
  valeur: number;
  /** Classes Tailwind du bandeau coloré de la carte. */
  accentClass: string;
}

/**
 * Affiche les quatre cartes de statistiques de la collection (total, joués,
 * en cours, non joués) ainsi que la progression globale en pourcentage.
 *
 * @param props - Props du composant
 * @example
 * <StatsCards games={allGames} />
 */
export function StatsCards({ games }: StatsCardsProps) {
  const stats = useMemo(() => {
    const total = games.length;
    const joues = games.filter((game) => game.statut === 'termine').length;
    const enCours = games.filter((game) => game.statut === 'en_cours').length;
    const nonJoues = games.filter((game) => game.statut === 'non_joue').length;
    const progression = total === 0 ? 0 : Math.round((joues / total) * 100);
    return { total, joues, enCours, nonJoues, progression };
  }, [games]);

  const cartes: StatCard[] = [
    {
      label: 'Total jeux',
      valeur: stats.total,
      accentClass: 'border-l-indigo-500',
    },
    {
      label: 'Joués',
      valeur: stats.joues,
      accentClass: 'border-l-green-500',
    },
    {
      label: 'En cours',
      valeur: stats.enCours,
      accentClass: 'border-l-amber-500',
    },
    {
      label: 'Non joués',
      valeur: stats.nonJoues,
      accentClass: 'border-l-slate-400',
    },
  ];

  return (
    <section aria-label="Statistiques de la collection" className="flex flex-col gap-4">
      {/* Cartes de compteurs */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cartes.map((carte) => (
          <li
            key={carte.label}
            className={`rounded-lg border border-slate-200 border-l-4 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${carte.accentClass}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {carte.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {carte.valeur}
            </p>
          </li>
        ))}
      </ul>

      {/* Progression globale */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <span>Progression</span>
          <span>{stats.progression} %</span>
        </div>
        <div
          role="progressbar"
          aria-label="Progression de la collection"
          aria-valuenow={stats.progression}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
            style={{ width: `${stats.progression}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {stats.joues} jeu{stats.joues > 1 ? 'x' : ''} terminé
          {stats.joues > 1 ? 's' : ''} sur {stats.total}
        </p>
      </div>
    </section>
  );
}

export default StatsCards;
