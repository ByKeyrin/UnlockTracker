import { useMemo } from 'react';
import type { GamesByProfil } from '../../hooks/useProfile';
import type { Profil, ProfilId, UnlockGame } from '../../types';

/** Couleur de la barre de progression par profil. */
const PROFIL_BARRES: Record<ProfilId, string> = {
  kevin: 'bg-indigo-500',
  copine: 'bg-rose-400',
};

/** Statistiques calculées pour un profil. */
interface StatistiquesProfil {
  /** Nombre de jeux terminés par le profil. */
  joues: number;
  /** Nombre de jeux en cours. */
  enCours: number;
  /** Total de jeux suivis par le profil. */
  total: number;
  /** Pourcentage de progression (jeux terminés / total). */
  progression: number;
  /** Minutes de jeu cumulées sur les jeux terminés. */
  minutesJouees: number;
}

/**
 * Props du composant {@link ProfileStats}.
 */
export interface ProfileStatsProps {
  /** Liste des profils à comparer. */
  profils: Profil[];
  /** Profil actuellement sélectionné. */
  profilActif: Profil;
  /** Jeux suivis par chaque profil. */
  gamesByProfil: GamesByProfil;
}

/**
 * Affiche les statistiques séparées de chaque profil (jeux joués, en cours,
 * progression, minutes jouées), indique qui a joué le plus et compare les
 * progressions avec une barre de progression comparative.
 *
 * @param props - Props du composant
 * @example
 * <ProfileStats profils={profils} profilActif={profilActif} gamesByProfil={gamesByProfil} />
 */
export function ProfileStats({
  profils,
  profilActif,
  gamesByProfil,
}: ProfileStatsProps) {
  const statsByProfil = useMemo(() => {
    const result: Record<string, StatistiquesProfil> = {};
    for (const profil of profils) {
      result[profil.id] = calculerStats(gamesByProfil[profil.id] ?? []);
    }
    return result;
  }, [profils, gamesByProfil]);

  const totalJoues = profils.reduce(
    (somme, profil) => somme + statsByProfil[profil.id].joues,
    0,
  );

  // Qui a joué le plus ? (égalité si les deux profils ont le même total)
  const leader = useMemo(() => {
    if (profils.length < 2) return null;
    const [premier, second] = profils;
    const scorePremier = statsByProfil[premier.id].joues;
    const scoreSecond = statsByProfil[second.id].joues;
    if (scorePremier === scoreSecond) return null;
    return scorePremier > scoreSecond ? premier : second;
  }, [profils, statsByProfil]);

  return (
    <section
      aria-label="Statistiques par profil"
      data-testid="profile-stats"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Statistiques par profil
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Profil actif : {profilActif.avatar} {profilActif.nom}
        </p>
      </div>

      {/* Cartes de statistiques par profil */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profils.map((profil) => {
          const stats = statsByProfil[profil.id];
          const estActif = profil.id === profilActif.id;
          return (
            <li
              key={profil.id}
              className={`rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-900 ${
                estActif
                  ? 'border-indigo-400 ring-1 ring-indigo-300 dark:border-indigo-600'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <span aria-hidden="true" className="text-xl">
                  {profil.avatar}
                </span>
                {profil.nom}
                {estActif && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Profil actif
                  </span>
                )}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">
                    Jeux joués
                  </dt>
                  <dd className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.joues}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">
                    En cours
                  </dt>
                  <dd className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.enCours}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">
                    Progression
                  </dt>
                  <dd className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.progression} %
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">
                    Minutes jouées
                  </dt>
                  <dd className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {stats.minutesJouees}
                  </dd>
                </div>
              </dl>
              <div
                role="progressbar"
                aria-label={`Progression de ${profil.nom}`}
                aria-valuenow={stats.progression}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${PROFIL_BARRES[profil.id]}`}
                  style={{ width: `${stats.progression}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Comparaison : qui a joué le plus ? */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Comparaison
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          {leader === null
            ? '🏆 Égalité parfaite entre les deux profils !'
            : `🏆 ${leader.avatar} ${leader.nom} a joué le plus avec ${
                statsByProfil[leader.id].joues
              } jeu${statsByProfil[leader.id].joues > 1 ? 'x' : ''} terminé${
                statsByProfil[leader.id].joues > 1 ? 's' : ''
              }.`}
        </p>

        {/* Barre de progression comparative */}
        <div
          role="img"
          aria-label="Répartition comparative des jeux terminés par profil"
          data-testid="profile-comparison"
          className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        >
          {profils.map((profil) => {
            const stats = statsByProfil[profil.id];
            const part =
              totalJoues === 0 ? 0 : (stats.joues / totalJoues) * 100;
            return (
              <div
                key={profil.id}
                className={`h-full transition-[width] duration-300 ${PROFIL_BARRES[profil.id]}`}
                style={{ width: `${part}%` }}
              />
            );
          })}
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {profils.map((profil) => {
            const stats = statsByProfil[profil.id];
            const part =
              totalJoues === 0
                ? 0
                : Math.round((stats.joues / totalJoues) * 100);
            return (
              <li key={profil.id} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`inline-block h-2.5 w-2.5 rounded-full ${PROFIL_BARRES[profil.id]}`}
                />
                {profil.nom} : {stats.joues} jeu{stats.joues > 1 ? 'x' : ''} (
                {part} %)
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * Calcule les statistiques d'un profil à partir de sa collection de jeux.
 *
 * @param games - Collection de jeux du profil
 * @returns Les compteurs et le pourcentage de progression du profil
 */
function calculerStats(games: UnlockGame[]): StatistiquesProfil {
  const total = games.length;
  const joues = games.filter((game) => game.statut === 'termine').length;
  const enCours = games.filter((game) => game.statut === 'en_cours').length;
  const progression = total === 0 ? 0 : Math.round((joues / total) * 100);
  const minutesJouees = games
    .filter((game) => game.statut === 'termine')
    .reduce((somme, game) => somme + game.duree, 0);
  return { joues, enCours, total, progression, minutesJouees };
}

export default ProfileStats;
